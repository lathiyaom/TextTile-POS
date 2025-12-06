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

type VendorHandler struct {
	vendorService service.VendorService
}

func NewVendorHandler(vendorService service.VendorService) *VendorHandler {
	return &VendorHandler{vendorService: vendorService}
}

// GenerateVendorNo godoc
// @Summary Generate next vendor number
// @Tags vendors
// @Produce json
// @Success 200 {object} utils.Response
// @Router /vendors/generate-number [get]
func (h *VendorHandler) GenerateVendorNo(c *gin.Context) {
	vendorNo, err := h.vendorService.GenerateNextVendorNo()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate vendor number", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgSuccess, gin.H{"vendor_no": vendorNo})
}

// CreateVendor godoc
// @Summary Create a new vendor
// @Tags vendors
// @Accept json
// @Produce json
// @Param vendor body model.VendorCreateRequest true "Vendor creation request"
// @Success 201 {object} utils.Response
// @Router /vendors [post]
func (h *VendorHandler) CreateVendor(c *gin.Context) {
	var req model.VendorCreateRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	vendor, err := h.vendorService.CreateVendor(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to create vendor", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, constants.MsgCreated, vendor)
}

// GetVendor godoc
// @Summary Get vendor by ID
// @Tags vendors
// @Produce json
// @Param id path int true "Vendor ID"
// @Success 200 {object} utils.Response
// @Router /vendors/{id} [get]
func (h *VendorHandler) GetVendor(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid vendor ID")
		return
	}

	vendor, err := h.vendorService.GetVendorByID(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, constants.MsgNotFound, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgSuccess, vendor)
}

// GetAllVendors godoc
// @Summary Get all vendors with pagination and filters
// @Tags vendors
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(10)
// @Param status query string false "Filter by status (active, inactive, blacklisted)"
// @Param search query string false "Search text"
// @Param sort_by query string false "Sort field (vendor_name, status, city, state)"
// @Param sort_dir query string false "Sort direction (ASC, DESC)"
// @Success 200 {object} utils.PaginatedResponse
// @Router /vendors [get]
func (h *VendorHandler) GetAllVendors(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")
	search := c.Query("search")
	sortBy := c.Query("sort_by")
	sortDir := c.Query("sort_dir")

	if sortDir == "" {
		sortDir = "DESC"
	}

	vendors, pagination, err := h.vendorService.GetAllVendors(page, pageSize, status, search, sortBy, sortDir)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch vendors", err.Error())
		return
	}

	utils.PaginatedSuccessResponse(c, http.StatusOK, constants.MsgSuccess, vendors, *pagination)
}

// UpdateVendor godoc
// @Summary Update vendor
// @Tags vendors
// @Accept json
// @Produce json
// @Param id path int true "Vendor ID"
// @Param vendor body model.VendorUpdateRequest true "Vendor update request"
// @Success 200 {object} utils.Response
// @Router /vendors/{id} [put]
func (h *VendorHandler) UpdateVendor(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid vendor ID")
		return
	}

	var req model.VendorUpdateRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	vendor, err := h.vendorService.UpdateVendor(uint(id), &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to update vendor", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgUpdated, vendor)
}

// DeleteVendor godoc
// @Summary Delete vendor
// @Tags vendors
// @Param id path int true "Vendor ID"
// @Success 200 {object} utils.Response
// @Router /vendors/{id} [delete]
func (h *VendorHandler) DeleteVendor(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid vendor ID")
		return
	}

	if err := h.vendorService.DeleteVendor(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Failed to delete vendor", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgDeleted, nil)
}

// ChangeVendorStatus godoc
// @Summary Change vendor status
// @Tags vendors
// @Accept json
// @Produce json
// @Param id path int true "Vendor ID"
// @Param request body object true "Status change request" SchemaExample({"status": "active", "reason": "Optional reason"})
// @Success 200 {object} utils.Response
// @Router /vendors/{id}/status [patch]
func (h *VendorHandler) ChangeVendorStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid vendor ID")
		return
	}

	var req struct {
		Status string `json:"status" binding:"required,oneof=active inactive blacklisted"`
		Reason string `json:"reason"`
	}

	if !utils.BindAndValidate(c, &req) {
		return
	}

	vendor, err := h.vendorService.ChangeStatus(uint(id), model.VendorStatus(req.Status), req.Reason)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to change status", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Status updated successfully", vendor)
}
