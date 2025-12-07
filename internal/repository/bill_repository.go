package repository

import (
	"fmt"
	"time"

	"github.com/TextTile/pos-go/internal/model"
	"gorm.io/gorm"
)

type BillRepository interface {
	Create(bill *model.Bill) error
	GetAll(page, pageSize int, filters map[string]interface{}) ([]model.Bill, int64, error)
	GetByID(id uint) (*model.Bill, error)
	GetByBillNumber(billNumber string) (*model.Bill, error)
	Update(bill *model.Bill) error
	Delete(id uint) error
	GenerateBillNumber(financialYear, prefix string, length int) (string, error)
	GetLastBillNumberForFY(financialYear, prefix string) (string, error)
	
	// Bill Items
	CreateItems(items []model.BillItem) error
	DeleteItemsByBillID(billID uint) error
	
	// Change Log
	CreateChangeLog(log *model.BillChangeLog) error
	GetChangeLogsByBillID(billID uint) ([]model.BillChangeLog, error)
	
	// Vendor-related queries
	GetRecentVendorIDs(days int) ([]uint, error)
	GetVendorBillCount(vendorID uint) (int, error)
}

type billRepository struct {
	db *gorm.DB
}

func NewBillRepository(db *gorm.DB) BillRepository {
	return &billRepository{db: db}
}

func (r *billRepository) Create(bill *model.Bill) error {
	return r.db.Create(bill).Error
}

func (r *billRepository) GetAll(page, pageSize int, filters map[string]interface{}) ([]model.Bill, int64, error) {
	var bills []model.Bill
	var total int64

	query := r.db.Model(&model.Bill{})

	// Apply filters
	if vendorID, ok := filters["vendor_id"].(uint); ok && vendorID > 0 {
		query = query.Where("vendor_id = ?", vendorID)
	}
	if paymentStatus, ok := filters["payment_status"].(string); ok && paymentStatus != "" {
		query = query.Where("payment_status = ?", paymentStatus)
	}
	if isCancelled, ok := filters["is_cancelled"].(bool); ok {
		query = query.Where("is_cancelled = ?", isCancelled)
	}
	if financialYear, ok := filters["financial_year"].(string); ok && financialYear != "" {
		query = query.Where("financial_year = ?", financialYear)
	}
	if search, ok := filters["search"].(string); ok && search != "" {
		query = query.Where("bill_number LIKE ?", "%"+search+"%")
	}

	// Count total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results with preloads
	offset := (page - 1) * pageSize
	if err := query.
		Preload("Vendor").
		Preload("Vendor.VendorType").
		Preload("PaymentType").
		Preload("PaymentMode").
		Preload("Items").
		Order("bill_date DESC, id DESC").
		Limit(pageSize).
		Offset(offset).
		Find(&bills).Error; err != nil {
		return nil, 0, err
	}

	return bills, total, nil
}

func (r *billRepository) GetByID(id uint) (*model.Bill, error) {
	var bill model.Bill
	if err := r.db.
		Preload("Vendor").
		Preload("Vendor.VendorType").
		Preload("Vendor.PaymentMode").
		Preload("PaymentType").
		Preload("PaymentMode").
		Preload("Items").
		First(&bill, id).Error; err != nil {
		return nil, err
	}
	return &bill, nil
}

func (r *billRepository) GetByBillNumber(billNumber string) (*model.Bill, error) {
	var bill model.Bill
	if err := r.db.Where("bill_number = ?", billNumber).First(&bill).Error; err != nil {
		return nil, err
	}
	return &bill, nil
}

func (r *billRepository) Update(bill *model.Bill) error {
	return r.db.Save(bill).Error
}

func (r *billRepository) Delete(id uint) error {
	return r.db.Delete(&model.Bill{}, id).Error
}

func (r *billRepository) GenerateBillNumber(financialYear, prefix string, length int) (string, error) {
	lastBillNumber, err := r.GetLastBillNumberForFY(financialYear, prefix)
	if err != nil && err != gorm.ErrRecordNotFound {
		return "", err
	}

	var nextNumber int = 1
	if lastBillNumber != "" {
		// Extract number from last bill number (e.g., "BNO-00001" -> 1)
		var lastNum int
		_, err := fmt.Sscanf(lastBillNumber, prefix+"%d", &lastNum)
		if err == nil {
			nextNumber = lastNum + 1
		}
	}

	// Format with leading zeros
	format := fmt.Sprintf("%%s%%0%dd", length)
	return fmt.Sprintf(format, prefix, nextNumber), nil
}

func (r *billRepository) GetLastBillNumberForFY(financialYear, prefix string) (string, error) {
	var bill model.Bill
	if err := r.db.Where("financial_year = ? AND bill_number LIKE ?", financialYear, prefix+"%").
		Order("bill_number DESC").
		First(&bill).Error; err != nil {
		return "", err
	}
	return bill.BillNumber, nil
}

func (r *billRepository) CreateItems(items []model.BillItem) error {
	if len(items) == 0 {
		return nil
	}
	return r.db.Create(&items).Error
}

func (r *billRepository) DeleteItemsByBillID(billID uint) error {
	return r.db.Where("bill_id = ?", billID).Delete(&model.BillItem{}).Error
}

func (r *billRepository) CreateChangeLog(log *model.BillChangeLog) error {
	return r.db.Create(log).Error
}

func (r *billRepository) GetChangeLogsByBillID(billID uint) ([]model.BillChangeLog, error) {
	var logs []model.BillChangeLog
	if err := r.db.Where("bill_id = ?", billID).
		Order("changed_at DESC").
		Find(&logs).Error; err != nil {
		return nil, err
	}
	return logs, nil
}

func (r *billRepository) GetRecentVendorIDs(days int) ([]uint, error) {
	var vendorIDs []uint
	cutoffDate := time.Now().AddDate(0, 0, -days)
	
	if err := r.db.Model(&model.Bill{}).
		Select("DISTINCT vendor_id").
		Where("bill_date >= ? AND is_cancelled = ?", cutoffDate, false).
		Pluck("vendor_id", &vendorIDs).Error; err != nil {
		return nil, err
	}
	
	return vendorIDs, nil
}

func (r *billRepository) GetVendorBillCount(vendorID uint) (int, error) {
	var count int64
	if err := r.db.Model(&model.Bill{}).
		Where("vendor_id = ? AND is_cancelled = ?", vendorID, false).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}
