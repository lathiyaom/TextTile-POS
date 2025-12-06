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

type UserHandler struct {
	userService service.UserService
}

func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// Register godoc
// @Summary Register a new user
// @Tags auth
// @Accept json
// @Produce json
// @Param user body model.RegisterRequest true "User registration request"
// @Success 201 {object} utils.Response
// @Router /auth/register [post]
func (h *UserHandler) Register(c *gin.Context) {
	var req model.RegisterRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	user, err := h.userService.Register(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to register user", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Registration successful", user)
}

// CreateUser godoc
// @Summary Create a new user
// @Tags users
// @Accept json
// @Produce json
// @Param user body model.UserCreateRequest true "User creation request"
// @Success 201 {object} utils.Response
// @Router /users [post]
func (h *UserHandler) CreateUser(c *gin.Context) {
	var req model.UserCreateRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	user, err := h.userService.CreateUser(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to create user", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, constants.MsgCreated, user)
}

// GetUser godoc
// @Summary Get user by ID
// @Tags users
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} utils.Response
// @Router /users/{id} [get]
func (h *UserHandler) GetUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid user ID")
		return
	}

	user, err := h.userService.GetUserByID(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, constants.MsgNotFound, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgSuccess, user)
}

// GetAllUsers godoc
// @Summary Get all users with pagination
// @Tags users
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(10)
// @Success 200 {object} utils.PaginatedResponse
// @Router /users [get]
func (h *UserHandler) GetAllUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	users, pagination, err := h.userService.GetAllUsers(page, pageSize)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch users", err.Error())
		return
	}

	utils.PaginatedSuccessResponse(c, http.StatusOK, constants.MsgSuccess, users, *pagination)
}

// UpdateUser godoc
// @Summary Update user
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param user body model.UserUpdateRequest true "User update request"
// @Success 200 {object} utils.Response
// @Router /users/{id} [put]
func (h *UserHandler) UpdateUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid user ID")
		return
	}

	var req model.UserUpdateRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	user, err := h.userService.UpdateUser(uint(id), &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to update user", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgUpdated, user)
}

// DeleteUser godoc
// @Summary Delete user
// @Tags users
// @Param id path int true "User ID"
// @Success 200 {object} utils.Response
// @Router /users/{id} [delete]
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, constants.MsgBadRequest, "Invalid user ID")
		return
	}

	if err := h.userService.DeleteUser(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Failed to delete user", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgDeleted, nil)
}

// Login godoc
// @Summary User login
// @Tags auth
// @Accept json
// @Produce json
// @Param credentials body model.UserLoginRequest true "Login credentials"
// @Success 200 {object} utils.Response
// @Router /auth/login [post]
func (h *UserHandler) Login(c *gin.Context) {
	var req model.UserLoginRequest
	if !utils.BindAndValidate(c, &req) {
		return
	}

	token, user, err := h.userService.Login(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusUnauthorized, "Login failed", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Login successful", gin.H{
		"token": token,
		"user":  user,
	})
}

// GetProfile godoc
// @Summary Get current user profile
// @Tags auth
// @Produce json
// @Success 200 {object} utils.Response
// @Router /auth/profile [get]
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get(constants.ContextKeyUserID)
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, constants.MsgUnauthorized, "User not authenticated")
		return
	}

	user, err := h.userService.GetUserByID(userID.(uint))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, constants.MsgNotFound, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, constants.MsgSuccess, user)
}
