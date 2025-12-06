package model

import (
	"time"

	"gorm.io/gorm"
)

// VendorStatus represents the status of a vendor
type VendorStatus string

const (
	VendorStatusActive      VendorStatus = "active"
	VendorStatusInactive    VendorStatus = "inactive"
	VendorStatusBlacklisted VendorStatus = "blacklisted"
)

// Vendor represents a vendor entity
type Vendor struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	VendorNo       string         `gorm:"type:varchar(50);uniqueIndex;not null" json:"vendor_no"`
	VendorName     string         `gorm:"type:varchar(255);not null" json:"vendor_name" binding:"required,min=2,max=255"`
	BusinessName   string         `gorm:"type:varchar(255)" json:"business_name"`
	MobileNumber   string         `gorm:"type:varchar(15);not null" json:"mobile_number" binding:"required,min=10,max=15"`
	WhatsappNumber string         `gorm:"type:varchar(15)" json:"whatsapp_number"`
	Email          string         `gorm:"type:varchar(255)" json:"email"`
	GSTNumber      string         `gorm:"type:varchar(15)" json:"gst_number"`
	BillingAddress string         `gorm:"type:text" json:"billing_address"`
	City           string         `gorm:"type:varchar(100)" json:"city"`
	State          string         `gorm:"type:varchar(100)" json:"state"`
	Pincode        string         `gorm:"type:varchar(10)" json:"pincode"`
	TotalBills     int            `gorm:"default:0" json:"total_bills"`
	TotalAmount    float64        `gorm:"type:decimal(15,2);default:0" json:"total_amount"`
	TotalPaid      float64        `gorm:"type:decimal(15,2);default:0" json:"total_paid"`
	BalanceDue     float64        `gorm:"type:decimal(15,2);default:0" json:"balance_due"`
	VendorTypeID   uint           `gorm:"not null" json:"vendor_type_id" binding:"required"`
	VendorType     *VendorType    `gorm:"foreignKey:VendorTypeID" json:"vendor_type,omitempty"`
	PaymentModeID  *uint          `json:"payment_mode_id"`
	PaymentMode    *PaymentMode   `gorm:"foreignKey:PaymentModeID" json:"payment_mode,omitempty"`
	Status         VendorStatus   `gorm:"type:varchar(20);default:'active'" json:"status"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

// VendorCreateRequest represents the request body for creating a vendor
type VendorCreateRequest struct {
	VendorName     string `json:"vendor_name" binding:"required,min=2,max=255"`
	BusinessName   string `json:"business_name" binding:"omitempty,max=255"`
	MobileNumber   string `json:"mobile_number" binding:"required,min=10,max=15"`
	WhatsappNumber string `json:"whatsapp_number" binding:"omitempty,max=15"`
	Email          string `json:"email" binding:"omitempty,email"`
	GSTNumber      string `json:"gst_number" binding:"omitempty,max=15"`
	BillingAddress string `json:"billing_address"`
	City           string `json:"city" binding:"omitempty,max=100"`
	State          string `json:"state" binding:"omitempty,max=100"`
	Pincode        string `json:"pincode" binding:"omitempty,max=10"`
	VendorTypeID   uint   `json:"vendor_type_id" binding:"required"`
	PaymentModeID  *uint  `json:"payment_mode_id"`
	Status         string `json:"status" binding:"omitempty,oneof=active inactive blacklisted"`
}

// VendorUpdateRequest represents the request body for updating a vendor
type VendorUpdateRequest struct {
	VendorName     string `json:"vendor_name" binding:"omitempty,min=2,max=255"`
	BusinessName   string `json:"business_name" binding:"omitempty,max=255"`
	MobileNumber   string `json:"mobile_number" binding:"omitempty,min=10,max=15"`
	WhatsappNumber string `json:"whatsapp_number" binding:"omitempty,max=15"`
	Email          string `json:"email" binding:"omitempty,email"`
	GSTNumber      string `json:"gst_number" binding:"omitempty,max=15"`
	BillingAddress string `json:"billing_address"`
	City           string `json:"city" binding:"omitempty,max=100"`
	State          string `json:"state" binding:"omitempty,max=100"`
	Pincode        string `json:"pincode" binding:"omitempty,max=10"`
	VendorTypeID   *uint  `json:"vendor_type_id"`
	PaymentModeID  *uint  `json:"payment_mode_id"`
	Status         string `json:"status" binding:"omitempty,oneof=active inactive blacklisted"`
}

// VendorResponse represents the vendor response
type VendorResponse struct {
	ID             uint                 `json:"id"`
	VendorNo       string               `json:"vendor_no"`
	VendorName     string               `json:"vendor_name"`
	BusinessName   string               `json:"business_name"`
	MobileNumber   string               `json:"mobile_number"`
	WhatsappNumber string               `json:"whatsapp_number"`
	Email          string               `json:"email"`
	GSTNumber      string               `json:"gst_number"`
	BillingAddress string               `json:"billing_address"`
	City           string               `json:"city"`
	State          string               `json:"state"`
	Pincode        string               `json:"pincode"`
	TotalBills     int                  `json:"total_bills"`
	TotalAmount    float64              `json:"total_amount"`
	TotalPaid      float64              `json:"total_paid"`
	BalanceDue     float64              `json:"balance_due"`
	VendorType     *VendorTypeResponse  `json:"vendor_type,omitempty"`
	PaymentMode    *PaymentModeResponse `json:"payment_mode,omitempty"`
	Status         VendorStatus         `json:"status"`
	CreatedAt      time.Time            `json:"created_at"`
	UpdatedAt      time.Time            `json:"updated_at"`
}

// ToResponse converts Vendor to VendorResponse
func (v *Vendor) ToResponse() VendorResponse {
	response := VendorResponse{
		ID:             v.ID,
		VendorNo:       v.VendorNo,
		VendorName:     v.VendorName,
		BusinessName:   v.BusinessName,
		MobileNumber:   v.MobileNumber,
		WhatsappNumber: v.WhatsappNumber,
		Email:          v.Email,
		GSTNumber:      v.GSTNumber,
		BillingAddress: v.BillingAddress,
		City:           v.City,
		State:          v.State,
		Pincode:        v.Pincode,
		TotalBills:     v.TotalBills,
		TotalAmount:    v.TotalAmount,
		TotalPaid:      v.TotalPaid,
		BalanceDue:     v.BalanceDue,
		Status:         v.Status,
		CreatedAt:      v.CreatedAt,
		UpdatedAt:      v.UpdatedAt,
	}

	if v.VendorType != nil {
		vendorTypeResp := v.VendorType.ToResponse()
		response.VendorType = &vendorTypeResp
	}

	if v.PaymentMode != nil {
		paymentModeResp := v.PaymentMode.ToResponse()
		response.PaymentMode = &paymentModeResp
	}

	return response
}

// TableName specifies the table name for GORM
func (Vendor) TableName() string {
	return "vendors"
}
