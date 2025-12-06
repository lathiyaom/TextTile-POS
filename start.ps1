#!/usr/bin/env pwsh
<#
 =====================================================
   POS-GO Startup Script (Windows / PowerShell)
   Industry Standard – Backend + Frontend Startup
 =====================================================
#>

# ----------- Utility Functions -----------

function Log-Info($msg) { Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Log-OK($msg) { Write-Host "[OK]    $msg" -ForegroundColor Green }
function Log-Warn($msg) { Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Log-Error($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Exit-Fatal($msg) {
    Log-Error $msg
    Read-Host "Press Enter to exit"
    exit 1
}

# ----------- Banner -----------
Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "                POS-GO STARTUP                 " -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# ----------- Create default .env if missing -----------

function Create-DefaultEnv {
    @"
# ===============================
# POS-GO Default Environment File
# ===============================

# Server
SERVER_HOST=localhost
SERVER_PORT=8080
ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pos_db
DB_DRIVER=mysql

# JWT
JWT_SECRET=change-me
JWT_EXPIRY_HOURS=24

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Logging
LOG_LEVEL=debug
"@ | Out-File ".env" -Encoding UTF8
}

# ----------- Step 1: Go Installation -----------

Log-Info "Checking Go installation..."
try {
    go version | Out-Null
    Log-OK "Go installed: $(go version)"
}
catch {
    Exit-Fatal "Go is NOT installed. Install: https://go.dev/dl/"
}
Write-Host ""

# ----------- Step 2: Node Check -----------

if (Test-Path "frontend") {
    Log-Info "Checking Node.js installation..."
    try {
        node -v | Out-Null
        npm -v  | Out-Null
        Log-OK "Node.js & npm detected"
    }
    catch {
        Exit-Fatal "Node.js or npm not installed! Install from https://nodejs.org/"
    }
}
Write-Host ""

# ----------- Step 3: Check .env -----------

Log-Info "Checking .env file..."
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Log-Info "Copying .env.example → .env"
        Copy-Item ".env.example" ".env"
        Log-OK ".env created"
    }
    else {
        Log-Info "Creating default .env..."
        Create-DefaultEnv
        Log-OK "Default .env created"
    }
    Log-Warn "Please update .env with your correct credentials!"
}
else {
    Log-OK ".env found"
}
Write-Host ""

# ----------- Step 4: Go Dependencies -----------

Log-Info "Downloading Go modules..."
go mod download
if ($LASTEXITCODE -ne 0) { Exit-Fatal "go mod download failed" }
Log-OK "Go modules installed"
Write-Host ""

Log-Info "Tidying Go modules..."
go mod tidy
Log-OK "go mod tidy completed"
Write-Host ""

# ----------- Step 5: Frontend Dependencies -----------

if (Test-Path "frontend") {
    Log-Info "Installing frontend dependencies..."
    Push-Location "frontend"
    npm install
    if ($LASTEXITCODE -eq 0) {
        Log-OK "Frontend dependencies installed"
    }
    else {
        Log-Warn "npm install has warnings"
    }
    Pop-Location
}
else {
    Log-Warn "frontend folder not found — skipping"
}
Write-Host ""

# ----------- Step 6: Build Go Backend -----------

Log-Info "Building backend..."
if (-not (Test-Path "bin")) {
    New-Item -ItemType Directory -Path "bin" | Out-Null
}

go build -o "bin/pos-server.exe" "./cmd/main.go"
if ($LASTEXITCODE -eq 0) {
    Log-OK "Backend built successfully: bin/pos-server.exe"
}
else {
    Log-Warn "Build failed — fallback to: go run cmd/main.go"
}
Write-Host ""

# ----------- Start Backend & Frontend Together -----------

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "         STARTING BACKEND & FRONTEND           " -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$runNow = Read-Host "Start backend + frontend now? (Y/N)"
if ($runNow -match '^(Y|y)$') {

    Log-Info "Starting Go backend..."
    Start-Process powershell -ArgumentList "go run cmd/main.go" -WindowStyle Normal
    Log-OK "Backend running at http://localhost:8080"

    if (Test-Path "frontend") {
        Log-Info "Starting React frontend..."
        Push-Location "frontend"
        Start-Process powershell -ArgumentList "npm run dev" -WindowStyle Normal
        Pop-Location
        Log-OK "Frontend running at http://localhost:5173"
    }

    Write-Host ""
    Log-OK "Both servers started in separate windows."
    Write-Host ""
}
else {
    Log-Warn "Startup cancelled. Run manually anytime."
}


powershell -ExecutionPolicy Bypass -File .\start.ps1