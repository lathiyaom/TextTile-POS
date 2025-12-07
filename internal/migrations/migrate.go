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
		&model.PaymentType{},
		&model.Vendor{},
		&model.VendorNote{},
		&model.VendorAuditLog{},
		&model.VendorAttachment{},
		&model.POSSettings{},
		&model.Note{},
		&model.Bill{},
		&model.BillItem{},
		&model.BillChangeLog{},
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

	// Seed default POS Settings if not exists
	var settingsCount int64
	db.Model(&model.POSSettings{}).Count(&settingsCount)
	if settingsCount == 0 {
		defaultSettings := model.POSSettings{
			EnableBillRoundOff:           true,
			RoundOffMode:                 model.RoundOffModeNearestRupee,
			RoundOffDecimalPrecision:     2,
			AllowPerBillRoundOffOverride: false,
			RecentVendorDays:             30,
			VendorPaymentWarningDays:     90,
			DefaultPaymentTermsDays:      30,
			BusinessRegisteredState:      "",
			FinancialYearStartDate:       "04-01",
			BillNumberPrefix:             "BNO-",
			BillNumberLength:             5,
			EWayBillThresholdAmount:      50000,
		}
		if err := db.Create(&defaultSettings).Error; err != nil {
			utils.Error("Failed to seed default POS settings:", err)
			return err
		}
		utils.Info("Default POS settings seeded successfully")
	}

	utils.Info("Seeding completed successfully")
	return nil
}
