package model

import (
	"time"

	"gorm.io/gorm"
)

// PaymentStatus represents the payment status of a bill
type PaymentStatus string

const (
	PaymentStatusPaid          PaymentStatus = "Paid"
	PaymentStatusUnpaid        PaymentStatus = "Unpaid"
	PaymentStatusPartiallyPaid PaymentStatus = "Partially Paid"
)

// DiscountType represents the type of discount applied
type DiscountType string

const (
	DiscountTypeNone       DiscountType = "None"
	DiscountTypePercentage DiscountType = "Percentage"
	DiscountTypeAmount     DiscountType = "Amount"
)

// Bill represents a bill/invoice
type Bill struct {
	ID                      uint           `gorm:"primaryKey" json:"id"`
	BillNumber              string         `gorm:"type:varchar(50);uniqueIndex;not null" json:"bill_number"`
	BillDate                time.Time      `gorm:"not null" json:"bill_date"`
	FinancialYear           string         `gorm:"type:varchar(10);not null" json:"financial_year"` // e.g., "2024-25"
	
	// Vendor Information
	VendorID                uint           `gorm:"not null;index" json:"vendor_id"`
	Vendor                  *Vendor        `gorm:"foreignKey:VendorID" json:"vendor,omitempty"`
	
	// Payment Information
	PaymentTypeID           uint           `gorm:"not null" json:"payment_type_id"`
	PaymentType             *PaymentType   `gorm:"foreignKey:PaymentTypeID" json:"payment_type,omitempty"`
	PaymentStatus           PaymentStatus  `gorm:"type:varchar(20);default:'Unpaid'" json:"payment_status"`
	
	// Line Items (stored separately in bill_items table)
	Items                   []BillItem     `gorm:"foreignKey:BillID" json:"items,omitempty"`
	
	// Calculations
	Subtotal                float64        `gorm:"type:decimal(15,2);not null" json:"subtotal"`
	DiscountType            DiscountType   `gorm:"type:varchar(20);default:'None'" json:"discount_type"`
	DiscountPercentage      float64        `gorm:"type:decimal(5,2);default:0" json:"discount_percentage"`
	DiscountAmount          float64        `gorm:"type:decimal(15,2);default:0" json:"discount_amount"`
	TaxableAmount           float64        `gorm:"type:decimal(15,2);not null" json:"taxable_amount"`
	
	// GST Breakdown
	CGSTAmount              float64        `gorm:"type:decimal(15,2);default:0" json:"cgst_amount"`
	SGSTAmount              float64        `gorm:"type:decimal(15,2);default:0" json:"sgst_amount"`
	IGSTAmount              float64        `gorm:"type:decimal(15,2);default:0" json:"igst_amount"`
	TotalGSTAmount          float64        `gorm:"type:decimal(15,2);default:0" json:"total_gst_amount"`
	
	// Round-off & Grand Total
	RawGrandTotal           float64        `gorm:"type:decimal(15,2);not null" json:"raw_grand_total"`
	RoundOffAmount          float64        `gorm:"type:decimal(10,2);default:0" json:"round_off_amount"`
	GrandTotal              float64        `gorm:"type:decimal(15,2);not null" json:"grand_total"`
	
	// Advance/Partial Payment
	AdvanceAmountPaid       float64        `gorm:"type:decimal(15,2);default:0" json:"advance_amount_paid"`
	PaymentModeID           *uint          `json:"payment_mode_id"`
	PaymentMode             *PaymentMode   `gorm:"foreignKey:PaymentModeID" json:"payment_mode,omitempty"`
	NextPaymentDueDate      *time.Time     `json:"next_payment_due_date"`
	PaymentRemarks          string         `gorm:"type:varchar(500)" json:"payment_remarks"`
	AmountDue               float64        `gorm:"type:decimal(15,2);not null" json:"amount_due"`
	
	// E-Way Bill
	EWayRequired            bool           `gorm:"default:false" json:"eway_required"`
	EWayBillNumber          string         `gorm:"type:varchar(50)" json:"eway_bill_number"`
	
	// Audit Trail
	CreatedBy               uint           `gorm:"not null" json:"created_by"`
	CreatedAt               time.Time      `json:"created_at"`
	ModifiedBy              *uint          `json:"modified_by"`
	ModifiedAt              *time.Time     `json:"modified_at"`
	PrintedBy               *uint          `json:"printed_by"`
	PrintedCount            int            `gorm:"default:0" json:"printed_count"`
	LastPrintedAt           *time.Time     `json:"last_printed_at"`
	CancelledBy             *uint          `json:"cancelled_by"`
	CancelledReason         string         `gorm:"type:text" json:"cancelled_reason"`
	CancelledAt             *time.Time     `json:"cancelled_at"`
	IsCancelled             bool           `gorm:"default:false" json:"is_cancelled"`
	
	DeletedAt               gorm.DeletedAt `gorm:"index" json:"-"`
}

