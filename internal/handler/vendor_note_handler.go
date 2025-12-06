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

type VendorNoteHandler struct {
	noteService service.VendorNoteService
}

func NewVendorNoteHandler(noteService service.VendorNoteService) *VendorNoteHandler {
	return &VendorNoteHandler{noteService: noteService}
}

func (h *VendorNoteHandler) CreateNote(c *gin.Context) {
	vendorID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid vendor ID")
		return
	}

	var req model.VendorNoteCreateRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	note, err := h.noteService.CreateNote(uint(vendorID), &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to create note", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, constants.MsgCreated, note)
}

func (h *VendorNoteHandler) GetNotes(c *gin.Context) {
	vendorID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid vendor ID")
		return
	}

	notes, err := h.noteService.GetNotesByVendorID(uint(vendorID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch notes", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgSuccess, notes)
}

func (h *VendorNoteHandler) UpdateNote(c *gin.Context) {
	vendorID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid vendor ID")
		return
	}

	noteID, err := strconv.ParseUint(c.Param("noteId"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid note ID")
		return
	}

	var req model.VendorNoteCreateRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	note, err := h.noteService.UpdateNote(uint(vendorID), uint(noteID), &req)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "note does not belong to this vendor" {
			statusCode = http.StatusForbidden
		} else if err.Error() == "note not found" {
			statusCode = http.StatusNotFound
		}

		utils.ErrorResponse(c, statusCode, "Failed to update note", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgSuccess, note)
}

func (h *VendorNoteHandler) DeleteNote(c *gin.Context) {
	noteID, err := strconv.ParseUint(c.Param("noteId"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid note ID")
		return
	}

	if err := h.noteService.DeleteNote(uint(noteID)); err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Failed to delete note", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgDeleted, nil)
}
