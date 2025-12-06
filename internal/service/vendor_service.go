package service

import (
	"math"

	"github.com/TextTile/pos-go/internal/model"
	"github.com/TextTile/pos-go/internal/repository"
	"github.com/TextTile/pos-go/internal/utils"
)

type VendorService interface {
	CreateVendor(req *model.VendorCreateRequest) (*model.VendorResponse, error)
	GetVendorByID(id uint) (*model.VendorResponse, error)
	GetAllVendors(page, pageSize int, status, search, sortBy, sortDir string) ([]model.VendorResponse, *utils.Pagination, error)
	UpdateVendor(id uint, req *model.VendorUpdateRequest) (*model.VendorResponse, error)
	DeleteVendor(id uint) error
	ChangeStatus(id uint, status model.VendorStatus, reason string) (*model.VendorResponse, error)
	GenerateNextVendorNo() (string, error)
}

type vendorService struct {
	vendorRepo      repository.VendorRepository
	vendorTypeRepo  repository.VendorTypeRepository
	paymentModeRepo repository.PaymentModeRepository
}

func NewVendorService(
	vendorRepo repository.VendorRepository,
	vendorTypeRepo repository.VendorTypeRepository,
	paymentModeRepo repository.PaymentModeRepository,
) VendorService {
	return &vendorService{
		vendorRepo:      vendorRepo,
		vendorTypeRepo:  vendorTypeRepo,
		paymentModeRepo: paymentModeRepo,
	}
}

func (s *vendorService) GenerateNextVendorNo() (string, error) {
	return s.vendorRepo.GenerateVendorNo()
}

func (s *vendorService) CreateVendor(req *model.VendorCreateRequest) (*model.VendorResponse, error) {
	// Verify vendor type exists
	_, err := s.vendorTypeRepo.FindByID(req.VendorTypeID)
	if err != nil {
		return nil, err
	}

	// Verify payment mode exists if provided
	if req.PaymentModeID != nil {
		_, err := s.paymentModeRepo.FindByID(*req.PaymentModeID)
		if err != nil {
			return nil, err
		}
	}

	// Generate vendor number
	vendorNo, err := s.vendorRepo.GenerateVendorNo()
	if err != nil {
		return nil, err
	}

	status := model.VendorStatusActive
	if req.Status != "" {
		status = model.VendorStatus(req.Status)
	}

	vendor := &model.Vendor{
		VendorNo:       vendorNo,
		VendorName:     req.VendorName,
		BusinessName:   req.BusinessName,
		MobileNumber:   req.MobileNumber,
		WhatsappNumber: req.WhatsappNumber,
		Email:          req.Email,
		GSTNumber:      req.GSTNumber,
		BillingAddress: req.BillingAddress,
		City:           req.City,
		State:          req.State,
		Pincode:        req.Pincode,
		VendorTypeID:   req.VendorTypeID,
		PaymentModeID:  req.PaymentModeID,
		Status:         status,
	}

	if err := s.vendorRepo.Create(vendor); err != nil {
		return nil, err
	}

	// Fetch the created vendor with relationships
	createdVendor, err := s.vendorRepo.FindByID(vendor.ID)
	if err != nil {
		return nil, err
	}

	response := createdVendor.ToResponse()
	return &response, nil
}

func (s *vendorService) GetVendorByID(id uint) (*model.VendorResponse, error) {
	vendor, err := s.vendorRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	response := vendor.ToResponse()
	return &response, nil
}

func (s *vendorService) GetAllVendors(page, pageSize int, status, search, sortBy, sortDir string) ([]model.VendorResponse, *utils.Pagination, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	vendors, total, err := s.vendorRepo.FindAll(page, pageSize, status, search, sortBy, sortDir)
	if err != nil {
		return nil, nil, err
	}

	responses := []model.VendorResponse{}
	for _, vendor := range vendors {
		responses = append(responses, vendor.ToResponse())
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	pagination := &utils.Pagination{
		Page:       page,
		PageSize:   pageSize,
		TotalItems: total,
		TotalPages: totalPages,
	}

	return responses, pagination, nil
}

func (s *vendorService) UpdateVendor(id uint, req *model.VendorUpdateRequest) (*model.VendorResponse, error) {
	vendor, err := s.vendorRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.VendorName != "" {
		vendor.VendorName = req.VendorName
	}
	if req.BusinessName != "" {
		vendor.BusinessName = req.BusinessName
	}
	if req.MobileNumber != "" {
		vendor.MobileNumber = req.MobileNumber
	}
	if req.WhatsappNumber != "" {
		vendor.WhatsappNumber = req.WhatsappNumber
	}
	if req.Email != "" {
		vendor.Email = req.Email
	}
	if req.GSTNumber != "" {
		vendor.GSTNumber = req.GSTNumber
	}
	if req.BillingAddress != "" {
		vendor.BillingAddress = req.BillingAddress
	}
	if req.City != "" {
		vendor.City = req.City
	}
	if req.State != "" {
		vendor.State = req.State
	}
	if req.Pincode != "" {
		vendor.Pincode = req.Pincode
	}
	if req.VendorTypeID != nil {
		// Verify vendor type exists
		_, err := s.vendorTypeRepo.FindByID(*req.VendorTypeID)
		if err != nil {
			return nil, err
		}
		vendor.VendorTypeID = *req.VendorTypeID
	}
	if req.PaymentModeID != nil {
		// Verify payment mode exists
		_, err := s.paymentModeRepo.FindByID(*req.PaymentModeID)
		if err != nil {
			return nil, err
		}
		vendor.PaymentModeID = req.PaymentModeID
	}
	if req.Status != "" {
		vendor.Status = model.VendorStatus(req.Status)
	}

	if err := s.vendorRepo.Update(vendor); err != nil {
		return nil, err
	}

	// Fetch updated vendor with relationships
	updatedVendor, err := s.vendorRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	response := updatedVendor.ToResponse()
	return &response, nil
}

func (s *vendorService) DeleteVendor(id uint) error {
	_, err := s.vendorRepo.FindByID(id)
	if err != nil {
		return err
	}

	return s.vendorRepo.Delete(id)
}

func (s *vendorService) ChangeStatus(id uint, status model.VendorStatus, reason string) (*model.VendorResponse, error) {
	vendor, err := s.vendorRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	vendor.Status = status

	if err := s.vendorRepo.Update(vendor); err != nil {
		return nil, err
	}

	updatedVendor, err := s.vendorRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	response := updatedVendor.ToResponse()
	return &response, nil
}
