#!/usr/bin/env pwsh
<#
.SYNOPSIS
    POS-GO Docker Development Environment Startup Script (Windows/PowerShell)

.DESCRIPTION
    Industry-standard startup script that:
    - Validates Docker installation
    - Checks prerequisites
    - Sets up environment configuration
    - Starts Docker containers in development mode
    - Provides helpful feedback and error handling

.PARAMETER Clean
    Clean all containers and volumes before starting

.PARAMETER Prod
    Start in production mode instead of development

.PARAMETER Build
    Force rebuild of Docker images

.EXAMPLE
    .\start.ps1
    Start development environment

.EXAMPLE
    .\start.ps1 -Clean
    Clean and restart development environment

.EXAMPLE
    .\start.ps1 -Prod
    Start production environment

.NOTES
    Author: POS-GO Team
    Version: 2.0.0
#>

[CmdletBinding()]
param(
    [Parameter(HelpMessage="Clean all containers and volumes before starting")]
    [switch]$Clean,
    
    [Parameter(HelpMessage="Start in production mode")]
    [switch]$Prod,
    
    [Parameter(HelpMessage="Force rebuild of Docker images")]
    [switch]$Build
)

# =============================================================================
# Configuration
# =============================================================================
$ErrorActionPreference = "Stop"
$SCRIPT_VERSION = "2.0.0"
$MIN_DOCKER_VERSION = "20.10.0"
$MIN_COMPOSE_VERSION = "2.0.0"

# =============================================================================
# Utility Functions
# =============================================================================

function Write-Banner {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                           ║" -ForegroundColor Cyan
    Write-Host "║              POS-GO DOCKER STARTUP v$SCRIPT_VERSION              ║" -ForegroundColor Cyan
    Write-Host "║                                                           ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Log-Info {
    param([string]$Message)
    Write-Host "[INFO]  " -ForegroundColor Cyan -NoNewline
    Write-Host $Message
}

