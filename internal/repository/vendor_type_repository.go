package repository

import (
	"errors"

	"github.com/TextTile/pos-go/internal/model"
	"gorm.io/gorm"
)

type VendorTypeRepository interface {
	Create(vendorType *model.VendorType) error
	FindByID(id uint) (*model.VendorType, error)
	FindAll() ([]model.VendorType, error)
	Update(vendorType *model.VendorType) error
	Delete(id uint) error
	ExistsByName(name string) (bool, error)
}

type vendorTypeRepository struct {
	db *gorm.DB
}

func NewVendorTypeRepository(db *gorm.DB) VendorTypeRepository {
	return &vendorTypeRepository{db: db}
}

func (r *vendorTypeRepository) Create(vendorType *model.VendorType) error {
	return r.db.Create(vendorType).Error
}

func (r *vendorTypeRepository) FindByID(id uint) (*model.VendorType, error) {
	var vendorType model.VendorType
	err := r.db.First(&vendorType, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("vendor type not found")
		}
		return nil, err
	}
	return &vendorType, nil
}

func (r *vendorTypeRepository) FindAll() ([]model.VendorType, error) {
	var vendorTypes []model.VendorType
	err := r.db.Order("name ASC").Find(&vendorTypes).Error
	if err != nil {
		return nil, err
	}
	return vendorTypes, nil
}

func (r *vendorTypeRepository) Update(vendorType *model.VendorType) error {
	return r.db.Save(vendorType).Error
}

func (r *vendorTypeRepository) Delete(id uint) error {
	return r.db.Delete(&model.VendorType{}, id).Error
}

func (r *vendorTypeRepository) ExistsByName(name string) (bool, error) {
	var count int64
	err := r.db.Model(&model.VendorType{}).Where("name = ?", name).Count(&count).Error
	return count > 0, err
}
