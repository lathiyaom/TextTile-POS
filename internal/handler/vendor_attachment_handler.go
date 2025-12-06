package handler

import (
	"net/http"
	"strconv"

	"github.com/TextTile/pos-go/internal/constants"
	"github.com/TextTile/pos-go/internal/service"
	"github.com/TextTile/pos-go/internal/utils"
	"github.com/gin-gonic/gin"
)

type VendorAttachmentHandler struct {
	attachmentService service.VendorAttachmentService
}

func NewVendorAttachmentHandler(attachmentService service.VendorAttachmentService) *VendorAttachmentHandler {
	return &VendorAttachmentHandler{attachmentService: attachmentService}
}

func (h *VendorAttachmentHandler) UploadAttachment(c *gin.Context) {
	vendorID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid vendor ID")
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to read file", err.Error())
		return
	}
	defer file.Close()

	attachment, err := h.attachmentService.UploadAttachment(uint(vendorID), file, header)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to upload attachment", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, constants.MsgCreated, attachment)
}

func (h *VendorAttachmentHandler) GetAttachments(c *gin.Context) {
	vendorID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid vendor ID")
		return
	}

	attachments, err := h.attachmentService.GetAttachmentsByVendorID(uint(vendorID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch attachments", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgSuccess, attachments)
}

func (h *VendorAttachmentHandler) DeleteAttachment(c *gin.Context) {
	attachmentID, err := strconv.ParseUint(c.Param("attachmentId"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid attachment ID")
		return
	}

	if err := h.attachmentService.DeleteAttachment(uint(attachmentID)); err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Failed to delete attachment", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgDeleted, nil)
}
