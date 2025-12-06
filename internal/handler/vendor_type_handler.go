package handler

import (
	"net/http"
	"strconv"

	"github.com/TextTile/pos-go/internal/constants"
	"github.com/TextTile/pos-go/internal/model"
	"github.com/TextTile/pos-go/internal/service"
	"github.com/TextTile/pos-go/internal/utils"
	"github.com/gin-gonic/gin"
)

type VendorTypeHandler struct {
	vendorTypeService service.VendorTypeService
}

func NewVendorTypeHandler(vendorTypeService service.VendorTypeService) *VendorTypeHandler {
	return &VendorTypeHandler{vendorTypeService: vendorTypeService}
}

// CreateVendorType godoc
// @Summary Create a new vendor type
// @Tags vendor-types
// @Accept json
// @Produce json
// @Param vendorType body model.VendorTypeCreateRequest true "Vendor type creation request"
// @Success 201 {object} utils.Response
// @Router /vendor-types [post]
func (h *VendorTypeHandler) CreateVendorType(c *gin.Context) {
	var req model.VendorTypeCreateRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	vendorType, err := h.vendorTypeService.CreateVendorType(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to create vendor type", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, constants.MsgCreated, vendorType)
}

// GetVendorType godoc
// @Summary Get vendor type by ID
// @Tags vendor-types
// @Produce json
// @Param id path int true "Vendor Type ID"
// @Success 200 {object} utils.Response
// @Router /vendor-types/{id} [get]
func (h *VendorTypeHandler) GetVendorType(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid vendor type ID")
		return
	}

	vendorType, err := h.vendorTypeService.GetVendorTypeByID(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, constants.MsgNotFound, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgSuccess, vendorType)
}

// GetAllVendorTypes godoc
// @Summary Get all vendor types
// @Tags vendor-types
// @Produce json
// @Success 200 {object} utils.Response
// @Router /vendor-types [get]
func (h *VendorTypeHandler) GetAllVendorTypes(c *gin.Context) {
	vendorTypes, err := h.vendorTypeService.GetAllVendorTypes()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch vendor types", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgSuccess, vendorTypes)
}

// UpdateVendorType godoc
// @Summary Update vendor type
// @Tags vendor-types
// @Accept json
// @Produce json
// @Param id path int true "Vendor Type ID"
// @Param vendorType body model.VendorTypeUpdateRequest true "Vendor type update request"
// @Success 200 {object} utils.Response
// @Router /vendor-types/{id} [put]
func (h *VendorTypeHandler) UpdateVendorType(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid vendor type ID")
		return
	}

	var req model.VendorTypeUpdateRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	vendorType, err := h.vendorTypeService.UpdateVendorType(uint(id), &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to update vendor type", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgUpdated, vendorType)
}

// DeleteVendorType godoc
// @Summary Delete vendor type
// @Tags vendor-types
// @Param id path int true "Vendor Type ID"
// @Success 200 {object} utils.Response
// @Router /vendor-types/{id} [delete]
func (h *VendorTypeHandler) DeleteVendorType(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid vendor type ID")
		return
	}

	if err := h.vendorTypeService.DeleteVendorType(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Failed to delete vendor type", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgDeleted, nil)
}
