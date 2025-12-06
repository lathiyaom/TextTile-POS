package migrations

import (
	"github.com/TextTile/pos-go/internal/model"
	"github.com/TextTile/pos-go/internal/utils"
	"gorm.io/gorm"
)

// RunMigrations runs all database migrations
func RunMigrations(db *gorm.DB) error {
	utils.Info("Running database migrations...")

	// Auto migrate models
	err := db.AutoMigrate(
		&model.User{},
		&model.VendorType{},
		&model.PaymentMode{},
		&model.Vendor{},
		&model.VendorNote{},
		&model.VendorAuditLog{},
		&model.VendorAttachment{},
	)

	if err != nil {
		utils.Error("Migration failed:", err)
		return err
	}

	utils.Info("Migrations completed successfully")
	return nil
}

// SeedData seeds initial data
func SeedData(db *gorm.DB) error {
	utils.Info("Seeding initial data...")

	// No default users - users must register themselves

	utils.Info("Seeding completed successfully")
	return nil
}