function Log-Success {
    param([string]$Message)
    Write-Host "[✓]     " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Log-Warning {
    param([string]$Message)
    Write-Host "[⚠]     " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
}

function Log-Error {
    param([string]$Message)
    Write-Host "[✗]     " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

function Log-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "═══ " -ForegroundColor Cyan -NoNewline
    Write-Host $Message -ForegroundColor White -NoNewline
    Write-Host " ═══" -ForegroundColor Cyan
    Write-Host ""
}

function Exit-Script {
    param(
        [string]$Message,
        [int]$ExitCode = 1
    )
    
    Write-Host ""
    if ($ExitCode -eq 0) {
        Log-Success $Message
    } else {
        Log-Error $Message
    }
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit $ExitCode
}

function Test-CommandExists {
    param([string]$Command)
    
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Compare-Version {
    param(
        [string]$Version1,
        [string]$Version2
    )
    
    $v1 = [version]($Version1 -replace '[^\d.]', '')
    $v2 = [version]($Version2 -replace '[^\d.]', '')
    
    return $v1 -ge $v2
}

# =============================================================================
# Validation Functions
# =============================================================================

function Test-DockerInstallation {
    Log-Step "Step 1: Validating Docker Installation"
    
    # Check Docker command
    if (-not (Test-CommandExists "docker")) {
        Exit-Script "Docker is not installed or not in PATH! Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    }
    
    # Get Docker version
    try {
        $dockerVersion = docker --version 2>&1
        Log-Success "Docker detected: $dockerVersion"
        
        # Extract version number
        if ($dockerVersion -match '(\d+\.\d+\.\d+)') {
            $version = $matches[1]
            if (-not (Compare-Version $version $MIN_DOCKER_VERSION)) {
                Log-Warning "Docker version $version is older than recommended $MIN_DOCKER_VERSION"
            }
        }
    } catch {
        Exit-Script "Failed to get Docker version: $_"
    }
    
    # Check Docker Compose
    try {
        $composeVersion = docker compose version 2>&1
        Log-Success "Docker Compose detected: $composeVersion"
        
        if ($composeVersion -match '(\d+\.\d+\.\d+)') {
            $version = $matches[1]
            if (-not (Compare-Version $version $MIN_COMPOSE_VERSION)) {
                Log-Warning "Docker Compose version $version is older than recommended $MIN_COMPOSE_VERSION"
            }
        }
    } catch {
        Exit-Script "Docker Compose is not available! Please ensure Docker Desktop is properly installed."
    }
    
    # Check if Docker daemon is running
    try {
        docker ps | Out-Null
        Log-Success "Docker daemon is running"
    } catch {
        Exit-Script "Docker daemon is not running! Please start Docker Desktop."
    }
}

function Initialize-Environment {
    Log-Step "Step 2: Setting Up Environment Configuration"
    
    # Check for .env file
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Log-Info "Creating .env from .env.example..."
            Copy-Item ".env.example" ".env"
            Log-Success ".env file created"
            Log-Warning "Please review .env and update sensitive values (DB_PASSWORD, JWT_SECRET, etc.)"
            
            # Prompt user to edit
            $response = Read-Host "Do you want to edit .env now? (y/N)"
            if ($response -eq "y" -or $response -eq "Y") {
                if (Test-CommandExists "code") {
                    code .env
                } elseif (Test-CommandExists "notepad") {
                    notepad .env
                } else {
                    Log-Info "Please edit .env manually"
                }
                Read-Host "Press Enter when you're done editing .env"
            }
        } else {
            Exit-Script ".env.example not found! Cannot setup environment."
        }
    } else {
        Log-Success ".env file exists"
    }
    
    # Validate critical environment variables
    $envContent = Get-Content ".env" -Raw
    $criticalVars = @("DB_PASSWORD", "JWT_SECRET", "DB_ROOT_PASSWORD")
    $missingVars = @()
    
    foreach ($var in $criticalVars) {
        if ($envContent -notmatch "$var=.+") {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Log-Warning "Missing or empty critical variables: $($missingVars -join ', ')"
        Log-Warning "Please set these in .env before continuing"
    }
}

function Test-Prerequisites {
    Log-Step "Step 3: Checking Prerequisites"
    
    # Check if ports are available
    $ports = @(
        @{Port=3000; Service="Frontend"},
        @{Port=8080; Service="Backend"},
        @{Port=3307; Service="Database"}
    )
    
    foreach ($portInfo in $ports) {
        $port = $portInfo.Port
        $service = $portInfo.Service
        
        $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connection) {
            Log-Warning "Port $port ($service) is already in use by process $($connection.OwningProcess)"
            Log-Info "You may need to change the port in .env or stop the conflicting service"
        } else {
            Log-Success "Port $port ($service) is available"
        }
    }
    
    # Check disk space
    $drive = (Get-Location).Drive.Name
    $freeSpace = (Get-PSDrive $drive).Free / 1GB
    if ($freeSpace -lt 5) {
        Log-Warning "Low disk space: $([math]::Round($freeSpace, 2)) GB free. Docker needs at least 5GB."
    } else {
        Log-Success "Sufficient disk space: $([math]::Round($freeSpace, 2)) GB free"
    }
}

function Start-DockerEnvironment {
    param([bool]$IsProduction)
    
    $mode = if ($IsProduction) { "Production" } else { "Development" }
    Log-Step "Step 4: Starting Docker Environment ($mode Mode)"
    
    # Determine compose files
    $composeCmd = "docker compose"
    if (-not $IsProduction) {
        $composeCmd += " -f docker-compose.yml -f docker-compose.dev.yml"
    }
    
    # Clean if requested
    if ($Clean) {
        Log-Info "Cleaning existing containers and volumes..."
        Invoke-Expression "$composeCmd down -v --remove-orphans" | Out-Null
        Log-Success "Cleanup complete"
    }
    
    # Build if requested or if images don't exist
    if ($Build) {
        Log-Info "Building Docker images (this may take a few minutes)..."
        $buildCmd = "$composeCmd build --no-cache"
        Write-Host ""
        Write-Host "Running: $buildCmd" -ForegroundColor Gray
        Write-Host ""
        
        Invoke-Expression $buildCmd
        
        if ($LASTEXITCODE -ne 0) {
            Exit-Script "Docker build failed!"
        }
        Log-Success "Docker images built successfully"
    }
    
    # Start containers
    Log-Info "Starting Docker containers..."
    Write-Host ""
    Write-Host "Running: $composeCmd up -d" -ForegroundColor Gray
    Write-Host ""
    
    Invoke-Expression "$composeCmd up -d"
    
    if ($LASTEXITCODE -ne 0) {
        Exit-Script "Failed to start Docker containers!"
    }
    
    Log-Success "Docker containers started successfully"
}

function Wait-ForServices {
    Log-Step "Step 5: Waiting for Services to be Ready"
    
    $maxAttempts = 30
    $attempt = 0
    
    # Wait for backend health check
    Log-Info "Waiting for backend to be healthy..."
    while ($attempt -lt $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Log-Success "Backend is healthy"
                break
            }
        } catch {
            # Service not ready yet
        }
        
        $attempt++
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
    
    if ($attempt -eq $maxAttempts) {
        Log-Warning "Backend health check timed out. Check logs with: docker compose logs backend"
    }
    
    Write-Host ""
}

