package model

import (
	"time"

	"gorm.io/gorm"
)

// EntityType represents the type of entity a note is attached to
type EntityType string

const (
	EntityTypeVendor EntityType = "VENDOR"
	EntityTypeBill   EntityType = "BILL"
)

// Note represents a generic note that can be attached to any entity
type Note struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	EntityType EntityType     `gorm:"type:varchar(20);not null;index:idx_entity" json:"entity_type"`
	EntityID   uint           `gorm:"not null;index:idx_entity" json:"entity_id"`
	NoteText   string         `gorm:"type:text;not null" json:"note_text" binding:"required,max=1000"`
	CreatedBy  uint           `gorm:"not null" json:"created_by"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedBy  *uint          `json:"updated_by"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// NoteCreateRequest represents the request body for creating a note
type NoteCreateRequest struct {
	NoteText string `json:"note_text" binding:"required,min=1,max=1000"`
}

// NoteUpdateRequest represents the request body for updating a note
type NoteUpdateRequest struct {
	NoteText string `json:"note_text" binding:"required,min=1,max=1000"`
}

// NoteResponse represents the note response
type NoteResponse struct {
	ID         uint       `json:"id"`
	EntityType EntityType `json:"entity_type"`
	EntityID   uint       `json:"entity_id"`
	NoteText   string     `json:"note_text"`
	CreatedBy  uint       `json:"created_by"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedBy  *uint      `json:"updated_by"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

// ToResponse converts Note to NoteResponse
func (n *Note) ToResponse() NoteResponse {
	return NoteResponse{
		ID:         n.ID,
		EntityType: n.EntityType,
		EntityID:   n.EntityID,
		NoteText:   n.NoteText,
		CreatedBy:  n.CreatedBy,
		CreatedAt:  n.CreatedAt,
		UpdatedBy:  n.UpdatedBy,
		UpdatedAt:  n.UpdatedAt,
	}
}

// TableName specifies the table name for GORM
func (Note) TableName() string {
	return "notes"
}
