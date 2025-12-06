package service

import (
	"github.com/TextTile/pos-go/internal/model"
	"github.com/TextTile/pos-go/internal/repository"
)

type VendorAuditLogService interface {
	CreateLog(log *model.VendorAuditLog) error
	GetLogsByVendorID(vendorID uint) ([]model.VendorAuditLogResponse, error)
}

type vendorAuditLogService struct {
	logRepo repository.VendorAuditLogRepository
}

func NewVendorAuditLogService(logRepo repository.VendorAuditLogRepository) VendorAuditLogService {
	return &vendorAuditLogService{
		logRepo: logRepo,
	}
}

func (s *vendorAuditLogService) CreateLog(log *model.VendorAuditLog) error {
	return s.logRepo.Create(log)
}

func (s *vendorAuditLogService) GetLogsByVendorID(vendorID uint) ([]model.VendorAuditLogResponse, error) {
	logs, err := s.logRepo.FindByVendorID(vendorID)
	if err != nil {
		return nil, err
	}

	responses := []model.VendorAuditLogResponse{}
	for _, log := range logs {
		responses = append(responses, log.ToResponse())
	}

	return responses, nil
}

