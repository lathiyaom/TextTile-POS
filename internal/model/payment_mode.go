package model

import (
	"time"

	"gorm.io/gorm"
)

// PaymentModeCategory represents the category of a payment mode
type PaymentModeCategory string

const (
	PaymentModeCategoryCash         PaymentModeCategory = "Cash"
	PaymentModeCategoryCard         PaymentModeCategory = "Card"
	PaymentModeCategoryUPI          PaymentModeCategory = "UPI"
	PaymentModeCategoryBankTransfer PaymentModeCategory = "Bank Transfer"
	PaymentModeCategoryCheque       PaymentModeCategory = "Cheque"
	PaymentModeCategoryOther        PaymentModeCategory = "Other"
)

// PaymentMode represents a payment mode preference
type PaymentMode struct {
	ID        uint                `gorm:"primaryKey" json:"id"`
	Name      string              `gorm:"type:varchar(100);not null;uniqueIndex" json:"name" binding:"required,min=2,max=100"`
	Category  PaymentModeCategory `gorm:"type:varchar(50);default:'Other'" json:"category"`
	IsActive  bool                `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time           `json:"created_at"`
	UpdatedAt time.Time           `json:"updated_at"`
	DeletedAt gorm.DeletedAt      `gorm:"index" json:"-"`
}

// PaymentModeCreateRequest represents the request body for creating a payment mode
type PaymentModeCreateRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=100"`
	Category string `json:"category" binding:"omitempty,oneof=Cash Card UPI 'Bank Transfer' Cheque Other"`
}

// PaymentModeUpdateRequest represents the request body for updating a payment mode
type PaymentModeUpdateRequest struct {
	Name     string `json:"name" binding:"omitempty,min=2,max=100"`
	Category string `json:"category" binding:"omitempty,oneof=Cash Card UPI 'Bank Transfer' Cheque Other"`
	IsActive *bool  `json:"is_active" binding:"omitempty"`
}

// PaymentModeResponse represents the payment mode response
type PaymentModeResponse struct {
	ID        uint                `json:"id"`
	Name      string              `json:"name"`
	Category  PaymentModeCategory `json:"category"`
	IsActive  bool                `json:"is_active"`
	CreatedAt time.Time           `json:"created_at"`
	UpdatedAt time.Time           `json:"updated_at"`
}

// ToResponse converts PaymentMode to PaymentModeResponse
func (pm *PaymentMode) ToResponse() PaymentModeResponse {
	return PaymentModeResponse{
		ID:        pm.ID,
		Name:      pm.Name,
		Category:  pm.Category,
		IsActive:  pm.IsActive,
		CreatedAt: pm.CreatedAt,
		UpdatedAt: pm.UpdatedAt,
	}
}

// TableName specifies the table name for GORM
func (PaymentMode) TableName() string {
	return "payment_modes"
}
