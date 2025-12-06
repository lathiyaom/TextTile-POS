package handler

import (
	"net/http"
	"strconv"

	"github.com/TextTile/pos-go/internal/constants"
	"github.com/TextTile/pos-go/internal/service"
	"github.com/TextTile/pos-go/internal/utils"
	"github.com/gin-gonic/gin"
)

type VendorAuditLogHandler struct {
	logService service.VendorAuditLogService
}

func NewVendorAuditLogHandler(logService service.VendorAuditLogService) *VendorAuditLogHandler {
	return &VendorAuditLogHandler{logService: logService}
}

func (h *VendorAuditLogHandler) GetActivity(c *gin.Context) {
	vendorID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid vendor ID")
		return
	}

	logs, err := h.logService.GetLogsByVendorID(uint(vendorID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch activity logs", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgSuccess, logs)
}
