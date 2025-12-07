package service

import (
	"errors"

	"github.com/TextTile/pos-go/internal/model"
	"github.com/TextTile/pos-go/internal/repository"
	"gorm.io/gorm"
)

type PaymentTypeService interface {
	CreatePaymentType(req *model.PaymentTypeCreateRequest) (*model.PaymentType, error)
	GetAllPaymentTypes() ([]model.PaymentType, error)
	GetPaymentTypeByID(id uint) (*model.PaymentType, error)
	UpdatePaymentType(id uint, req *model.PaymentTypeUpdateRequest) (*model.PaymentType, error)
	DeletePaymentType(id uint) error
}

type paymentTypeService struct {
	repo repository.PaymentTypeRepository
}

func NewPaymentTypeService(repo repository.PaymentTypeRepository) PaymentTypeService {
	return &paymentTypeService{repo: repo}
}

func (s *paymentTypeService) CreatePaymentType(req *model.PaymentTypeCreateRequest) (*model.PaymentType, error) {
	paymentType := &model.PaymentType{
		Name:        req.Name,
		Description: req.Description,
		IsActive:    true,
	}

	if err := s.repo.Create(paymentType); err != nil {
		return nil, err
	}

	return paymentType, nil
}

func (s *paymentTypeService) GetAllPaymentTypes() ([]model.PaymentType, error) {
	return s.repo.GetAll()
}

func (s *paymentTypeService) GetPaymentTypeByID(id uint) (*model.PaymentType, error) {
	paymentType, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("payment type not found")
		}
		return nil, err
	}
	return paymentType, nil
}

func (s *paymentTypeService) UpdatePaymentType(id uint, req *model.PaymentTypeUpdateRequest) (*model.PaymentType, error) {
	paymentType, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("payment type not found")
		}
		return nil, err
	}

	if req.Name != "" {
		paymentType.Name = req.Name
	}
	if req.Description != "" {
		paymentType.Description = req.Description
	}
	if req.IsActive != nil {
		paymentType.IsActive = *req.IsActive
	}

	if err := s.repo.Update(paymentType); err != nil {
		return nil, err
	}

	return paymentType, nil
}

func (s *paymentTypeService) DeletePaymentType(id uint) error {
	_, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("payment type not found")
		}
		return err
	}

	return s.repo.Delete(id)
}
