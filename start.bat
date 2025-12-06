@echo off
REM ============================================
REM POS-GO Startup Script for Windows
REM ============================================

echo.
echo ========================================
echo   POS-GO System Startup
echo ========================================
echo.

REM Check if Go is installed
echo [1/6] Checking Go installation...
where go >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Go is not installed or not in PATH!
    echo.
    echo Please install Go from: https://go.dev/dl/
    echo After installation, restart your terminal and run this script again.
    echo.
    pause
    exit /b 1
)

REM Display Go version
for /f "tokens=*" %%i in ('go version') do set GO_VERSION=%%i
echo [OK] %GO_VERSION%
echo.

REM Check if .env file exists
echo [2/6] Checking environment configuration...
if not exist ".env" (
    echo [WARNING] .env file not found!
    if exist ".env.example" (
        echo [INFO] Copying .env.example to .env...
        copy .env.example .env >nul
        echo [OK] .env file created from .env.example
        echo [ACTION REQUIRED] Please edit .env file with your database credentials
        echo.
    ) else (
        echo [ERROR] No .env or .env.example file found!
        echo [INFO] Creating a default .env file...
        call :create_default_env
        echo [OK] Default .env file created
        echo [ACTION REQUIRED] Please edit .env file with your actual credentials
        echo.
    )
) else (
    echo [OK] .env file found
    echo.
)

REM Download Go dependencies
echo [3/6] Downloading Go dependencies...
go mod download
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to download dependencies!
    pause
    exit /b 1
)
echo [OK] Dependencies downloaded successfully
echo.

REM Tidy up go.mod and go.sum
echo [4/6] Tidying Go modules...
go mod tidy
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] go mod tidy encountered issues
) else (
    echo [OK] Go modules tidied
)
echo.

REM Check if PostgreSQL is accessible (optional check)
echo [5/6] Checking PostgreSQL connection...
echo [INFO] Attempting to verify database connection...
REM This is optional - the app will check on startup
echo [SKIP] Database check will be performed on application startup
echo.

REM Build the application (optional, can be skipped for development)
echo [6/6] Building application...
go build -o bin/pos-server.exe ./cmd/server
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Build failed, but you can still run with 'go run'
) else (
    echo [OK] Application built successfully: bin/pos-server.exe
)
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Ensure PostgreSQL is running
echo   2. Update .env file with your database credentials
echo   3. Run the server:
echo      - Option A: go run cmd/server/main.go
echo      - Option B: .\bin\pos-server.exe
echo.
echo Press any key to start the server now, or Ctrl+C to exit...
pause >nul

echo.
echo ========================================
echo   Starting POS Server...
echo ========================================
echo.

REM Run the server
go run cmd/server/main.go

goto :eof

:create_default_env
(
echo # Server Configuration
echo SERVER_PORT=8080
echo SERVER_HOST=localhost
echo ENV=development
echo.
echo # Database Configuration
echo DB_HOST=localhost
echo DB_PORT=5432
echo DB_USER=postgres
echo DB_PASSWORD=your_password_here
echo DB_NAME=pos_db
echo DB_SSLMODE=disable
echo.
echo # JWT Configuration
echo JWT_SECRET=your-secret-key-change-this-in-production
echo JWT_EXPIRY_HOURS=24
echo.
echo # CORS Configuration
echo ALLOWED_ORIGINS=http://localhost:5173
echo.
echo # Logging
echo LOG_LEVEL=debug
) > .env
goto :eof
