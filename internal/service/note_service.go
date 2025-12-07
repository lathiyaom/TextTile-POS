package service

import (
	"errors"
	// "fmt"

	"github.com/TextTile/pos-go/internal/model"
	"github.com/TextTile/pos-go/internal/repository"
	"gorm.io/gorm"
)

type NoteService interface {
	CreateNote(entityType model.EntityType, entityID, userID uint, req *model.NoteCreateRequest) (*model.Note, error)
	GetNotesByEntity(entityType model.EntityType, entityID uint) ([]model.Note, error)
	GetNoteByID(id uint) (*model.Note, error)
	UpdateNote(id, userID uint, req *model.NoteUpdateRequest) (*model.Note, error)
	DeleteNote(id uint) error
}

type noteService struct {
	repo repository.NoteRepository
}

func NewNoteService(repo repository.NoteRepository) NoteService {
	return &noteService{repo: repo}
}

func (s *noteService) CreateNote(entityType model.EntityType, entityID, userID uint, req *model.NoteCreateRequest) (*model.Note, error) {
	// Check note limit for bills (max 3)
	if entityType == model.EntityTypeBill {
		count, err := s.repo.CountByEntity(entityType, entityID)
		if err != nil {
			return nil, err
		}
		if count >= 3 {
			return nil, errors.New("maximum 3 notes allowed per bill")
		}
	}

	note := &model.Note{
		EntityType: entityType,
		EntityID:   entityID,
		NoteText:   req.NoteText,
		CreatedBy:  userID,
	}

	if err := s.repo.Create(note); err != nil {
		return nil, err
	}

	return note, nil
}

func (s *noteService) GetNotesByEntity(entityType model.EntityType, entityID uint) ([]model.Note, error) {
	return s.repo.GetByEntity(entityType, entityID)
}

func (s *noteService) GetNoteByID(id uint) (*model.Note, error) {
	note, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("note not found")
		}
		return nil, err
	}
	return note, nil
}

func (s *noteService) UpdateNote(id, userID uint, req *model.NoteUpdateRequest) (*model.Note, error) {
	note, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("note not found")
		}
		return nil, err
	}

	note.NoteText = req.NoteText
	note.UpdatedBy = &userID

	if err := s.repo.Update(note); err != nil {
		return nil, err
	}

	return note, nil
}

func (s *noteService) DeleteNote(id uint) error {
	_, err := s.repo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("note not found")
		}
		return err
	}

	return s.repo.Delete(id)
}
