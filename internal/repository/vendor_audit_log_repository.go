package repository

import (
	"github.com/TextTile/pos-go/internal/model"
	"gorm.io/gorm"
)

type VendorAuditLogRepository interface {
	Create(log *model.VendorAuditLog) error
	FindByVendorID(vendorID uint) ([]model.VendorAuditLog, error)
}

type vendorAuditLogRepository struct {
	db *gorm.DB
}

func NewVendorAuditLogRepository(db *gorm.DB) VendorAuditLogRepository {
	return &vendorAuditLogRepository{db: db}
}

func (r *vendorAuditLogRepository) Create(log *model.VendorAuditLog) error {
	return r.db.Create(log).Error
}

func (r *vendorAuditLogRepository) FindByVendorID(vendorID uint) ([]model.VendorAuditLog, error) {
	var logs []model.VendorAuditLog
	err := r.db.Where("vendor_id = ?", vendorID).Order("created_at DESC").Find(&logs).Error
	return logs, err
}
