package model

import (
	"time"

	"gorm.io/gorm"
)

// PaymentType represents a payment type for bills
type PaymentType struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"type:varchar(100);not null;uniqueIndex" json:"name" binding:"required,min=2,max=100"`
	Description string         `gorm:"type:text" json:"description"`
	IsActive    bool           `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// PaymentTypeCreateRequest represents the request body for creating a payment type
type PaymentTypeCreateRequest struct {
	Name        string `json:"name" binding:"required,min=2,max=100"`
	Description string `json:"description" binding:"omitempty"`
}

// PaymentTypeUpdateRequest represents the request body for updating a payment type
type PaymentTypeUpdateRequest struct {
	Name        string `json:"name" binding:"omitempty,min=2,max=100"`
	Description string `json:"description" binding:"omitempty"`
	IsActive    *bool  `json:"is_active" binding:"omitempty"`
}

// PaymentTypeResponse represents the payment type response
type PaymentTypeResponse struct {
	ID          uint      `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ToResponse converts PaymentType to PaymentTypeResponse
func (pt *PaymentType) ToResponse() PaymentTypeResponse {
	return PaymentTypeResponse{
		ID:          pt.ID,
		Name:        pt.Name,
		Description: pt.Description,
		IsActive:    pt.IsActive,
		CreatedAt:   pt.CreatedAt,
		UpdatedAt:   pt.UpdatedAt,
	}
}

// TableName specifies the table name for GORM
func (PaymentType) TableName() string {
	return "payment_types"
}
