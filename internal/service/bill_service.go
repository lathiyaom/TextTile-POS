package service

import (
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/TextTile/pos-go/internal/model"
	"github.com/TextTile/pos-go/internal/repository"
	"gorm.io/gorm"
)

type BillService interface {
	CreateBill(userID uint, req *model.BillCreateRequest) (*model.Bill, error)
	GetAllBills(page, pageSize int, filters map[string]interface{}) ([]model.Bill, int64, error)
	GetBillByID(id uint) (*model.Bill, error)
	UpdateBill(id, userID uint, req *model.BillUpdateRequest) (*model.Bill, error)
	DeleteBill(id uint) error
	CancelBill(id, userID uint, reason string) (*model.Bill, error)
	RecordPrint(id, userID uint) (*model.Bill, error)
	GetChangeLog(billID uint) ([]model.BillChangeLog, error)
}

type billService struct {
	billRepo     repository.BillRepository
	vendorRepo   repository.VendorRepository
	settingsRepo repository.POSSettingsRepository
}

func NewBillService(
	billRepo repository.BillRepository,
	vendorRepo repository.VendorRepository,
	settingsRepo repository.POSSettingsRepository,
) BillService {
	return &billService{
		billRepo:     billRepo,
		vendorRepo:   vendorRepo,
		settingsRepo: settingsRepo,
	}
}

func (s *billService) CreateBill(userID uint, req *model.BillCreateRequest) (*model.Bill, error) {
	// Get settings
	settings, err := s.settingsRepo.Get()
	if err != nil {
		return nil, errors.New("failed to load POS settings")
	}

	// Validate vendor
	vendor, err := s.vendorRepo.FindByID(req.VendorID)
	if err != nil {
		return nil, err
	}

	if vendor.Status != model.VendorStatusActive {
		return nil, errors.New("cannot create bill for inactive vendor")
	}

	// Parse bill date
	billDate, err := time.Parse("2006-01-02", req.BillDate)
	if err != nil {
		return nil, errors.New("invalid bill date format, use YYYY-MM-DD")
	}

	// Determine financial year
	financialYear := s.getFinancialYear(billDate, settings.FinancialYearStartDate)

	// Generate bill number
	billNumber, err := s.billRepo.GenerateBillNumber(financialYear, settings.BillNumberPrefix, settings.BillNumberLength)
	if err != nil {
		return nil, errors.New("failed to generate bill number")
	}

	// Calculate bill totals
	bill := &model.Bill{
		BillNumber:    billNumber,
		BillDate:      billDate,
		FinancialYear: financialYear,
		VendorID:      req.VendorID,
		PaymentTypeID: req.PaymentTypeID,
		DiscountType:  model.DiscountType(req.DiscountType),
		CreatedBy:     userID,
	}

	// Set discount values
	if req.DiscountType == string(model.DiscountTypePercentage) {
		bill.DiscountPercentage = req.DiscountPercentage
	} else if req.DiscountType == string(model.DiscountTypeAmount) {
		bill.DiscountAmount = req.DiscountAmount
	}

	// Calculate line items and totals
	if err := s.calculateBillTotals(bill, req.Items, vendor, settings, req.RoundOffAmount); err != nil {
		return nil, err
	}

	// Handle advance payment
	bill.AdvanceAmountPaid = req.AdvanceAmountPaid
	if req.AdvanceAmountPaid > 0 {
		if req.PaymentModeID == nil {
			return nil, errors.New("payment mode is required when advance amount is paid")
		}
		bill.PaymentModeID = req.PaymentModeID
	}
	bill.PaymentRemarks = req.PaymentRemarks

	// Calculate amount due
	bill.AmountDue = math.Max(0, bill.GrandTotal-bill.AdvanceAmountPaid)

	// Set payment status
	bill.PaymentStatus = s.determinePaymentStatus(bill.AdvanceAmountPaid, bill.AmountDue, bill.GrandTotal)

	// Set next payment due date
	if req.NextPaymentDueDate != nil && *req.NextPaymentDueDate != "" {
		dueDate, err := time.Parse("2006-01-02", *req.NextPaymentDueDate)
		if err == nil {
			bill.NextPaymentDueDate = &dueDate
		}
	} else if bill.AmountDue > 0 {
		// Auto-calculate based on default payment terms
		dueDate := billDate.AddDate(0, 0, settings.DefaultPaymentTermsDays)
		bill.NextPaymentDueDate = &dueDate
	}

	// Check E-Way bill requirement
	if bill.GrandTotal >= settings.EWayBillThresholdAmount {
		bill.EWayRequired = true
	}

	// Create bill in transaction
	if err := s.billRepo.Create(bill); err != nil {
		return nil, err
	}

	// Create bill items
	var billItems []model.BillItem
	for _, itemReq := range req.Items {
		lineTotal := itemReq.Quantity * itemReq.Rate
		billItems = append(billItems, model.BillItem{
			BillID:        bill.ID,
			ItemName:      itemReq.ItemName,
			ItemCategory:  itemReq.ItemCategory,
			Quantity:      itemReq.Quantity,
			Unit:          itemReq.Unit,
			Rate:          itemReq.Rate,
			LineTotal:     s.roundToDecimals(lineTotal, 2),
			GSTPercentage: itemReq.GSTPercentage,
		})
	}

	if err := s.billRepo.CreateItems(billItems); err != nil {
		return nil, err
	}

	// Update vendor statistics
	vendor.TotalBills++
	vendor.TotalAmount += bill.GrandTotal
	vendor.BalanceDue += bill.AmountDue
	if bill.AdvanceAmountPaid > 0 {
		vendor.TotalPaid += bill.AdvanceAmountPaid
	}
	if err := s.vendorRepo.Update(vendor); err != nil {
		return nil, err
	}

	// Reload bill with associations
	return s.billRepo.GetByID(bill.ID)
}