// BillItem represents a line item in a bill
type BillItem struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	BillID           uint           `gorm:"not null;index" json:"bill_id"`
	ItemName         string         `gorm:"type:varchar(255);not null" json:"item_name"`
	ItemCategory     string         `gorm:"type:varchar(100)" json:"item_category"` // For textile GST defaults
	Quantity         float64        `gorm:"type:decimal(10,2);not null" json:"quantity"`
	Unit             string         `gorm:"type:varchar(50);not null" json:"unit"`
	Rate             float64        `gorm:"type:decimal(15,2);not null" json:"rate"`
	LineTotal        float64        `gorm:"type:decimal(15,2);not null" json:"line_total"`
	GSTPercentage    float64        `gorm:"type:decimal(5,2);default:0" json:"gst_percentage"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

// BillChangeLog represents changes made to a bill
type BillChangeLog struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	BillID      uint      `gorm:"not null;index" json:"bill_id"`
	FieldName   string    `gorm:"type:varchar(100);not null" json:"field_name"`
	OldValue    string    `gorm:"type:text" json:"old_value"`
	NewValue    string    `gorm:"type:text" json:"new_value"`
	ChangedBy   uint      `gorm:"not null" json:"changed_by"`
	ChangedAt   time.Time `json:"changed_at"`
}

// BillCreateRequest represents the request body for creating a bill
type BillCreateRequest struct {
	BillDate           string                  `json:"bill_date" binding:"required"`
	VendorID           uint                    `json:"vendor_id" binding:"required"`
	PaymentTypeID      uint                    `json:"payment_type_id" binding:"required"`
	Items              []BillItemCreateRequest `json:"items" binding:"required,min=1,dive"`
	DiscountType       string                  `json:"discount_type" binding:"omitempty,oneof=None Percentage Amount"`
	DiscountPercentage float64                 `json:"discount_percentage" binding:"omitempty,min=0,max=100"`
	DiscountAmount     float64                 `json:"discount_amount" binding:"omitempty,min=0"`
	RoundOffAmount     *float64                `json:"round_off_amount"`
	AdvanceAmountPaid  float64                 `json:"advance_amount_paid" binding:"omitempty,min=0"`
	PaymentModeID      *uint                   `json:"payment_mode_id"`
	NextPaymentDueDate *string                 `json:"next_payment_due_date"`
	PaymentRemarks     string                  `json:"payment_remarks" binding:"omitempty,max=500"`
}

// BillItemCreateRequest represents a line item in bill creation
type BillItemCreateRequest struct {
	ItemName      string  `json:"item_name" binding:"required,min=1,max=255"`
	ItemCategory  string  `json:"item_category" binding:"omitempty,max=100"`
	Quantity      float64 `json:"quantity" binding:"required,gt=0"`
	Unit          string  `json:"unit" binding:"required,min=1,max=50"`
	Rate          float64 `json:"rate" binding:"required,gt=0"`
	GSTPercentage float64 `json:"gst_percentage" binding:"omitempty,min=0,max=100"`
}

// BillUpdateRequest represents the request body for updating a bill
type BillUpdateRequest struct {
	BillDate           *string                 `json:"bill_date"`
	VendorID           *uint                   `json:"vendor_id"`
	PaymentTypeID      *uint                   `json:"payment_type_id"`
	Items              []BillItemCreateRequest `json:"items" binding:"omitempty,dive"`
	DiscountType       string                  `json:"discount_type" binding:"omitempty,oneof=None Percentage Amount"`
	DiscountPercentage *float64                `json:"discount_percentage" binding:"omitempty,min=0,max=100"`
	DiscountAmount     *float64                `json:"discount_amount" binding:"omitempty,min=0"`
	RoundOffAmount     *float64                `json:"round_off_amount"`
	AdvanceAmountPaid  *float64                `json:"advance_amount_paid" binding:"omitempty,min=0"`
	PaymentModeID      *uint                   `json:"payment_mode_id"`
	NextPaymentDueDate *string                 `json:"next_payment_due_date"`
	PaymentRemarks     string                  `json:"payment_remarks" binding:"omitempty,max=500"`
}

// BillResponse represents the bill response
type BillResponse struct {
	ID                 uint                  `json:"id"`
	BillNumber         string                `json:"bill_number"`
	BillDate           time.Time             `json:"bill_date"`
	FinancialYear      string                `json:"financial_year"`
	Vendor             *VendorResponse       `json:"vendor,omitempty"`
	PaymentType        *PaymentTypeResponse  `json:"payment_type,omitempty"`
	PaymentStatus      PaymentStatus         `json:"payment_status"`
	Items              []BillItemResponse    `json:"items,omitempty"`
	Subtotal           float64               `json:"subtotal"`
	DiscountType       DiscountType          `json:"discount_type"`
	DiscountPercentage float64               `json:"discount_percentage"`
	DiscountAmount     float64               `json:"discount_amount"`
	TaxableAmount      float64               `json:"taxable_amount"`
	CGSTAmount         float64               `json:"cgst_amount"`
	SGSTAmount         float64               `json:"sgst_amount"`
	IGSTAmount         float64               `json:"igst_amount"`
	TotalGSTAmount     float64               `json:"total_gst_amount"`
	RawGrandTotal      float64               `json:"raw_grand_total"`
	RoundOffAmount     float64               `json:"round_off_amount"`
	GrandTotal         float64               `json:"grand_total"`
	AdvanceAmountPaid  float64               `json:"advance_amount_paid"`
	PaymentMode        *PaymentModeResponse  `json:"payment_mode,omitempty"`
	NextPaymentDueDate *time.Time            `json:"next_payment_due_date"`
	PaymentRemarks     string                `json:"payment_remarks"`
	AmountDue          float64               `json:"amount_due"`
	EWayRequired       bool                  `json:"eway_required"`
	EWayBillNumber     string                `json:"eway_bill_number"`
	CreatedBy          uint                  `json:"created_by"`
	CreatedAt          time.Time             `json:"created_at"`
	ModifiedBy         *uint                 `json:"modified_by"`
	ModifiedAt         *time.Time            `json:"modified_at"`
	PrintedBy          *uint                 `json:"printed_by"`
	PrintedCount       int                   `json:"printed_count"`
	LastPrintedAt      *time.Time            `json:"last_printed_at"`
	CancelledBy        *uint                 `json:"cancelled_by"`
	CancelledReason    string                `json:"cancelled_reason"`
	CancelledAt        *time.Time            `json:"cancelled_at"`
	IsCancelled        bool                  `json:"is_cancelled"`
}

// BillItemResponse represents a line item response
type BillItemResponse struct {
	ID            uint    `json:"id"`
	ItemName      string  `json:"item_name"`
	ItemCategory  string  `json:"item_category"`
	Quantity      float64 `json:"quantity"`
	Unit          string  `json:"unit"`
	Rate          float64 `json:"rate"`
	LineTotal     float64 `json:"line_total"`
	GSTPercentage float64 `json:"gst_percentage"`
}

// ToResponse converts Bill to BillResponse
func (b *Bill) ToResponse() BillResponse {
	response := BillResponse{
		ID:                 b.ID,
		BillNumber:         b.BillNumber,
		BillDate:           b.BillDate,
		FinancialYear:      b.FinancialYear,
		PaymentStatus:      b.PaymentStatus,
		Subtotal:           b.Subtotal,
		DiscountType:       b.DiscountType,
		DiscountPercentage: b.DiscountPercentage,
		DiscountAmount:     b.DiscountAmount,
		TaxableAmount:      b.TaxableAmount,
		CGSTAmount:         b.CGSTAmount,
		SGSTAmount:         b.SGSTAmount,
		IGSTAmount:         b.IGSTAmount,
		TotalGSTAmount:     b.TotalGSTAmount,
		RawGrandTotal:      b.RawGrandTotal,
		RoundOffAmount:     b.RoundOffAmount,
		GrandTotal:         b.GrandTotal,
		AdvanceAmountPaid:  b.AdvanceAmountPaid,
		NextPaymentDueDate: b.NextPaymentDueDate,
		PaymentRemarks:     b.PaymentRemarks,
		AmountDue:          b.AmountDue,
		EWayRequired:       b.EWayRequired,
		EWayBillNumber:     b.EWayBillNumber,
		CreatedBy:          b.CreatedBy,
		CreatedAt:          b.CreatedAt,
		ModifiedBy:         b.ModifiedBy,
		ModifiedAt:         b.ModifiedAt,
		PrintedBy:          b.PrintedBy,
		PrintedCount:       b.PrintedCount,
		LastPrintedAt:      b.LastPrintedAt,
		CancelledBy:        b.CancelledBy,
		CancelledReason:    b.CancelledReason,
		CancelledAt:        b.CancelledAt,
		IsCancelled:        b.IsCancelled,
	}

	if b.Vendor != nil {
		vendorResp := b.Vendor.ToResponse()
		response.Vendor = &vendorResp
	}

	if b.PaymentType != nil {
		paymentTypeResp := b.PaymentType.ToResponse()
		response.PaymentType = &paymentTypeResp
	}

	if b.PaymentMode != nil {
		paymentModeResp := b.PaymentMode.ToResponse()
		response.PaymentMode = &paymentModeResp
	}

	if len(b.Items) > 0 {
		response.Items = make([]BillItemResponse, len(b.Items))
		for i, item := range b.Items {
			response.Items[i] = item.ToResponse()
		}
	}

	return response
}

// ToResponse converts BillItem to BillItemResponse
func (bi *BillItem) ToResponse() BillItemResponse {
	return BillItemResponse{
		ID:            bi.ID,
		ItemName:      bi.ItemName,
		ItemCategory:  bi.ItemCategory,
		Quantity:      bi.Quantity,
		Unit:          bi.Unit,
		Rate:          bi.Rate,
		LineTotal:     bi.LineTotal,
		GSTPercentage: bi.GSTPercentage,
	}
}

// TableName specifies the table name for GORM
func (Bill) TableName() string {
	return "bills"
}

// TableName specifies the table name for GORM
func (BillItem) TableName() string {
	return "bill_items"
}

// TableName specifies the table name for GORM
func (BillChangeLog) TableName() string {
	return "bill_change_logs"
}
