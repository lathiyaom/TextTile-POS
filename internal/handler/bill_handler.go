package handler

import (
	"net/http"
	"strconv"

	"github.com/TextTile/pos-go/internal/model"
	"github.com/TextTile/pos-go/internal/service"
	"github.com/TextTile/pos-go/internal/utils"
	"github.com/gin-gonic/gin"
)

type BillHandler struct {
	service service.BillService
}

func NewBillHandler(service service.BillService) *BillHandler {
	return &BillHandler{service: service}
}

// CreateBill godoc
// @Summary Create a new bill
// @Description Create a new bill/invoice
// @Tags bills
// @Accept json
// @Produce json
// @Param bill body model.BillCreateRequest true "Bill creation request"
// @Success 201 {object} utils.SuccessResponse{data=model.BillResponse}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /bills [post]
func (h *BillHandler) CreateBill(c *gin.Context) {
	userID := c.GetUint("userID")

	var req model.BillCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	bill, err := h.service.CreateBill(userID, &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Bill created successfully", bill.ToResponse())
}

// GetAllBills godoc
// @Summary Get all bills
// @Description Get all bills with pagination and filters
// @Tags bills
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(10)
// @Param vendor_id query int false "Filter by vendor ID"
// @Param payment_status query string false "Filter by payment status"
// @Param financial_year query string false "Filter by financial year"
// @Param search query string false "Search by bill number"
// @Success 200 {object} utils.PaginatedResponse{data=[]model.BillResponse}
// @Failure 500 {object} utils.ErrorResponse
// @Router /bills [get]
func (h *BillHandler) GetAllBills(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	filters := make(map[string]interface{})
	
	if vendorID := c.Query("vendor_id"); vendorID != "" {
		if id, err := strconv.ParseUint(vendorID, 10, 32); err == nil {
			filters["vendor_id"] = uint(id)
		}
	}
	
	if paymentStatus := c.Query("payment_status"); paymentStatus != "" {
		filters["payment_status"] = paymentStatus
	}
	
	if financialYear := c.Query("financial_year"); financialYear != "" {
		filters["financial_year"] = financialYear
	}
	
	if search := c.Query("search"); search != "" {
		filters["search"] = search
	}
	
	filters["is_cancelled"] = false // By default, don't show cancelled bills

	bills, total, err := h.service.GetAllBills(page, pageSize, filters)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch bills", err)
		return
	}

	responses := make([]model.BillResponse, len(bills))
	for i, bill := range bills {
		responses[i] = bill.ToResponse()
	}

	totalPages := int(total) / pageSize
	if int(total)%pageSize != 0 {
		totalPages++
	}

	utils.PaginatedSuccessResponse(c, http.StatusOK, "Bills fetched successfully", responses, utils.Pagination{
		Page:       page,
		PageSize:   pageSize,
		TotalItems: total,
		TotalPages: totalPages,
	})
}

// GetBillByID godoc
// @Summary Get bill by ID
// @Description Get a bill by its ID
// @Tags bills
// @Accept json
// @Produce json
// @Param id path int true "Bill ID"
// @Success 200 {object} utils.SuccessResponse{data=model.BillResponse}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /bills/{id} [get]
func (h *BillHandler) GetBillByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid bill ID", err)
		return
	}

	bill, err := h.service.GetBillByID(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Bill fetched successfully", bill.ToResponse())
}

// UpdateBill godoc
// @Summary Update bill
// @Description Update a bill by its ID
// @Tags bills
// @Accept json
// @Produce json
// @Param id path int true "Bill ID"
// @Param bill body model.BillUpdateRequest true "Bill update request"
// @Success 200 {object} utils.SuccessResponse{data=model.BillResponse}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /bills/{id} [put]
func (h *BillHandler) UpdateBill(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid bill ID", err)
		return
	}

	userID := c.GetUint("userID")

	var req model.BillUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	bill, err := h.service.UpdateBill(uint(id), userID, &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Bill updated successfully", bill.ToResponse())
}

// CancelBill godoc
// @Summary Cancel a bill
// @Description Cancel a bill by its ID
// @Tags bills
// @Accept json
// @Produce json
// @Param id path int true "Bill ID"
// @Param request body map[string]string true "Cancel request with reason"
// @Success 200 {object} utils.SuccessResponse{data=model.BillResponse}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /bills/{id}/cancel [post]
func (h *BillHandler) CancelBill(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid bill ID", err)
		return
	}

	userID := c.GetUint("userID")

	var req struct {
		Reason string `json:"reason" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Cancellation reason is required", err)
		return
	}

	bill, err := h.service.CancelBill(uint(id), userID, req.Reason)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Bill cancelled successfully", bill.ToResponse())
}

// RecordPrint godoc
// @Summary Record bill print
// @Description Record that a bill was printed
// @Tags bills
// @Accept json
// @Produce json
// @Param id path int true "Bill ID"
// @Success 200 {object} utils.SuccessResponse{data=model.BillResponse}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /bills/{id}/print [post]
func (h *BillHandler) RecordPrint(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid bill ID", err)
		return
	}

	userID := c.GetUint("userID")

	bill, err := h.service.RecordPrint(uint(id), userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Print recorded successfully", bill.ToResponse())
}

// GetChangeLog godoc
// @Summary Get bill change log
// @Description Get the change log for a bill
// @Tags bills
// @Accept json
// @Produce json
// @Param id path int true "Bill ID"
// @Success 200 {object} utils.SuccessResponse{data=[]model.BillChangeLog}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /bills/{id}/changelog [get]
func (h *BillHandler) GetChangeLog(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid bill ID", err)
		return
	}

	logs, err := h.service.GetChangeLog(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch change log", err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Change log fetched successfully", logs)
}

// DeleteBill godoc
// @Summary Delete bill
// @Description Delete a bill by its ID
// @Tags bills
// @Accept json
// @Produce json
// @Param id path int true "Bill ID"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /bills/{id} [delete]
func (h *BillHandler) DeleteBill(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid bill ID", err)
		return
	}

	if err := h.service.DeleteBill(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Bill deleted successfully", nil)
}
