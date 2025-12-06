package utils

import (
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"net/http"
)

var validate *validator.Validate

func init() {
	validate = validator.New()
}

// ValidateStruct validates a struct and returns formatted errors
func ValidateStruct(s interface{}) error {
	return validate.Struct(s)
}

// BindAndValidate binds JSON and validates the request
func BindAndValidate(c *gin.Context, req interface{}) bool {
	if err := c.ShouldBindJSON(req); err != nil {
		validationErrors := FormatValidationErrors(err)
		ErrorResponse(c, http.StatusBadRequest, "Validation failed", validationErrors)
		return false
	}
	return true
}
