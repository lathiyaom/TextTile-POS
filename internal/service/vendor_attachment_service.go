package service

import (
	"mime/multipart"

	"github.com/TextTile/pos-go/internal/model"
	"github.com/TextTile/pos-go/internal/repository"
)

type VendorAttachmentService interface {
	UploadAttachment(vendorID uint, file multipart.File, header *multipart.FileHeader) (*model.VendorAttachmentResponse, error)
	GetAttachmentsByVendorID(vendorID uint) ([]model.VendorAttachmentResponse, error)
	DeleteAttachment(id uint) error
}

type vendorAttachmentService struct {
	attachmentRepo repository.VendorAttachmentRepository
	vendorRepo     repository.VendorRepository
}

func NewVendorAttachmentService(attachmentRepo repository.VendorAttachmentRepository, vendorRepo repository.VendorRepository) VendorAttachmentService {
	return &vendorAttachmentService{
		attachmentRepo: attachmentRepo,
		vendorRepo:     vendorRepo,
	}
}

func (s *vendorAttachmentService) UploadAttachment(vendorID uint, file multipart.File, header *multipart.FileHeader) (*model.VendorAttachmentResponse, error) {
	_, err := s.vendorRepo.FindByID(vendorID)
	if err != nil {
		return nil, err
	}

	fileURL := "/uploads/vendors/" + header.Filename

	attachment := &model.VendorAttachment{
		VendorID: vendorID,
		FileName: header.Filename,
		FileURL:  fileURL,
		FileSize: header.Size,
		MimeType: header.Header.Get("Content-Type"),
	}

	if err := s.attachmentRepo.Create(attachment); err != nil {
		return nil, err
	}

	response := attachment.ToResponse()
	return &response, nil
}

func (s *vendorAttachmentService) GetAttachmentsByVendorID(vendorID uint) ([]model.VendorAttachmentResponse, error) {
	attachments, err := s.attachmentRepo.FindByVendorID(vendorID)
	if err != nil {
		return nil, err
	}

	responses := []model.VendorAttachmentResponse{}
	for _, attachment := range attachments {
		responses = append(responses, attachment.ToResponse())
	}

	return responses, nil
}

func (s *vendorAttachmentService) DeleteAttachment(id uint) error {
	_, err := s.attachmentRepo.FindByID(id)
	if err != nil {
		return err
	}

	return s.attachmentRepo.Delete(id)
}
