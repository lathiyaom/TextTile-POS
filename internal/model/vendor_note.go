package model

import (
	"time"

	"gorm.io/gorm"
)

type VendorNote struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	VendorID  uint           `gorm:"not null;index" json:"vendor_id"`
	NoteText  string         `gorm:"type:text;not null" json:"note_text" binding:"required"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type VendorNoteCreateRequest struct {
	NoteText string `json:"note_text" binding:"required,min=1"`
}

type VendorNoteResponse struct {
	ID        uint      `json:"id"`
	VendorID  uint      `json:"vendor_id"`
	NoteText  string    `json:"note_text"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (vn *VendorNote) ToResponse() VendorNoteResponse {
	return VendorNoteResponse{
		ID:        vn.ID,
		VendorID:  vn.VendorID,
		NoteText:  vn.NoteText,
		CreatedAt: vn.CreatedAt,
		UpdatedAt: vn.UpdatedAt,
	}
}

func (VendorNote) TableName() string {
	return "vendor_notes"
}

