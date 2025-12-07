package handler

import (
	"net/http"
	"strconv"

	"github.com/TextTile/pos-go/internal/model"
	"github.com/TextTile/pos-go/internal/service"
	"github.com/TextTile/pos-go/internal/utils"
	"github.com/gin-gonic/gin"
)

type PaymentTypeHandler struct {
	service service.PaymentTypeService
}

func NewPaymentTypeHandler(service service.PaymentTypeService) *PaymentTypeHandler {
	return &PaymentTypeHandler{service: service}
}

// CreatePaymentType godoc
// @Summary Create a new payment type
// @Description Create a new payment type
// @Tags payment-types
// @Accept json
// @Produce json
// @Param paymentType body model.PaymentTypeCreateRequest true "Payment type creation request"
// @Success 201 {object} utils.SuccessResponse{data=model.PaymentTypeResponse}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /payment-types [post]
func (h *PaymentTypeHandler) CreatePaymentType(c *gin.Context) {
	var req model.PaymentTypeCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	paymentType, err := h.service.CreatePaymentType(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create payment type", err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Payment type created successfully", paymentType.ToResponse())
}

// GetAllPaymentTypes godoc
// @Summary Get all payment types
// @Description Get all payment types
// @Tags payment-types
// @Accept json
// @Produce json
// @Success 200 {object} utils.SuccessResponse{data=[]model.PaymentTypeResponse}
// @Failure 500 {object} utils.ErrorResponse
// @Router /payment-types [get]
func (h *PaymentTypeHandler) GetAllPaymentTypes(c *gin.Context) {
	paymentTypes, err := h.service.GetAllPaymentTypes()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch payment types", err)
		return
	}

	responses := make([]model.PaymentTypeResponse, len(paymentTypes))
	for i, pt := range paymentTypes {
		responses[i] = pt.ToResponse()
	}

	utils.SuccessResponse(c, http.StatusOK, "Payment types fetched successfully", responses)
}

// GetPaymentTypeByID godoc
// @Summary Get payment type by ID
// @Description Get a payment type by its ID
// @Tags payment-types
// @Accept json
// @Produce json
// @Param id path int true "Payment Type ID"
// @Success 200 {object} utils.SuccessResponse{data=model.PaymentTypeResponse}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /payment-types/{id} [get]
func (h *PaymentTypeHandler) GetPaymentTypeByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid payment type ID", err)
		return
	}

	paymentType, err := h.service.GetPaymentTypeByID(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Payment type fetched successfully", paymentType.ToResponse())
}

// UpdatePaymentType godoc
// @Summary Update payment type
// @Description Update a payment type by its ID
// @Tags payment-types
// @Accept json
// @Produce json
// @Param id path int true "Payment Type ID"
// @Param paymentType body model.PaymentTypeUpdateRequest true "Payment type update request"
// @Success 200 {object} utils.SuccessResponse{data=model.PaymentTypeResponse}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /payment-types/{id} [put]
func (h *PaymentTypeHandler) UpdatePaymentType(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid payment type ID", err)
		return
	}

	var req model.PaymentTypeUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	paymentType, err := h.service.UpdatePaymentType(uint(id), &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Payment type updated successfully", paymentType.ToResponse())
}

// DeletePaymentType godoc
// @Summary Delete payment type
// @Description Delete a payment type by its ID
// @Tags payment-types
// @Accept json
// @Produce json
// @Param id path int true "Payment Type ID"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /payment-types/{id} [delete]
func (h *PaymentTypeHandler) DeletePaymentType(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid payment type ID", err)
		return
	}

	if err := h.service.DeletePaymentType(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Payment type deleted successfully", nil)
}
