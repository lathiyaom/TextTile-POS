package repository

import (
	"github.com/TextTile/pos-go/internal/model"
	"gorm.io/gorm"
)

type NoteRepository interface {
	Create(note *model.Note) error
	GetByEntity(entityType model.EntityType, entityID uint) ([]model.Note, error)
	GetByID(id uint) (*model.Note, error)
	Update(note *model.Note) error
	Delete(id uint) error
	CountByEntity(entityType model.EntityType, entityID uint) (int64, error)
}

type noteRepository struct {
	db *gorm.DB
}

func NewNoteRepository(db *gorm.DB) NoteRepository {
	return &noteRepository{db: db}
}

func (r *noteRepository) Create(note *model.Note) error {
	return r.db.Create(note).Error
}

func (r *noteRepository) GetByEntity(entityType model.EntityType, entityID uint) ([]model.Note, error) {
	var notes []model.Note
	if err := r.db.Where("entity_type = ? AND entity_id = ?", entityType, entityID).
		Order("created_at DESC").
		Find(&notes).Error; err != nil {
		return nil, err
	}
	return notes, nil
}

func (r *noteRepository) GetByID(id uint) (*model.Note, error) {
	var note model.Note
	if err := r.db.First(&note, id).Error; err != nil {
		return nil, err
	}
	return &note, nil
}

func (r *noteRepository) Update(note *model.Note) error {
	return r.db.Save(note).Error
}

func (r *noteRepository) Delete(id uint) error {
	return r.db.Delete(&model.Note{}, id).Error
}

func (r *noteRepository) CountByEntity(entityType model.EntityType, entityID uint) (int64, error) {
	var count int64
	if err := r.db.Model(&model.Note{}).
		Where("entity_type = ? AND entity_id = ?", entityType, entityID).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
