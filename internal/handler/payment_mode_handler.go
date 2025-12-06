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

type PaymentModeHandler struct {
	paymentModeService service.PaymentModeService
}

func NewPaymentModeHandler(paymentModeService service.PaymentModeService) *PaymentModeHandler {
	return &PaymentModeHandler{paymentModeService: paymentModeService}
}

// CreatePaymentMode godoc
// @Summary Create a new payment mode
// @Tags payment-modes
// @Accept json
// @Produce json
// @Param paymentMode body model.PaymentModeCreateRequest true "Payment mode creation request"
// @Success 201 {object} utils.Response
// @Router /payment-modes [post]
func (h *PaymentModeHandler) CreatePaymentMode(c *gin.Context) {
	var req model.PaymentModeCreateRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	paymentMode, err := h.paymentModeService.CreatePaymentMode(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to create payment mode", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, constants.MsgCreated, paymentMode)
}

// GetPaymentMode godoc
// @Summary Get payment mode by ID
// @Tags payment-modes
// @Produce json
// @Param id path int true "Payment Mode ID"
// @Success 200 {object} utils.Response
// @Router /payment-modes/{id} [get]
func (h *PaymentModeHandler) GetPaymentMode(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid payment mode ID")
		return
	}

	paymentMode, err := h.paymentModeService.GetPaymentModeByID(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, constants.MsgNotFound, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgSuccess, paymentMode)
}

// GetAllPaymentModes godoc
// @Summary Get all payment modes
// @Tags payment-modes
// @Produce json
// @Success 200 {object} utils.Response
// @Router /payment-modes [get]
func (h *PaymentModeHandler) GetAllPaymentModes(c *gin.Context) {
	paymentModes, err := h.paymentModeService.GetAllPaymentModes()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch payment modes", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgSuccess, paymentModes)
}

// UpdatePaymentMode godoc
// @Summary Update payment mode
// @Tags payment-modes
// @Accept json
// @Produce json
// @Param id path int true "Payment Mode ID"
// @Param paymentMode body model.PaymentModeUpdateRequest true "Payment mode update request"
// @Success 200 {object} utils.Response
// @Router /payment-modes/{id} [put]
func (h *PaymentModeHandler) UpdatePaymentMode(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid payment mode ID")
		return
	}

	var req model.PaymentModeUpdateRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	paymentMode, err := h.paymentModeService.UpdatePaymentMode(uint(id), &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to update payment mode", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgUpdated, paymentMode)
}

// DeletePaymentMode godoc
// @Summary Delete payment mode
// @Tags payment-modes
// @Param id path int true "Payment Mode ID"
// @Success 200 {object} utils.Response
// @Router /payment-modes/{id} [delete]
func (h *PaymentModeHandler) DeletePaymentMode(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid payment mode ID")
		return
	}

	if err := h.paymentModeService.DeletePaymentMode(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Failed to delete payment mode", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgDeleted, nil)
}
