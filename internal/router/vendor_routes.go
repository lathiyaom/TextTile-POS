package router

import (
	"github.com/TextTile/pos-go/internal/handler/middleware"
	"github.com/gin-gonic/gin"
)

func (r *Router) setupVendorTypeRoutes(rg *gin.RouterGroup) {
	vendorTypes := rg.Group("/vendor-types")
	vendorTypes.Use(middleware.AuthMiddleware())
	{
		vendorTypes.POST("", r.vendorTypeHandler.CreateVendorType)
		vendorTypes.GET("", r.vendorTypeHandler.GetAllVendorTypes)
		vendorTypes.GET("/:id", r.vendorTypeHandler.GetVendorType)
		vendorTypes.PUT("/:id", r.vendorTypeHandler.UpdateVendorType)
		vendorTypes.DELETE("/:id", r.vendorTypeHandler.DeleteVendorType)
	}
}

func (r *Router) setupPaymentModeRoutes(rg *gin.RouterGroup) {
	paymentModes := rg.Group("/payment-modes")
	paymentModes.Use(middleware.AuthMiddleware())
	{
		paymentModes.POST("", r.paymentModeHandler.CreatePaymentMode)
		paymentModes.GET("", r.paymentModeHandler.GetAllPaymentModes)
		paymentModes.GET("/:id", r.paymentModeHandler.GetPaymentMode)
		paymentModes.PUT("/:id", r.paymentModeHandler.UpdatePaymentMode)
		paymentModes.DELETE("/:id", r.paymentModeHandler.DeletePaymentMode)
	}
}

func (r *Router) setupVendorRoutes(rg *gin.RouterGroup) {
	vendors := rg.Group("/vendors")
	vendors.Use(middleware.AuthMiddleware())
	{
		vendors.GET("/generate-number", r.vendorHandler.GenerateVendorNo)
		vendors.POST("", r.vendorHandler.CreateVendor)
		vendors.GET("", r.vendorHandler.GetAllVendors)
		vendors.GET("/:id", r.vendorHandler.GetVendor)
		vendors.PUT("/:id", r.vendorHandler.UpdateVendor)
		vendors.PATCH("/:id/status", r.vendorHandler.ChangeVendorStatus)
		vendors.DELETE("/:id", r.vendorHandler.DeleteVendor)

		vendors.POST("/:id/notes", r.vendorNoteHandler.CreateNote)
		vendors.GET("/:id/notes", r.vendorNoteHandler.GetNotes)
		vendors.DELETE("/:id/notes/:noteId", r.vendorNoteHandler.DeleteNote)

		vendors.GET("/:id/activity", r.vendorAuditLogHandler.GetActivity)

		vendors.POST("/:id/attachments", r.vendorAttachmentHandler.UploadAttachment)
		vendors.GET("/:id/attachments", r.vendorAttachmentHandler.GetAttachments)
		vendors.DELETE("/:id/attachments/:attachmentId", r.vendorAttachmentHandler.DeleteAttachment)
	}
}
