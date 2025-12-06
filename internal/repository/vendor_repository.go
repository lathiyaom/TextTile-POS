package repository

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/TextTile/pos-go/internal/model"
	"gorm.io/gorm"
)

type VendorRepository interface {
	Create(vendor *model.Vendor) error
	FindByID(id uint) (*model.Vendor, error)
	FindAll(page, pageSize int, status, search, sortBy, sortDir string) ([]model.Vendor, int64, error)
	Update(vendor *model.Vendor) error
	Delete(id uint) error
	GenerateVendorNo() (string, error)
	GetLatestVendorNo() (string, error)
}

type vendorRepository struct {
	db *gorm.DB
}

func NewVendorRepository(db *gorm.DB) VendorRepository {
	return &vendorRepository{db: db}
}

func (r *vendorRepository) Create(vendor *model.Vendor) error {
	return r.db.Create(vendor).Error
}

func (r *vendorRepository) FindByID(id uint) (*model.Vendor, error) {
	var vendor model.Vendor
	err := r.db.Preload("VendorType").Preload("PaymentMode").First(&vendor, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("vendor not found")
		}
		return nil, err
	}
	return &vendor, nil
}

func (r *vendorRepository) FindAll(page, pageSize int, status, search, sortBy, sortDir string) ([]model.Vendor, int64, error) {
	var vendors []model.Vendor
	var total int64

	offset := (page - 1) * pageSize

	query := r.db.Model(&model.Vendor{}).Preload("VendorType").Preload("PaymentMode")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if search != "" {
		searchPattern := "%" + strings.ToLower(search) + "%"
		query = query.Where(
			"LOWER(vendor_name) LIKE ? OR LOWER(business_name) LIKE ? OR LOWER(vendor_no) LIKE ? OR LOWER(mobile_number) LIKE ? OR LOWER(email) LIKE ? OR LOWER(city) LIKE ? OR LOWER(state) LIKE ?",
			searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
		)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	orderBy := "created_at DESC"
	if sortBy != "" {
		validSortFields := map[string]string{
			"vendor_name": "vendor_name",
			"status":      "status",
			"city":        "city",
			"state":       "state",
		}
		if field, ok := validSortFields[sortBy]; ok {
			if sortDir == "ASC" || sortDir == "asc" {
				orderBy = field + " ASC"
			} else {
				orderBy = field + " DESC"
			}
		}
	}

	err := query.Offset(offset).Limit(pageSize).Order(orderBy).Find(&vendors).Error
	if err != nil {
		return nil, 0, err
	}

	return vendors, total, nil
}

func (r *vendorRepository) Update(vendor *model.Vendor) error {
	return r.db.Save(vendor).Error
}

func (r *vendorRepository) Delete(id uint) error {
	return r.db.Delete(&model.Vendor{}, id).Error
}

func (r *vendorRepository) GetLatestVendorNo() (string, error) {
	var vendor model.Vendor
	err := r.db.Order("id DESC").First(&vendor).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", nil // No vendors exist yet
		}
		return "", err
	}
	return vendor.VendorNo, nil
}

func getFinancialYear() (int, int) {
	now := time.Now()
	year := now.Year()
	month := int(now.Month())

	if month >= 4 {
		return year, year + 1
	}
	return year - 1, year
}

func (r *vendorRepository) GenerateVendorNo() (string, error) {
	startYear, endYear := getFinancialYear()
	fyPrefix := fmt.Sprintf("VEN-%d-%d-", startYear, endYear)

	var maxSequence int
	var latestVendor model.Vendor

	err := r.db.Where("vendor_no LIKE ?", fyPrefix+"%").Order("vendor_no DESC").First(&latestVendor).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			maxSequence = 0
		} else {
			return "", err
		}
	} else {
		var sequence int
		_, err := fmt.Sscanf(latestVendor.VendorNo, fyPrefix+"%05d", &sequence)
		if err != nil {
			return "", fmt.Errorf("failed to parse vendor number: %w", err)
		}
		maxSequence = sequence
	}

	nextSequence := maxSequence + 1
	return fmt.Sprintf("%s%05d", fyPrefix, nextSequence), nil
}
