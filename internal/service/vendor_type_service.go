package service

import (
	"errors"

	"github.com/TextTile/pos-go/internal/model"
	"github.com/TextTile/pos-go/internal/repository"
)

type VendorTypeService interface {
	CreateVendorType(req *model.VendorTypeCreateRequest) (*model.VendorTypeResponse, error)
	GetVendorTypeByID(id uint) (*model.VendorTypeResponse, error)
	GetAllVendorTypes() ([]model.VendorTypeResponse, error)
	UpdateVendorType(id uint, req *model.VendorTypeUpdateRequest) (*model.VendorTypeResponse, error)
	DeleteVendorType(id uint) error
}

type vendorTypeService struct {
	vendorTypeRepo repository.VendorTypeRepository
}

func NewVendorTypeService(vendorTypeRepo repository.VendorTypeRepository) VendorTypeService {
	return &vendorTypeService{vendorTypeRepo: vendorTypeRepo}
}

func (s *vendorTypeService) CreateVendorType(req *model.VendorTypeCreateRequest) (*model.VendorTypeResponse, error) {
	// Check if vendor type with same name already exists
	exists, err := s.vendorTypeRepo.ExistsByName(req.Name)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("vendor type with this name already exists")
	}

	vendorType := &model.VendorType{
		Name: req.Name,
	}

	if err := s.vendorTypeRepo.Create(vendorType); err != nil {
		return nil, err
	}

	response := vendorType.ToResponse()
	return &response, nil
}

func (s *vendorTypeService) GetVendorTypeByID(id uint) (*model.VendorTypeResponse, error) {
	vendorType, err := s.vendorTypeRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	response := vendorType.ToResponse()
	return &response, nil
}

func (s *vendorTypeService) GetAllVendorTypes() ([]model.VendorTypeResponse, error) {
	vendorTypes, err := s.vendorTypeRepo.FindAll()
	if err != nil {
		return nil, err
	}

	responses := []model.VendorTypeResponse{}
	for _, vt := range vendorTypes {
		responses = append(responses, vt.ToResponse())
	}

	return responses, nil
}

func (s *vendorTypeService) UpdateVendorType(id uint, req *model.VendorTypeUpdateRequest) (*model.VendorTypeResponse, error) {
	vendorType, err := s.vendorTypeRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.Name != "" {
		// Check if new name already exists (excluding current vendor type)
		exists, err := s.vendorTypeRepo.ExistsByName(req.Name)
		if err != nil {
			return nil, err
		}
		if exists && vendorType.Name != req.Name {
			return nil, errors.New("vendor type with this name already exists")
		}
		vendorType.Name = req.Name
	}

	if req.IsActive != nil {
		vendorType.IsActive = *req.IsActive
	}

	if err := s.vendorTypeRepo.Update(vendorType); err != nil {
		return nil, err
	}

	response := vendorType.ToResponse()
	return &response, nil
}

func (s *vendorTypeService) DeleteVendorType(id uint) error {
	_, err := s.vendorTypeRepo.FindByID(id)
	if err != nil {
		return err
	}

	return s.vendorTypeRepo.Delete(id)
}
