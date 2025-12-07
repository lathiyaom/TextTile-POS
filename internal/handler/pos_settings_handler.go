package handler

import (
	"net/http"

	"github.com/TextTile/pos-go/internal/model"
	"github.com/TextTile/pos-go/internal/service"
	"github.com/TextTile/pos-go/internal/utils"
	"github.com/gin-gonic/gin"
)

type POSSettingsHandler struct {
	service service.POSSettingsService
}

func NewPOSSettingsHandler(service service.POSSettingsService) *POSSettingsHandler {
	return &POSSettingsHandler{service: service}
}

// GetSettings godoc
// @Summary Get POS settings
// @Description Get the current POS settings
// @Tags pos-settings
// @Accept json
// @Produce json
// @Success 200 {object} utils.SuccessResponse{data=model.POSSettingsResponse}
// @Failure 500 {object} utils.ErrorResponse
// @Router /pos-settings [get]
func (h *POSSettingsHandler) GetSettings(c *gin.Context) {
	settings, err := h.service.GetSettings()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch settings", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Settings fetched successfully", settings.ToResponse())
}

// UpdateSettings godoc
// @Summary Update POS settings
// @Description Update the POS settings
// @Tags pos-settings
// @Accept json
// @Produce json
// @Param settings body model.POSSettingsUpdateRequest true "Settings update request"
// @Success 200 {object} utils.SuccessResponse{data=model.POSSettingsResponse}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /pos-settings [put]
func (h *POSSettingsHandler) UpdateSettings(c *gin.Context) {
	var req model.POSSettingsUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	settings, err := h.service.UpdateSettings(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update settings", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Settings updated successfully", settings.ToResponse())
}
