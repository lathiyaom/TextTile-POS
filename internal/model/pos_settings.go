package model

import (
	"time"

	"gorm.io/gorm"
)

// RoundOffMode represents the rounding mode for bills
type RoundOffMode string

const (
	RoundOffModeNearestRupee RoundOffMode = "nearest_rupee"
	RoundOffModeRoundUp      RoundOffMode = "round_up"
	RoundOffModeRoundDown    RoundOffMode = "round_down"
	RoundOffModeNearest050   RoundOffMode = "nearest_0.50"
)

// POSSettings represents the global POS configuration
type POSSettings struct {
	ID                          uint           `gorm:"primaryKey" json:"id"`
	// Bill Rounding Settings
	EnableBillRoundOff          bool           `gorm:"default:true" json:"enable_bill_round_off"`
	RoundOffMode                RoundOffMode   `gorm:"type:varchar(20);default:'nearest_rupee'" json:"round_off_mode"`
	RoundOffDecimalPrecision    int            `gorm:"default:2" json:"round_off_decimal_precision"`
	AllowPerBillRoundOffOverride bool          `gorm:"default:false" json:"allow_per_bill_round_off_override"`
	
	// Vendor & Payment Behavior Settings
	RecentVendorDays            int            `gorm:"default:30" json:"recent_vendor_days"`
	VendorPaymentWarningDays    int            `gorm:"default:90" json:"vendor_payment_warning_days"`
	DefaultPaymentTermsDays     int            `gorm:"default:30" json:"default_payment_terms_days"`
	
	// GST & Business Settings
	BusinessRegisteredState     string         `gorm:"type:varchar(100)" json:"business_registered_state"`
	
	// Financial Year & Bill Numbering
	FinancialYearStartDate      string         `gorm:"type:varchar(10);default:'04-01'" json:"financial_year_start_date"` // MM-DD format
	BillNumberPrefix            string         `gorm:"type:varchar(20);default:'BNO-'" json:"bill_number_prefix"`
	BillNumberLength            int            `gorm:"default:5" json:"bill_number_length"`
	
	// E-Way Bill Settings
	EWayBillThresholdAmount     float64        `gorm:"type:decimal(15,2);default:50000" json:"eway_bill_threshold_amount"`
	
	CreatedAt                   time.Time      `json:"created_at"`
	UpdatedAt                   time.Time      `json:"updated_at"`
	DeletedAt                   gorm.DeletedAt `gorm:"index" json:"-"`
}

// POSSettingsUpdateRequest represents the request body for updating POS settings
type POSSettingsUpdateRequest struct {
	EnableBillRoundOff           *bool    `json:"enable_bill_round_off"`
	RoundOffMode                 string   `json:"round_off_mode" binding:"omitempty,oneof=nearest_rupee round_up round_down nearest_0.50"`
	RoundOffDecimalPrecision     *int     `json:"round_off_decimal_precision" binding:"omitempty,min=0,max=2"`
	AllowPerBillRoundOffOverride *bool    `json:"allow_per_bill_round_off_override"`
	RecentVendorDays             *int     `json:"recent_vendor_days" binding:"omitempty,min=1"`
	VendorPaymentWarningDays     *int     `json:"vendor_payment_warning_days" binding:"omitempty,min=1"`
	DefaultPaymentTermsDays      *int     `json:"default_payment_terms_days" binding:"omitempty,min=0"`
	BusinessRegisteredState      string   `json:"business_registered_state" binding:"omitempty,max=100"`
	FinancialYearStartDate       string   `json:"financial_year_start_date" binding:"omitempty"`
	BillNumberPrefix             string   `json:"bill_number_prefix" binding:"omitempty,max=20"`
	BillNumberLength             *int     `json:"bill_number_length" binding:"omitempty,min=3,max=10"`
	EWayBillThresholdAmount      *float64 `json:"eway_bill_threshold_amount" binding:"omitempty,min=0"`
}

// POSSettingsResponse represents the POS settings response
type POSSettingsResponse struct {
	ID                           uint         `json:"id"`
	EnableBillRoundOff           bool         `json:"enable_bill_round_off"`
	RoundOffMode                 RoundOffMode `json:"round_off_mode"`
	RoundOffDecimalPrecision     int          `json:"round_off_decimal_precision"`
	AllowPerBillRoundOffOverride bool         `json:"allow_per_bill_round_off_override"`
	RecentVendorDays             int          `json:"recent_vendor_days"`
	VendorPaymentWarningDays     int          `json:"vendor_payment_warning_days"`
	DefaultPaymentTermsDays      int          `json:"default_payment_terms_days"`
	BusinessRegisteredState      string       `json:"business_registered_state"`
	FinancialYearStartDate       string       `json:"financial_year_start_date"`
	BillNumberPrefix             string       `json:"bill_number_prefix"`
	BillNumberLength             int          `json:"bill_number_length"`
	EWayBillThresholdAmount      float64      `json:"eway_bill_threshold_amount"`
	CreatedAt                    time.Time    `json:"created_at"`
	UpdatedAt                    time.Time    `json:"updated_at"`
}

// ToResponse converts POSSettings to POSSettingsResponse
func (ps *POSSettings) ToResponse() POSSettingsResponse {
	return POSSettingsResponse{
		ID:                           ps.ID,
		EnableBillRoundOff:           ps.EnableBillRoundOff,
		RoundOffMode:                 ps.RoundOffMode,
		RoundOffDecimalPrecision:     ps.RoundOffDecimalPrecision,
		AllowPerBillRoundOffOverride: ps.AllowPerBillRoundOffOverride,
		RecentVendorDays:             ps.RecentVendorDays,
		VendorPaymentWarningDays:     ps.VendorPaymentWarningDays,
		DefaultPaymentTermsDays:      ps.DefaultPaymentTermsDays,
		BusinessRegisteredState:      ps.BusinessRegisteredState,
		FinancialYearStartDate:       ps.FinancialYearStartDate,
		BillNumberPrefix:             ps.BillNumberPrefix,
		BillNumberLength:             ps.BillNumberLength,
		EWayBillThresholdAmount:      ps.EWayBillThresholdAmount,
		CreatedAt:                    ps.CreatedAt,
		UpdatedAt:                    ps.UpdatedAt,
	}
}

// TableName specifies the table name for GORM
func (POSSettings) TableName() string {
	return "pos_settings"
}
