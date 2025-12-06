package model

import (
	"time"

	"gorm.io/gorm"
)

// VendorType represents a vendor type/category
type VendorType struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"type:varchar(100);not null;uniqueIndex" json:"name" binding:"required,min=2,max=100"`
	IsActive  bool           `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// VendorTypeCreateRequest represents the request body for creating a vendor type
type VendorTypeCreateRequest struct {
	Name string `json:"name" binding:"required,min=2,max=100"`
}

// VendorTypeUpdateRequest represents the request body for updating a vendor type
type VendorTypeUpdateRequest struct {
	Name     string `json:"name" binding:"omitempty,min=2,max=100"`
	IsActive *bool  `json:"is_active" binding:"omitempty"`
}

// VendorTypeResponse represents the vendor type response
type VendorTypeResponse struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ToResponse converts VendorType to VendorTypeResponse
func (vt *VendorType) ToResponse() VendorTypeResponse {
	return VendorTypeResponse{
		ID:        vt.ID,
		Name:      vt.Name,
		IsActive:  vt.IsActive,
		CreatedAt: vt.CreatedAt,
		UpdatedAt: vt.UpdatedAt,
	}
}

// TableName specifies the table name for GORM
func (VendorType) TableName() string {
	return "vendor_types"
}
