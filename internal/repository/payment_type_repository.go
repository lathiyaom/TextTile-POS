package repository

import (
	"github.com/TextTile/pos-go/internal/model"
	"gorm.io/gorm"
)

type PaymentTypeRepository interface {
	Create(paymentType *model.PaymentType) error
	GetAll() ([]model.PaymentType, error)
	GetByID(id uint) (*model.PaymentType, error)
	Update(paymentType *model.PaymentType) error
	Delete(id uint) error
}

type paymentTypeRepository struct {
	db *gorm.DB
}

func NewPaymentTypeRepository(db *gorm.DB) PaymentTypeRepository {
	return &paymentTypeRepository{db: db}
}

func (r *paymentTypeRepository) Create(paymentType *model.PaymentType) error {
	return r.db.Create(paymentType).Error
}

func (r *paymentTypeRepository) GetAll() ([]model.PaymentType, error) {
	var paymentTypes []model.PaymentType
	if err := r.db.Order("is_active DESC, name ASC").Find(&paymentTypes).Error; err != nil {
		return nil, err
	}
	return paymentTypes, nil
}

func (r *paymentTypeRepository) GetByID(id uint) (*model.PaymentType, error) {
	var paymentType model.PaymentType
	if err := r.db.First(&paymentType, id).Error; err != nil {
		return nil, err
	}
	return &paymentType, nil
}

func (r *paymentTypeRepository) Update(paymentType *model.PaymentType) error {
	return r.db.Save(paymentType).Error
}

func (r *paymentTypeRepository) Delete(id uint) error {
	return r.db.Delete(&model.PaymentType{}, id).Error
}
