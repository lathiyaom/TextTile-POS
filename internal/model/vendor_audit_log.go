package model

import (
	"time"

	"gorm.io/gorm"
)

type AuditActionType string

const (
	AuditActionCreated      AuditActionType = "created"
	AuditActionUpdated      AuditActionType = "updated"
	AuditActionStatusChange AuditActionType = "status_change"
	AuditActionDeleted      AuditActionType = "deleted"
)

type VendorAuditLog struct {
	ID          uint            `gorm:"primaryKey" json:"id"`
	VendorID    uint            `gorm:"not null;index" json:"vendor_id"`
	ActionType  AuditActionType `gorm:"type:varchar(50);not null" json:"action_type"`
	Description string          `gorm:"type:text;not null" json:"description"`
	OldValue    string          `gorm:"type:text" json:"old_value,omitempty"`
	NewValue    string          `gorm:"type:text" json:"new_value,omitempty"`
	CreatedAt   time.Time       `json:"created_at"`
	DeletedAt   gorm.DeletedAt  `gorm:"index" json:"-"`
}

type VendorAuditLogResponse struct {
	ID          uint            `json:"id"`
	VendorID    uint            `json:"vendor_id"`
	ActionType  AuditActionType `json:"action_type"`
	Description string          `json:"description"`
	OldValue    string          `json:"old_value,omitempty"`
	NewValue    string          `json:"new_value,omitempty"`
	CreatedAt   time.Time       `json:"created_at"`
}

func (val *VendorAuditLog) ToResponse() VendorAuditLogResponse {
	return VendorAuditLogResponse{
		ID:          val.ID,
		VendorID:    val.VendorID,
		ActionType:  val.ActionType,
		Description: val.Description,
		OldValue:    val.OldValue,
		NewValue:    val.NewValue,
		CreatedAt:   val.CreatedAt,
	}
}

func (VendorAuditLog) TableName() string {
	return "vendor_audit_logs"
}
