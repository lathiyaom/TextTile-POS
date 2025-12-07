package service

import (
	"github.com/TextTile/pos-go/internal/model"
	"github.com/TextTile/pos-go/internal/repository"
)

type POSSettingsService interface {
	GetSettings() (*model.POSSettings, error)
	UpdateSettings(req *model.POSSettingsUpdateRequest) (*model.POSSettings, error)
}

type posSettingsService struct {
	repo repository.POSSettingsRepository
}

func NewPOSSettingsService(repo repository.POSSettingsRepository) POSSettingsService {
	return &posSettingsService{repo: repo}
}

func (s *posSettingsService) GetSettings() (*model.POSSettings, error) {
	return s.repo.Get()
}

func (s *posSettingsService) UpdateSettings(req *model.POSSettingsUpdateRequest) (*model.POSSettings, error) {
	settings, err := s.repo.Get()
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.EnableBillRoundOff != nil {
		settings.EnableBillRoundOff = *req.EnableBillRoundOff
	}
	if req.RoundOffMode != "" {
		settings.RoundOffMode = model.RoundOffMode(req.RoundOffMode)
	}
	if req.RoundOffDecimalPrecision != nil {
		settings.RoundOffDecimalPrecision = *req.RoundOffDecimalPrecision
	}
	if req.AllowPerBillRoundOffOverride != nil {
		settings.AllowPerBillRoundOffOverride = *req.AllowPerBillRoundOffOverride
	}
	if req.RecentVendorDays != nil {
		settings.RecentVendorDays = *req.RecentVendorDays
	}
	if req.VendorPaymentWarningDays != nil {
		settings.VendorPaymentWarningDays = *req.VendorPaymentWarningDays
	}
	if req.DefaultPaymentTermsDays != nil {
		settings.DefaultPaymentTermsDays = *req.DefaultPaymentTermsDays
	}
	if req.BusinessRegisteredState != "" {
		settings.BusinessRegisteredState = req.BusinessRegisteredState
	}
	if req.FinancialYearStartDate != "" {
		settings.FinancialYearStartDate = req.FinancialYearStartDate
	}
	if req.BillNumberPrefix != "" {
		settings.BillNumberPrefix = req.BillNumberPrefix
	}
	if req.BillNumberLength != nil {
		settings.BillNumberLength = *req.BillNumberLength
	}
	if req.EWayBillThresholdAmount != nil {
		settings.EWayBillThresholdAmount = *req.EWayBillThresholdAmount
	}

	if err := s.repo.Update(settings); err != nil {
		return nil, err
	}

	return settings, nil
}
