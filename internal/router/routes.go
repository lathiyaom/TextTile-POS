package router

import (
	"github.com/TextTile/pos-go/internal/handler/middleware"
	"github.com/gin-gonic/gin"
)

func (r *Router) setupAuthRoutes(rg *gin.RouterGroup) {
	auth := rg.Group("/auth")
	{
		auth.POST("/register", r.userHandler.Register)
		auth.POST("/login", r.userHandler.Login)
		auth.GET("/profile", middleware.AuthMiddleware(), r.userHandler.GetProfile)
	}
}

func (r *Router) setupUserRoutes(rg *gin.RouterGroup) {
	users := rg.Group("/users")
	users.Use(middleware.AuthMiddleware())
	{
		users.POST("", r.userHandler.CreateUser)
		users.GET("", r.userHandler.GetAllUsers)
		users.GET("/:id", r.userHandler.GetUser)
		users.PUT("/:id", r.userHandler.UpdateUser)
		users.DELETE("/:id", r.userHandler.DeleteUser)
	}
}

func (r *Router) setupPaymentTypeRoutes(rg *gin.RouterGroup) {
	paymentTypes := rg.Group("/payment-types")
	paymentTypes.Use(middleware.AuthMiddleware())
	{
		paymentTypes.POST("", r.paymentTypeHandler.CreatePaymentType)
		paymentTypes.GET("", r.paymentTypeHandler.GetAllPaymentTypes)
		paymentTypes.GET("/:id", r.paymentTypeHandler.GetPaymentTypeByID)
		paymentTypes.PUT("/:id", r.paymentTypeHandler.UpdatePaymentType)
		paymentTypes.DELETE("/:id", r.paymentTypeHandler.DeletePaymentType)
	}
}

func (r *Router) setupPOSSettingsRoutes(rg *gin.RouterGroup) {
	settings := rg.Group("/pos-settings")
	settings.Use(middleware.AuthMiddleware())
	{
		settings.GET("", r.posSettingsHandler.GetSettings)
		settings.PUT("", r.posSettingsHandler.UpdateSettings)
	}
}

func (r *Router) setupBillRoutes(rg *gin.RouterGroup) {
	bills := rg.Group("/bills")
	bills.Use(middleware.AuthMiddleware())
	{
		bills.POST("", r.billHandler.CreateBill)
		bills.GET("", r.billHandler.GetAllBills)
		bills.GET("/:id", r.billHandler.GetBillByID)
		bills.PUT("/:id", r.billHandler.UpdateBill)
		bills.DELETE("/:id", r.billHandler.DeleteBill)
		bills.POST("/:id/cancel", r.billHandler.CancelBill)
		bills.POST("/:id/print", r.billHandler.RecordPrint)
		bills.GET("/:id/changelog", r.billHandler.GetChangeLog)
	}
}

func (r *Router) setupNoteRoutes(rg *gin.RouterGroup) {
	// Generic notes routes for any entity
	notes := rg.Group("/:entityType/:entityId/notes")
	notes.Use(middleware.AuthMiddleware())
	{
		notes.POST("", r.noteHandler.CreateNote)
		notes.GET("", r.noteHandler.GetNotesByEntity)
		notes.PUT("/:noteId", r.noteHandler.UpdateNote)
		notes.DELETE("/:noteId", r.noteHandler.DeleteNote)
	}
}
