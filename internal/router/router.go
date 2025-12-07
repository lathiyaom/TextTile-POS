package router

import (
	"github.com/TextTile/pos-go/internal/config"
	"github.com/TextTile/pos-go/internal/handler"
	"github.com/TextTile/pos-go/internal/handler/middleware"
	"github.com/gin-gonic/gin"
)

type Router struct {
	engine                  *gin.Engine
	userHandler             *handler.UserHandler
	vendorTypeHandler       *handler.VendorTypeHandler
	paymentModeHandler      *handler.PaymentModeHandler
	paymentTypeHandler      *handler.PaymentTypeHandler
	vendorHandler           *handler.VendorHandler
	vendorNoteHandler       *handler.VendorNoteHandler
	vendorAuditLogHandler   *handler.VendorAuditLogHandler
	vendorAttachmentHandler *handler.VendorAttachmentHandler
	posSettingsHandler      *handler.POSSettingsHandler
	noteHandler             *handler.NoteHandler
	billHandler             *handler.BillHandler
	config                  *config.Config
}

func NewRouter(
	userHandler *handler.UserHandler,
	vendorTypeHandler *handler.VendorTypeHandler,
	paymentModeHandler *handler.PaymentModeHandler,
	paymentTypeHandler *handler.PaymentTypeHandler,
	vendorHandler *handler.VendorHandler,
	vendorNoteHandler *handler.VendorNoteHandler,
	vendorAuditLogHandler *handler.VendorAuditLogHandler,
	vendorAttachmentHandler *handler.VendorAttachmentHandler,
	posSettingsHandler *handler.POSSettingsHandler,
	noteHandler *handler.NoteHandler,
	billHandler *handler.BillHandler,
	cfg *config.Config,
) *Router {
	return &Router{
		engine:                  gin.Default(),
		userHandler:             userHandler,
		vendorTypeHandler:       vendorTypeHandler,
		paymentModeHandler:      paymentModeHandler,
		paymentTypeHandler:      paymentTypeHandler,
		vendorHandler:           vendorHandler,
		vendorNoteHandler:       vendorNoteHandler,
		vendorAuditLogHandler:   vendorAuditLogHandler,
		vendorAttachmentHandler: vendorAttachmentHandler,
		posSettingsHandler:      posSettingsHandler,
		noteHandler:             noteHandler,
		billHandler:             billHandler,
		config:                  cfg,
	}
}

func (r *Router) Setup() *gin.Engine {
	// Global middleware
	r.engine.Use(middleware.Recovery())
	r.engine.Use(middleware.ErrorHandler())
	r.engine.Use(r.corsMiddleware())

	// Health check
	r.engine.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API v1 routes
	v1 := r.engine.Group("/api/v1")
	{
		r.setupAuthRoutes(v1)
		r.setupUserRoutes(v1)
		r.setupVendorTypeRoutes(v1)
		r.setupPaymentModeRoutes(v1)
		r.setupPaymentTypeRoutes(v1)
		r.setupVendorRoutes(v1)
		r.setupPOSSettingsRoutes(v1)
		r.setupBillRoutes(v1)
		r.setupNoteRoutes(v1)
	}

	return r.engine
}

func (r *Router) corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
