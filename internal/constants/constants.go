package constants

// User Roles
const (
	RoleAdmin    = "admin"
	RoleCashier  = "cashier"
	RoleManager  = "manager"
	RoleVendor   = "vendor"
)

// HTTP Status Messages
const (
	MsgSuccess         = "Success"
	MsgCreated         = "Resource created successfully"
	MsgUpdated         = "Resource updated successfully"
	MsgDeleted         = "Resource deleted successfully"
	MsgNotFound        = "Resource not found"
	MsgBadRequest      = "Bad request"
	MsgUnauthorized    = "Unauthorized"
	MsgForbidden       = "Forbidden"
	MsgInternalError   = "Internal server error"
	MsgValidationError = "Validation error"
)

// Context Keys
const (
	ContextKeyUserID   = "userID"
	ContextKeyUserRole = "userRole"
)

// Validation Messages
const (
	ErrEmailRequired    = "Email is required"
	ErrEmailInvalid     = "Email is invalid"
	ErrPasswordRequired = "Password is required"
	ErrPasswordMinLen   = "Password must be at least 6 characters"
	ErrNameRequired     = "Name is required"
)
