package repository

import (
	"github.com/TextTile/pos-go/internal/model"
	"gorm.io/gorm"
)

type POSSettingsRepository interface {
	Get() (*model.POSSettings, error)
	Update(settings *model.POSSettings) error
}

type posSettingsRepository struct {
	db *gorm.DB
}

func NewPOSSettingsRepository(db *gorm.DB) POSSettingsRepository {
	return &posSettingsRepository{db: db}
}

func (r *posSettingsRepository) Get() (*model.POSSettings, error) {
	var settings model.POSSettings
	// Always return the first (and only) settings record
	if err := r.db.First(&settings).Error; err != nil {
		return nil, err
	}
	return &settings, nil
}

func (r *posSettingsRepository) Update(settings *model.POSSettings) error {
	return r.db.Save(settings).Error
}
