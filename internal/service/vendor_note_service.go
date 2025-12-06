package service

import (
	"errors"

	"github.com/TextTile/pos-go/internal/model"
	"github.com/TextTile/pos-go/internal/repository"
)

type VendorNoteService interface {
	CreateNote(vendorID uint, req *model.VendorNoteCreateRequest) (*model.VendorNoteResponse, error)
	GetNotesByVendorID(vendorID uint) ([]model.VendorNoteResponse, error)
	UpdateNote(vendorID uint, noteID uint, req *model.VendorNoteCreateRequest) (*model.VendorNoteResponse, error)
	DeleteNote(id uint) error
}

type vendorNoteService struct {
	noteRepo   repository.VendorNoteRepository
	vendorRepo repository.VendorRepository
}

func NewVendorNoteService(noteRepo repository.VendorNoteRepository, vendorRepo repository.VendorRepository) VendorNoteService {
	return &vendorNoteService{
		noteRepo:   noteRepo,
		vendorRepo: vendorRepo,
	}
}

func (s *vendorNoteService) CreateNote(vendorID uint, req *model.VendorNoteCreateRequest) (*model.VendorNoteResponse, error) {
	_, err := s.vendorRepo.FindByID(vendorID)
	if err != nil {
		return nil, err
	}

	note := &model.VendorNote{
		VendorID: vendorID,
		NoteText: req.NoteText,
	}

	if err := s.noteRepo.Create(note); err != nil {
		return nil, err
	}

	response := note.ToResponse()
	return &response, nil
}

func (s *vendorNoteService) GetNotesByVendorID(vendorID uint) ([]model.VendorNoteResponse, error) {
	notes, err := s.noteRepo.FindByVendorID(vendorID)
	if err != nil {
		return nil, err
	}

	responses := []model.VendorNoteResponse{}
	for _, note := range notes {
		responses = append(responses, note.ToResponse())
	}

	return responses, nil
}

func (s *vendorNoteService) DeleteNote(id uint) error {
	_, err := s.noteRepo.FindByID(id)
	if err != nil {
		return err
	}

	return s.noteRepo.Delete(id)
}

func (s *vendorNoteService) UpdateNote(vendorID uint, noteID uint, req *model.VendorNoteCreateRequest) (*model.VendorNoteResponse, error) {
	note, err := s.noteRepo.FindByID(noteID)
	if err != nil {
		return nil, err
	}

	if note.VendorID != vendorID {
		return nil, errors.New("note does not belong to this vendor")
	}

	note.NoteText = req.NoteText
	if err := s.noteRepo.Update(note); err != nil {
		return nil, err
	}

	response := note.ToResponse()
	return &response, nil
}
