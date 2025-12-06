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
