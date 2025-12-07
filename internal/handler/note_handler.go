package handler

import (
	"net/http"
	"strconv"

	"github.com/TextTile/pos-go/internal/model"
	"github.com/TextTile/pos-go/internal/service"
	"github.com/TextTile/pos-go/internal/utils"
	"github.com/gin-gonic/gin"
)

type NoteHandler struct {
	service service.NoteService
}

func NewNoteHandler(service service.NoteService) *NoteHandler {
	return &NoteHandler{service: service}
}

// CreateNote godoc
// @Summary Create a note for an entity
// @Description Create a note for a vendor or bill
// @Tags notes
// @Accept json
// @Produce json
// @Param entityType path string true "Entity Type (VENDOR or BILL)"
// @Param entityId path int true "Entity ID"
// @Param note body model.NoteCreateRequest true "Note creation request"
// @Success 201 {object} utils.SuccessResponse{data=model.NoteResponse}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /{entityType}/{entityId}/notes [post]
func (h *NoteHandler) CreateNote(c *gin.Context) {
	entityType := model.EntityType(c.Param("entityType"))
	entityID, err := strconv.ParseUint(c.Param("entityId"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid entity ID", err)
		return
	}

	userID := c.GetUint("userID")

	var req model.NoteCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	note, err := h.service.CreateNote(entityType, uint(entityID), userID, &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Note created successfully", note.ToResponse())
}

// GetNotesByEntity godoc
// @Summary Get notes for an entity
// @Description Get all notes for a vendor or bill
// @Tags notes
// @Accept json
// @Produce json
// @Param entityType path string true "Entity Type (VENDOR or BILL)"
// @Param entityId path int true "Entity ID"
// @Success 200 {object} utils.SuccessResponse{data=[]model.NoteResponse}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 500 {object} utils.ErrorResponse
// @Router /{entityType}/{entityId}/notes [get]
func (h *NoteHandler) GetNotesByEntity(c *gin.Context) {
	entityType := model.EntityType(c.Param("entityType"))
	entityID, err := strconv.ParseUint(c.Param("entityId"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid entity ID", err)
		return
	}

	notes, err := h.service.GetNotesByEntity(entityType, uint(entityID))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch notes", err)
		return
	}

	responses := make([]model.NoteResponse, len(notes))
	for i, note := range notes {
		responses[i] = note.ToResponse()
	}

	utils.SuccessResponse(c, http.StatusOK, "Notes fetched successfully", responses)
}

// UpdateNote godoc
// @Summary Update a note
// @Description Update a note by its ID
// @Tags notes
// @Accept json
// @Produce json
// @Param entityType path string true "Entity Type (VENDOR or BILL)"
// @Param entityId path int true "Entity ID"
// @Param noteId path int true "Note ID"
// @Param note body model.NoteUpdateRequest true "Note update request"
// @Success 200 {object} utils.SuccessResponse{data=model.NoteResponse}
// @Failure 400 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /{entityType}/{entityId}/notes/{noteId} [put]
func (h *NoteHandler) UpdateNote(c *gin.Context) {
	noteID, err := strconv.ParseUint(c.Param("noteId"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid note ID", err)
		return
	}

	userID := c.GetUint("userID")

	var req model.NoteUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	note, err := h.service.UpdateNote(uint(noteID), userID, &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Note updated successfully", note.ToResponse())
}

// DeleteNote godoc
// @Summary Delete a note
// @Description Delete a note by its ID
// @Tags notes
// @Accept json
// @Produce json
// @Param entityType path string true "Entity Type (VENDOR or BILL)"
// @Param entityId path int true "Entity ID"
// @Param noteId path int true "Note ID"
// @Success 200 {object} utils.SuccessResponse
// @Failure 400 {object} utils.ErrorResponse
// @Failure 404 {object} utils.ErrorResponse
// @Router /{entityType}/{entityId}/notes/{noteId} [delete]
func (h *NoteHandler) DeleteNote(c *gin.Context) {
	noteID, err := strconv.ParseUint(c.Param("noteId"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid note ID", err)
		return
	}

	if err := h.service.DeleteNote(uint(noteID)); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), err)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Note deleted successfully", nil)
}