func (s *billService) calculateBillTotals(
	bill *model.Bill,
	items []model.BillItemCreateRequest,
	vendor *model.Vendor,
	settings *model.POSSettings,
	customRoundOff *float64,
) error {
	if len(items) == 0 {
		return errors.New("at least one item is required")
	}

	// Calculate subtotal
	var subtotal float64
	for _, item := range items {
		lineTotal := item.Quantity * item.Rate
		subtotal += lineTotal
	}
	bill.Subtotal = s.roundToDecimals(subtotal, 2)

	// Calculate discount
	if bill.DiscountType == model.DiscountTypePercentage {
		bill.DiscountAmount = s.roundToDecimals((bill.Subtotal * bill.DiscountPercentage / 100), 2)
	}

	// Calculate taxable amount
	bill.TaxableAmount = s.roundToDecimals(bill.Subtotal-bill.DiscountAmount, 2)

	// Calculate GST
	if err := s.calculateGST(bill, items, vendor, settings); err != nil {
		return err
	}

	// Calculate raw grand total
	bill.RawGrandTotal = s.roundToDecimals(bill.TaxableAmount+bill.TotalGSTAmount, 2)

	// Calculate round-off
	if settings.EnableBillRoundOff {
		if customRoundOff != nil && settings.AllowPerBillRoundOffOverride {
			// Use custom round-off provided by user
			bill.RoundOffAmount = *customRoundOff
			bill.GrandTotal = s.roundToDecimals(bill.RawGrandTotal+bill.RoundOffAmount, 2)
		} else {
			// Apply rounding mode from settings
			bill.GrandTotal, bill.RoundOffAmount = s.applyRounding(bill.RawGrandTotal, settings.RoundOffMode)
		}
	} else {
		// No rounding
		bill.RoundOffAmount = 0
		bill.GrandTotal = bill.RawGrandTotal
	}

	return nil
}

func (s *billService) calculateGST(
	bill *model.Bill,
	items []model.BillItemCreateRequest,
	vendor *model.Vendor,
	settings *model.POSSettings,
) error {
	// Determine if intra-state or inter-state
	isIntraState := (vendor.State == settings.BusinessRegisteredState)

	// Calculate GST for each item and aggregate
	var totalCGST, totalSGST, totalIGST float64

	for _, item := range items {
		if item.GSTPercentage == 0 {
			continue
		}

		lineTotal := item.Quantity * item.Rate
		gstAmount := (lineTotal * item.GSTPercentage) / 100

		if isIntraState {
			// Intra-state: CGST + SGST
			totalCGST += gstAmount / 2
			totalSGST += gstAmount / 2
		} else {
			// Inter-state: IGST
			totalIGST += gstAmount
		}
	}

	bill.CGSTAmount = s.roundToDecimals(totalCGST, 2)
	bill.SGSTAmount = s.roundToDecimals(totalSGST, 2)
	bill.IGSTAmount = s.roundToDecimals(totalIGST, 2)
	bill.TotalGSTAmount = s.roundToDecimals(bill.CGSTAmount+bill.SGSTAmount+bill.IGSTAmount, 2)

	// Validate GST number for inter-state transactions
	if !isIntraState && bill.IGSTAmount > 0 && vendor.GSTNumber == "" {
		return errors.New("vendor GST number is required for inter-state transactions with GST")
	}

	return nil
}

