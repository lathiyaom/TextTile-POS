package main

import (
	"fmt"
	"log"

	"github.com/TextTile/pos-go/internal/config"
	"github.com/TextTile/pos-go/internal/handler"
	"github.com/TextTile/pos-go/internal/migrations"
	"github.com/TextTile/pos-go/internal/repository"
	"github.com/TextTile/pos-go/internal/router"
	"github.com/TextTile/pos-go/internal/service"
	"github.com/TextTile/pos-go/internal/utils"
)

func main() {
	// Initialize logger
	utils.InitLogger()
	utils.Info("Starting POS Application...")

	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load configuration:", err)
	}
	utils.Info("Configuration loaded successfully")

	// Initialize database
	if err := repository.InitDB(cfg); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	db := repository.GetDB()

	// Run migrations
	if err := migrations.RunMigrations(db); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// // Seed initial data
	// if err := migrations.SeedData(db); err != nil {
	// 	log.Fatal("Failed to seed data:", err)
	// }

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	vendorTypeRepo := repository.NewVendorTypeRepository(db)
	paymentModeRepo := repository.NewPaymentModeRepository(db)
	vendorRepo := repository.NewVendorRepository(db)
	vendorNoteRepo := repository.NewVendorNoteRepository(db)
	vendorAuditLogRepo := repository.NewVendorAuditLogRepository(db)
	vendorAttachmentRepo := repository.NewVendorAttachmentRepository(db)

	// Initialize services
	services := service.NewServices(userRepo, vendorTypeRepo, paymentModeRepo, vendorRepo)
	vendorNoteService := service.NewVendorNoteService(vendorNoteRepo, vendorRepo)
	vendorAuditLogService := service.NewVendorAuditLogService(vendorAuditLogRepo)
	vendorAttachmentService := service.NewVendorAttachmentService(vendorAttachmentRepo, vendorRepo)

	// Initialize handlers
	userHandler := handler.NewUserHandler(services.UserService)
	vendorTypeHandler := handler.NewVendorTypeHandler(services.VendorTypeService)
	paymentModeHandler := handler.NewPaymentModeHandler(services.PaymentModeService)
	vendorHandler := handler.NewVendorHandler(services.VendorService)
	vendorNoteHandler := handler.NewVendorNoteHandler(vendorNoteService)
	vendorAuditLogHandler := handler.NewVendorAuditLogHandler(vendorAuditLogService)
	vendorAttachmentHandler := handler.NewVendorAttachmentHandler(vendorAttachmentService)

	// Setup router
	r := router.NewRouter(userHandler, vendorTypeHandler, paymentModeHandler, vendorHandler, vendorNoteHandler, vendorAuditLogHandler, vendorAttachmentHandler, cfg)
	engine := r.Setup()

	// Start server
	addr := fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port)
	utils.Info(fmt.Sprintf("Server starting on %s", addr))
	utils.Info(fmt.Sprintf("Environment: %s", cfg.Server.Env))

	if err := engine.Run(addr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
