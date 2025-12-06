package repository

import (
	"errors"

	"github.com/TextTile/pos-go/internal/model"
	"gorm.io/gorm"
)

type VendorAttachmentRepository interface {
	Create(attachment *model.VendorAttachment) error
	FindByVendorID(vendorID uint) ([]model.VendorAttachment, error)
	FindByID(id uint) (*model.VendorAttachment, error)
	Delete(id uint) error
}

type vendorAttachmentRepository struct {
	db *gorm.DB
}

func NewVendorAttachmentRepository(db *gorm.DB) VendorAttachmentRepository {
	return &vendorAttachmentRepository{db: db}
}

func (r *vendorAttachmentRepository) Create(attachment *model.VendorAttachment) error {
	return r.db.Create(attachment).Error
}

func (r *vendorAttachmentRepository) FindByVendorID(vendorID uint) ([]model.VendorAttachment, error) {
	var attachments []model.VendorAttachment
	err := r.db.Where("vendor_id = ?", vendorID).Order("created_at DESC").Find(&attachments).Error
	return attachments, err
}

func (r *vendorAttachmentRepository) FindByID(id uint) (*model.VendorAttachment, error) {
	var attachment model.VendorAttachment
	err := r.db.First(&attachment, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("attachment not found")
		}
		return nil, err
	}
	return &attachment, nil
}

func (r *vendorAttachmentRepository) Delete(id uint) error {
	return r.db.Delete(&model.VendorAttachment{}, id).Error
}