func (s *billService) applyRounding(amount float64, mode model.RoundOffMode) (float64, float64) {
	var rounded float64

	switch mode {
	case model.RoundOffModeNearestRupee:
		rounded = math.Round(amount)
	case model.RoundOffModeRoundUp:
		rounded = math.Ceil(amount)
	case model.RoundOffModeRoundDown:
		rounded = math.Floor(amount)
	case model.RoundOffModeNearest050:
		rounded = math.Round(amount*2) / 2
	default:
		rounded = math.Round(amount)
	}

	roundOff := s.roundToDecimals(rounded-amount, 2)
	return rounded, roundOff
}

func (s *billService) roundToDecimals(value float64, decimals int) float64 {
	multiplier := math.Pow(10, float64(decimals))
	return math.Round(value*multiplier) / multiplier
}

func (s *billService) getFinancialYear(date time.Time, fyStartDate string) string {
	// Parse FY start date (MM-DD format)
	var month, day int
	fmt.Sscanf(fyStartDate, "%d-%d", &month, &day)

	fyStart := time.Date(date.Year(), time.Month(month), day, 0, 0, 0, 0, time.UTC)

	if date.Before(fyStart) {
		// Before FY start, so belongs to previous FY
		return fmt.Sprintf("%d-%02d", date.Year()-1, date.Year()%100)
	}
	// After FY start, belongs to current FY
	return fmt.Sprintf("%d-%02d", date.Year(), (date.Year()+1)%100)
}

func (s *billService) determinePaymentStatus(advancePaid, amountDue, grandTotal float64) model.PaymentStatus {
	if amountDue == 0 || advancePaid >= grandTotal {
		return model.PaymentStatusPaid
	}
	if advancePaid > 0 {
		return model.PaymentStatusPartiallyPaid
	}
	return model.PaymentStatusUnpaid
}

func (s *billService) GetAllBills(page, pageSize int, filters map[string]interface{}) ([]model.Bill, int64, error) {
	return s.billRepo.GetAll(page, pageSize, filters)
}

func (s *billService) GetBillByID(id uint) (*model.Bill, error) {
	bill, err := s.billRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("bill not found")
		}
		return nil, err
	}
	return bill, nil
}

func (s *billService) UpdateBill(id, userID uint, req *model.BillUpdateRequest) (*model.Bill, error) {
	// Implementation similar to CreateBill but with update logic
	// For brevity, returning not implemented error
	return nil, errors.New("update bill not yet implemented")
}

func (s *billService) DeleteBill(id uint) error {
	_, err := s.billRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("bill not found")
		}
		return err
	}

	return s.billRepo.Delete(id)
}

func (s *billService) CancelBill(id, userID uint, reason string) (*model.Bill, error) {
	bill, err := s.billRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("bill not found")
		}
		return nil, err
	}

	if bill.IsCancelled {
		return nil, errors.New("bill is already cancelled")
	}

	// Update bill
	now := time.Now()
	bill.IsCancelled = true
	bill.CancelledBy = &userID
	bill.CancelledReason = reason
	bill.CancelledAt = &now

	if err := s.billRepo.Update(bill); err != nil {
		return nil, err
	}

	// Reverse vendor statistics
	vendor, err := s.vendorRepo.FindByID(bill.VendorID)
	if err == nil {
		vendor.TotalBills--
		vendor.TotalAmount -= bill.GrandTotal
		vendor.BalanceDue -= bill.AmountDue
		vendor.TotalPaid -= bill.AdvanceAmountPaid
		s.vendorRepo.Update(vendor)
	}

	return bill, nil
}

func (s *billService) RecordPrint(id, userID uint) (*model.Bill, error) {
	bill, err := s.billRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("bill not found")
		}
		return nil, err
	}

	now := time.Now()
	bill.PrintedCount++
	bill.PrintedBy = &userID
	bill.LastPrintedAt = &now

	if err := s.billRepo.Update(bill); err != nil {
		return nil, err
	}

	return bill, nil
}

func (s *billService) GetChangeLog(billID uint) ([]model.BillChangeLog, error) {
	return s.billRepo.GetChangeLogsByBillID(billID)
}
