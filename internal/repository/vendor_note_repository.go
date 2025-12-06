package repository

import (
	"errors"

	"github.com/TextTile/pos-go/internal/model"
	"gorm.io/gorm"
)

type VendorNoteRepository interface {
	Create(note *model.VendorNote) error
	FindByVendorID(vendorID uint) ([]model.VendorNote, error)
	FindByID(id uint) (*model.VendorNote, error)
	Delete(id uint) error
	Update(note *model.VendorNote) error
}

type vendorNoteRepository struct {
	db *gorm.DB
}

func NewVendorNoteRepository(db *gorm.DB) VendorNoteRepository {
	return &vendorNoteRepository{db: db}
}

func (r *vendorNoteRepository) Create(note *model.VendorNote) error {
	return r.db.Create(note).Error
}

func (r *vendorNoteRepository) FindByVendorID(vendorID uint) ([]model.VendorNote, error) {
	var notes []model.VendorNote
	err := r.db.Where("vendor_id = ?", vendorID).Order("created_at DESC").Find(&notes).Error
	return notes, err
}

func (r *vendorNoteRepository) FindByID(id uint) (*model.VendorNote, error) {
	var note model.VendorNote
	err := r.db.First(&note, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("note not found")
		}
		return nil, err
	}
	return &note, nil
}

func (r *vendorNoteRepository) Delete(id uint) error {
	return r.db.Delete(&model.VendorNote{}, id).Error
}

func (r *vendorNoteRepository) Update(note *model.VendorNote) error {
	return r.db.Save(note).Error
}
