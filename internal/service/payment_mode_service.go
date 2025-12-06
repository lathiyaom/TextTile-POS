package service

import (
	"errors"

	"github.com/TextTile/pos-go/internal/model"
	"github.com/TextTile/pos-go/internal/repository"
)

type PaymentModeService interface {
	CreatePaymentMode(req *model.PaymentModeCreateRequest) (*model.PaymentModeResponse, error)
	GetPaymentModeByID(id uint) (*model.PaymentModeResponse, error)
	GetAllPaymentModes() ([]model.PaymentModeResponse, error)
	UpdatePaymentMode(id uint, req *model.PaymentModeUpdateRequest) (*model.PaymentModeResponse, error)
	DeletePaymentMode(id uint) error
}

type paymentModeService struct {
	paymentModeRepo repository.PaymentModeRepository
}

func NewPaymentModeService(paymentModeRepo repository.PaymentModeRepository) PaymentModeService {
	return &paymentModeService{paymentModeRepo: paymentModeRepo}
}

func (s *paymentModeService) CreatePaymentMode(req *model.PaymentModeCreateRequest) (*model.PaymentModeResponse, error) {
	// Check if payment mode with same name already exists
	exists, err := s.paymentModeRepo.ExistsByName(req.Name)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("payment mode with this name already exists")
	}

	paymentMode := &model.PaymentMode{
		Name: req.Name,
	}

	if err := s.paymentModeRepo.Create(paymentMode); err != nil {
		return nil, err
	}

	response := paymentMode.ToResponse()
	return &response, nil
}

func (s *paymentModeService) GetPaymentModeByID(id uint) (*model.PaymentModeResponse, error) {
	paymentMode, err := s.paymentModeRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	response := paymentMode.ToResponse()
	return &response, nil
}

func (s *paymentModeService) GetAllPaymentModes() ([]model.PaymentModeResponse, error) {
	paymentModes, err := s.paymentModeRepo.FindAll()
	if err != nil {
		return nil, err
	}

	responses := []model.PaymentModeResponse{}
	for _, pm := range paymentModes {
		responses = append(responses, pm.ToResponse())
	}

	return responses, nil
}

func (s *paymentModeService) UpdatePaymentMode(id uint, req *model.PaymentModeUpdateRequest) (*model.PaymentModeResponse, error) {
	paymentMode, err := s.paymentModeRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.Name != "" {
		// Check if new name already exists (excluding current payment mode)
		exists, err := s.paymentModeRepo.ExistsByName(req.Name)
		if err != nil {
			return nil, err
		}
		if exists && paymentMode.Name != req.Name {
			return nil, errors.New("payment mode with this name already exists")
		}
		paymentMode.Name = req.Name
	}

	if req.IsActive != nil {
		paymentMode.IsActive = *req.IsActive
	}

	if err := s.paymentModeRepo.Update(paymentMode); err != nil {
		return nil, err
	}

	response := paymentMode.ToResponse()
	return &response, nil
}

func (s *paymentModeService) DeletePaymentMode(id uint) error {
	_, err := s.paymentModeRepo.FindByID(id)
	if err != nil {
		return err
	}

	return s.paymentModeRepo.Delete(id)
}