function Show-Summary {
    param([bool]$IsProduction)
    
    Log-Step "🎉 Startup Complete!"
    
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                    ACCESS INFORMATION                     ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    if ($IsProduction) {
        Write-Host "  Frontend:  " -NoNewline
        Write-Host "http://localhost:3000" -ForegroundColor Cyan
        Write-Host "  Backend:   " -NoNewline
        Write-Host "http://localhost:8080" -ForegroundColor Cyan
        Write-Host "  API Docs:  " -NoNewline
        Write-Host "http://localhost:8080/api/v1" -ForegroundColor Cyan
    } else {
        Write-Host "  Frontend:  " -NoNewline
        Write-Host "http://localhost:5173" -ForegroundColor Cyan -NoNewline
        Write-Host " (Hot Reload)" -ForegroundColor Yellow
        
        Write-Host "  Backend:   " -NoNewline
        Write-Host "http://localhost:8080" -ForegroundColor Cyan -NoNewline
        Write-Host " (Hot Reload)" -ForegroundColor Yellow
        
        Write-Host "  Adminer:   " -NoNewline
        Write-Host "http://localhost:8081" -ForegroundColor Cyan -NoNewline
        Write-Host " (Database Tool)" -ForegroundColor Yellow
        
        Write-Host "  Debugger:  " -NoNewline
        Write-Host "localhost:2345" -ForegroundColor Cyan -NoNewline
        Write-Host " (Delve)" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║                    USEFUL COMMANDS                        ║" -ForegroundColor Blue
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Blue
    Write-Host ""
    Write-Host "  View logs:        " -NoNewline
    Write-Host "docker compose logs -f" -ForegroundColor Yellow
    Write-Host "  Stop services:    " -NoNewline
    Write-Host "docker compose down" -ForegroundColor Yellow
    Write-Host "  Restart services: " -NoNewline
    Write-Host "docker compose restart" -ForegroundColor Yellow
    Write-Host "  Clean restart:    " -NoNewline
    Write-Host ".\start.ps1 -Clean" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Or use Makefile:  " -NoNewline
    Write-Host "make dev" -ForegroundColor Yellow -NoNewline
    Write-Host " or " -NoNewline
    Write-Host "make up" -ForegroundColor Yellow
    Write-Host ""
}

# =============================================================================
# Main Execution
# =============================================================================

try {
    # Change to script directory
    $scriptPath = Split-Path -Parent $PSCommandPath
    if ($scriptPath) {
        Set-Location $scriptPath
    }
    
    # Show banner
    Write-Banner
    
    # Validate Docker installation
    Test-DockerInstallation
    
    # Initialize environment
    Initialize-Environment
    
    # Check prerequisites
    Test-Prerequisites
    
    # Start Docker environment
    Start-DockerEnvironment -IsProduction:$Prod
    
    # Wait for services
    Wait-ForServices
    
    # Show summary
    Show-Summary -IsProduction:$Prod
    
    # Success
    Write-Host ""
    Log-Success "All services are running!"
    Write-Host ""
    
} catch {
    Exit-Script "An unexpected error occurred: $_"
}
