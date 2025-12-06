package model

import (
	"time"

	"gorm.io/gorm"
)

type VendorAttachment struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	VendorID   uint           `gorm:"not null;index" json:"vendor_id"`
	FileName   string         `gorm:"type:varchar(255);not null" json:"file_name"`
	FileURL    string         `gorm:"type:varchar(500);not null" json:"file_url"`
	FileSize   int64          `gorm:"default:0" json:"file_size"`
	MimeType   string         `gorm:"type:varchar(100)" json:"mime_type"`
	UploadedAt time.Time      `json:"uploaded_at"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

type VendorAttachmentResponse struct {
	ID         uint      `json:"id"`
	VendorID   uint      `json:"vendor_id"`
	FileName   string    `json:"file_name"`
	FileURL    string    `json:"file_url"`
	FileSize   int64     `json:"file_size"`
	MimeType   string    `json:"mime_type"`
	UploadedAt time.Time `json:"uploaded_at"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (va *VendorAttachment) ToResponse() VendorAttachmentResponse {
	return VendorAttachmentResponse{
		ID:         va.ID,
		VendorID:   va.VendorID,
		FileName:   va.FileName,
		FileURL:    va.FileURL,
		FileSize:   va.FileSize,
		MimeType:   va.MimeType,
		UploadedAt: va.UploadedAt,
		CreatedAt:  va.CreatedAt,
		UpdatedAt:  va.UpdatedAt,
	}
}

func (VendorAttachment) TableName() string {
	return "vendor_attachments"
}
