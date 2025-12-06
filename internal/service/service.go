package service

import (
	"github.com/TextTile/pos-go/internal/repository"
)

type Services struct {
	UserService        UserService
	VendorTypeService  VendorTypeService
	PaymentModeService PaymentModeService
	VendorService      VendorService
}

func NewServices(
	userRepo repository.UserRepository,
	vendorTypeRepo repository.VendorTypeRepository,
	paymentModeRepo repository.PaymentModeRepository,
	vendorRepo repository.VendorRepository,
) *Services {
	return &Services{
		UserService:        NewUserService(userRepo),
		VendorTypeService:  NewVendorTypeService(vendorTypeRepo),
		PaymentModeService: NewPaymentModeService(paymentModeRepo),
		VendorService:      NewVendorService(vendorRepo, vendorTypeRepo, paymentModeRepo),
	}
}
