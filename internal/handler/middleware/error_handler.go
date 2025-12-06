package middleware

import (
	"net/http"

	"github.com/TextTile/pos-go/internal/utils"
	"github.com/gin-gonic/gin"
)

// ErrorHandler is a global error handling middleware
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Check if there are any errors
		if len(c.Errors) > 0 {
			err := c.Errors.Last()

			// Log the error
			utils.Error("Request error:", err.Error())

			// Check if it's an AppError
			if appErr, ok := err.Err.(*utils.AppError); ok {
				utils.ErrorResponse(c, appErr.Code, appErr.Message, appErr.Err.Error())
				return
			}

			// Default error response
			utils.ErrorResponse(c, http.StatusInternalServerError, "Internal server error", err.Error())
		}
	}
}

// Recovery middleware for panic recovery
func Recovery() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		utils.Error("Panic recovered:", recovered)
		utils.ErrorResponse(c, http.StatusInternalServerError, "Internal server error", "An unexpected error occurred")
		c.AbortWithStatus(http.StatusInternalServerError)
	})
}
