package repository

import (
	"errors"

	"github.com/TextTile/pos-go/internal/model"
	"gorm.io/gorm"
)

type PaymentModeRepository interface {
	Create(paymentMode *model.PaymentMode) error
	FindByID(id uint) (*model.PaymentMode, error)
	FindAll() ([]model.PaymentMode, error)
	Update(paymentMode *model.PaymentMode) error
	Delete(id uint) error
	ExistsByName(name string) (bool, error)
}

type paymentModeRepository struct {
	db *gorm.DB
}

func NewPaymentModeRepository(db *gorm.DB) PaymentModeRepository {
	return &paymentModeRepository{db: db}
}

func (r *paymentModeRepository) Create(paymentMode *model.PaymentMode) error {
	return r.db.Create(paymentMode).Error
}

func (r *paymentModeRepository) FindByID(id uint) (*model.PaymentMode, error) {
	var paymentMode model.PaymentMode
	err := r.db.First(&paymentMode, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("payment mode not found")
		}
		return nil, err
	}
	return &paymentMode, nil
}

func (r *paymentModeRepository) FindAll() ([]model.PaymentMode, error) {
	var paymentModes []model.PaymentMode
	err := r.db.Order("name ASC").Find(&paymentModes).Error
	if err != nil {
		return nil, err
	}
	return paymentModes, nil
}

func (r *paymentModeRepository) Update(paymentMode *model.PaymentMode) error {
	return r.db.Save(paymentMode).Error
}

func (r *paymentModeRepository) Delete(id uint) error {
	return r.db.Delete(&model.PaymentMode{}, id).Error
}

func (r *paymentModeRepository) ExistsByName(name string) (bool, error) {
	var count int64
	err := r.db.Model(&model.PaymentMode{}).Where("name = ?", name).Count(&count).Error
	return count > 0, err
}
