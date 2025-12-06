package service

import (
	"errors"
	"math"

	"github.com/TextTile/pos-go/internal/model"
	"github.com/TextTile/pos-go/internal/repository"
	"github.com/TextTile/pos-go/internal/utils"
)

type UserService interface {
	Register(req *model.RegisterRequest) (*model.UserResponse, error)
	CreateUser(req *model.UserCreateRequest) (*model.UserResponse, error)
	GetUserByID(id uint) (*model.UserResponse, error)
	GetAllUsers(page, pageSize int) ([]model.UserResponse, *utils.Pagination, error)
	UpdateUser(id uint, req *model.UserUpdateRequest) (*model.UserResponse, error)
	DeleteUser(id uint) error
	Login(req *model.UserLoginRequest) (string, *model.UserResponse, error)
}

type userService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{userRepo: userRepo}
}

func (s *userService) Register(req *model.RegisterRequest) (*model.UserResponse, error) {
	// Validate password confirmation
	if req.Password != req.ConfirmPassword {
		return nil, errors.New("passwords do not match")
	}

	// Check if email already exists
	exists, err := s.userRepo.ExistsByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("email already exists")
	}

	user := &model.User{
		Name:  req.Name,
		Email: req.Email,
	}

	// Hash password
	if err := user.HashPassword(req.Password); err != nil {
		return nil, err
	}

	// Create user
	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	response := user.ToResponse()
	return &response, nil
}

func (s *userService) CreateUser(req *model.UserCreateRequest) (*model.UserResponse, error) {
	// Check if email already exists
	exists, err := s.userRepo.ExistsByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("email already exists")
	}

	user := &model.User{
		Name:  req.Name,
		Email: req.Email,
	}

	// Hash password
	if err := user.HashPassword(req.Password); err != nil {
		return nil, err
	}

	// Create user
	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	response := user.ToResponse()
	return &response, nil
}

func (s *userService) GetUserByID(id uint) (*model.UserResponse, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	response := user.ToResponse()
	return &response, nil
}

func (s *userService) GetAllUsers(page, pageSize int) ([]model.UserResponse, *utils.Pagination, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	users, total, err := s.userRepo.FindAll(page, pageSize)
	if err != nil {
		return nil, nil, err
	}

	var responses []model.UserResponse
	for _, user := range users {
		responses = append(responses, user.ToResponse())
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	pagination := &utils.Pagination{
		Page:       page,
		PageSize:   pageSize,
		TotalItems: total,
		TotalPages: totalPages,
	}

	return responses, pagination, nil
}

func (s *userService) UpdateUser(id uint, req *model.UserUpdateRequest) (*model.UserResponse, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Email != "" {
		// Check if new email already exists (excluding current user)
		existingUser, _ := s.userRepo.FindByEmail(req.Email)
		if existingUser != nil && existingUser.ID != id {
			return nil, errors.New("email already exists")
		}
		user.Email = req.Email
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}

	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	response := user.ToResponse()
	return &response, nil
}

func (s *userService) DeleteUser(id uint) error {
	_, err := s.userRepo.FindByID(id)
	if err != nil {
		return err
	}

	return s.userRepo.Delete(id)
}

func (s *userService) Login(req *model.UserLoginRequest) (string, *model.UserResponse, error) {
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return "", nil, errors.New("invalid email or password")
	}

	if !user.CheckPassword(req.Password) {
		return "", nil, errors.New("invalid email or password")
	}

	if !user.IsActive {
		return "", nil, errors.New("user account is inactive")
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email)
	if err != nil {
		return "", nil, err
	}

	response := user.ToResponse()
	return token, &response, nil
}
