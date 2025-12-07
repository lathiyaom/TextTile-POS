package service

import (
	"github.com/TextTile/pos-go/internal/repository"
)

type Services struct {
	UserService         UserService
	VendorTypeService   VendorTypeService
	PaymentModeService  PaymentModeService
	PaymentTypeService  PaymentTypeService
	VendorService       VendorService
	POSSettingsService  POSSettingsService
	NoteService         NoteService
	BillService         BillService
}

func NewServices(
	userRepo repository.UserRepository,
	vendorTypeRepo repository.VendorTypeRepository,
	paymentModeRepo repository.PaymentModeRepository,
	paymentTypeRepo repository.PaymentTypeRepository,
	vendorRepo repository.VendorRepository,
	posSettingsRepo repository.POSSettingsRepository,
	noteRepo repository.NoteRepository,
	billRepo repository.BillRepository,
) *Services {
	return &Services{
		UserService:         NewUserService(userRepo),
		VendorTypeService:   NewVendorTypeService(vendorTypeRepo),
		PaymentModeService:  NewPaymentModeService(paymentModeRepo),
		PaymentTypeService:  NewPaymentTypeService(paymentTypeRepo),
		VendorService:       NewVendorService(vendorRepo, vendorTypeRepo, paymentModeRepo),
		POSSettingsService:  NewPOSSettingsService(posSettingsRepo),
		NoteService:         NewNoteService(noteRepo),
		BillService:         NewBillService(billRepo, vendorRepo, posSettingsRepo),
	}
}
