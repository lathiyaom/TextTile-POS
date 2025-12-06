#!/usr/bin/env pwsh
<#
 =====================================================
   POS-GO Docker Startup Script (Windows / PowerShell)
   Dockerized Development Environment
 =====================================================
#>

# ----------- Utility Functions -----------

function Log-Info {
    param($msg)
    Write-Host "[INFO]  $msg" -ForegroundColor Cyan
}

function Log-OK {
    param($msg)
    Write-Host "[OK]    $msg" -ForegroundColor Green
}

function Log-Warn {
    param($msg)
    Write-Host "[WARN]  $msg" -ForegroundColor Yellow
}

function Log-Error {
    param($msg)
    Write-Host "[ERROR] $msg" -ForegroundColor Red
}

function Exit-Fatal {
    param($msg)
    Log-Error $msg
    Read-Host "Press Enter to exit"
    exit 1
}

# ----------- Banner -----------

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "         POS-GO DOCKER STARTUP                 " -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# ----------- Step 1: Check Docker Installation -----------

Log-Info "Checking Docker Installation..."
try {
    docker --version | Out-Null
    Log-OK "Docker detected: $(docker --version)"
}
catch {
    Exit-Fatal "Docker is NOT installed or not in PATH! Please install Docker Desktop."
}

try {
    docker compose version | Out-Null
    Log-OK "Docker Compose detected: $(docker compose version)"
}
catch {
    Exit-Fatal "Docker Compose is NOT installed or not in PATH!"
}
Write-Host ""

# ----------- Step 2: Check .env -----------

Log-Info "Checking .env file..."
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Log-Info "Copying .env.example -> .env"
        Copy-Item ".env.example" ".env"
        Log-OK ".env created"
        Log-Warn "Please check .env and update DB_PASSWORD or other secrets if needed."
    }
    else {
        Exit-Fatal ".env.example not found! Cannot setup environment."
    }
}
else {
    Log-OK ".env found"
}
Write-Host ""

# ----------- Step 3: Frontend Dependencies (Local) -----------

Log-Info "Installing Frontend Dependencies (Local)..."
if (Test-Path "frontend") {
    Push-Location "frontend"
    try {
        npm --version | Out-Null
        Log-Info "Running npm install..."
        npm install

        if ($LASTEXITCODE -eq 0) {
            Log-OK "Frontend dependencies installed successfully."
        }
        else {
            Log-Warn "npm install finished with warnings."
        }
    }
    catch {
        Log-Warn "npm not found or errored. Skipping local npm install."
    }
    Pop-Location
}
else {
    Log-Warn "Frontend directory not found!"
}
Write-Host ""

# ----------- Step 4: Docker Compose Up -----------

Log-Info "Starting Docker Containers (Development Mode)..."
Log-Info "Building and starting containers... This may take a while first time."

$composeFiles = "-f docker-compose.yml -f docker-compose.dev.yml"

Write-Host "> docker compose $composeFiles up --build" -ForegroundColor Gray

cmd /c "docker compose $composeFiles up --build"

if ($LASTEXITCODE -ne 0) {
    Log-Error "Docker Compose failed to start."
    Read-Host "Press Enter to exit"
}
