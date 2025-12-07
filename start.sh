#!/usr/bin/env bash
#
# POS-GO Docker Development Environment Startup Script (Linux/Mac)
#
# Industry-standard startup script that:
# - Validates Docker installation
# - Checks prerequisites
# - Sets up environment configuration
# - Starts Docker containers in development mode
# - Provides helpful feedback and error handling
#
# Usage:
#   ./start.sh              # Start development environment
#   ./start.sh --clean      # Clean and restart
#   ./start.sh --prod       # Start production environment
#   ./start.sh --build      # Force rebuild
#   ./start.sh --help       # Show help
#
# Author: POS-GO Team
# Version: 2.0.0

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================
SCRIPT_VERSION="2.0.0"
MIN_DOCKER_VERSION="20.10.0"
MIN_COMPOSE_VERSION="2.0.0"

# Parse arguments
CLEAN_MODE=false
PROD_MODE=false
BUILD_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --clean|-c)
            CLEAN_MODE=true
            shift
            ;;
        --prod|-p)
            PROD_MODE=true
            shift
            ;;
        --build|-b)
            BUILD_MODE=true
            shift
            ;;
        --help|-h)
            cat << EOF
POS-GO Docker Startup Script v${SCRIPT_VERSION}

Usage: $0 [OPTIONS]

Options:
    --clean, -c     Clean all containers and volumes before starting
    --prod, -p      Start in production mode
    --build, -b     Force rebuild of Docker images
    --help, -h      Show this help message

Examples:
    $0              Start development environment
    $0 --clean      Clean and restart development environment
    $0 --prod       Start production environment
    $0 --build      Force rebuild images

EOF
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# =============================================================================
# Color Codes
# =============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# =============================================================================
# Utility Functions
# =============================================================================

print_banner() {
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                           ║${NC}"
    echo -e "${CYAN}║              POS-GO DOCKER STARTUP v${SCRIPT_VERSION}              ║${NC}"
    echo -e "${CYAN}║                                                           ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

log_info() {
    echo -e "${CYAN}[INFO]${NC}  $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC}     $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC}     $1"
}

log_error() {
    echo -e "${RED}[✗]${NC}     $1"
}

log_step() {
    echo ""
    echo -e "${CYAN}═══ ${NC}$1${CYAN} ═══${NC}"
    echo ""
}

exit_script() {
    local message=$1
    local exit_code=${2:-1}
    
    echo ""
    if [ $exit_code -eq 0 ]; then
        log_success "$message"
    else
        log_error "$message"
    fi
    echo ""
    read -p "Press Enter to exit..."
    exit $exit_code
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

version_ge() {
    # Compare versions: return 0 if $1 >= $2
    [ "$(printf '%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]
}

# =============================================================================
# Validation Functions
# =============================================================================

check_docker_installation() {
    log_step "Step 1: Validating Docker Installation"
    
    # Check Docker command
    if ! command_exists docker; then
        exit_script "Docker is not installed! Please install Docker from https://docs.docker.com/get-docker/"
    fi
    
    # Get Docker version
    local docker_version
    docker_version=$(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n1)
    log_success "Docker detected: $(docker --version)"
    
    if ! version_ge "$docker_version" "$MIN_DOCKER_VERSION"; then
        log_warning "Docker version $docker_version is older than recommended $MIN_DOCKER_VERSION"
    fi
    
    # Check Docker Compose
    if ! docker compose version >/dev/null 2>&1; then
        exit_script "Docker Compose is not available! Please ensure Docker is properly installed."
    fi
    
    local compose_version
    compose_version=$(docker compose version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n1)
    log_success "Docker Compose detected: $(docker compose version)"
    
    if ! version_ge "$compose_version" "$MIN_COMPOSE_VERSION"; then
        log_warning "Docker Compose version $compose_version is older than recommended $MIN_COMPOSE_VERSION"
    fi
    
    # Check if Docker daemon is running
    if ! docker ps >/dev/null 2>&1; then
        exit_script "Docker daemon is not running! Please start Docker."
    fi
    
    log_success "Docker daemon is running"
}

initialize_environment() {
    log_step "Step 2: Setting Up Environment Configuration"
    
    # Check for .env file
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            log_info "Creating .env from .env.example..."
            cp .env.example .env
            log_success ".env file created"
            log_warning "Please review .env and update sensitive values (DB_PASSWORD, JWT_SECRET, etc.)"
            
            # Prompt user to edit
            read -p "Do you want to edit .env now? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                if command_exists code; then
                    code .env
                elif command_exists nano; then
                    nano .env
                elif command_exists vim; then
                    vim .env
                else
                    log_info "Please edit .env manually"
                fi
                read -p "Press Enter when you're done editing .env..."
            fi
        else
            exit_script ".env.example not found! Cannot setup environment."
        fi
    else
        log_success ".env file exists"
    fi
    
    # Validate critical environment variables
    local critical_vars=("DB_PASSWORD" "JWT_SECRET" "DB_ROOT_PASSWORD")
    local missing_vars=()
    
    for var in "${critical_vars[@]}"; do
        if ! grep -q "^${var}=.\\+" .env 2>/dev/null; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_warning "Missing or empty critical variables: ${missing_vars[*]}"
        log_warning "Please set these in .env before continuing"
    fi
}

kill_ports() {
    log_step "Step 3: Killing Processes on Required Ports"
    
    # Define all ports used in the application
    local ports=(3306 3307 8080 8081 5173 2345 3000)
    
    log_info "Checking and killing processes on ports: ${ports[*]}"
    
    for port in "${ports[@]}"; do
        # Find PIDs using the port
        local pids
        if command_exists lsof; then
            pids=$(lsof -ti :$port 2>/dev/null || true)
        elif command_exists netstat; then
            pids=$(netstat -ano 2>/dev/null | grep ":$port " | awk '{print $NF}' | sort -u || true)
        else
            log_warning "Neither lsof nor netstat found. Cannot check port $port"
            continue
        fi
        
        if [ -n "$pids" ]; then
            log_info "Killing process(es) on port $port (PIDs: $pids)"
            for pid in $pids; do
                if kill -9 "$pid" 2>/dev/null; then
                    log_success "Killed process $pid on port $port"
                else
                    log_warning "Could not kill process $pid (may require sudo)"
                fi
            done
        else
            log_success "Port $port is free"
        fi
    done
    
    echo ""
    log_success "Port cleanup complete"
}

check_prerequisites() {
    log_step "Step 4: Checking Prerequisites"
    
    # Check if ports are available (after killing)
    local ports=(
        "3000:Frontend"
        "8080:Backend"
        "3307:Database"
    )
    
    for port_info in "${ports[@]}"; do
        IFS=':' read -r port service <<< "$port_info"
        
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -an 2>/dev/null | grep -q ":$port.*LISTEN"; then
            log_warning "Port $port ($service) is still in use"
            log_info "You may need to manually stop the conflicting service"
        else
            log_success "Port $port ($service) is available"
        fi
    done
    
    # Check disk space
    local free_space
    if command_exists df; then
        free_space=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
        if [ "$free_space" -lt 5 ]; then
            log_warning "Low disk space: ${free_space}GB free. Docker needs at least 5GB."
        else
            log_success "Sufficient disk space: ${free_space}GB free"
        fi
    fi
}

start_docker_environment() {
    local mode="Development"
    [ "$PROD_MODE" = true ] && mode="Production"
    
    log_step "Step 5: Starting Docker Environment ($mode Mode)"
    
    # Determine compose command
    local compose_cmd="docker compose"
    if [ "$PROD_MODE" = false ]; then
        compose_cmd="docker compose -f docker-compose.yml -f docker-compose.dev.yml"
    fi
    
    # Clean if requested
    if [ "$CLEAN_MODE" = true ]; then
        log_info "Cleaning existing containers and volumes..."
        $compose_cmd down -v --remove-orphans >/dev/null 2>&1 || true
        log_success "Cleanup complete"
    fi
    
    # Build if requested
    if [ "$BUILD_MODE" = true ]; then
        log_info "Building Docker images (this may take a few minutes)..."
        echo ""
        echo -e "${BLUE}Running: $compose_cmd build --no-cache${NC}"
        echo ""
        
        if ! $compose_cmd build --no-cache; then
            exit_script "Docker build failed!"
        fi
        log_success "Docker images built successfully"
    fi
    
    # Start containers
    log_info "Starting Docker containers..."
    echo ""
    echo -e "${BLUE}Running: $compose_cmd up -d${NC}"
    echo ""
    
    if ! $compose_cmd up -d; then
        exit_script "Failed to start Docker containers!"
    fi
    
    log_success "Docker containers started successfully"
}

wait_for_services() {
    log_step "Step 6: Waiting for Services to be Ready"
    
    local max_attempts=30
    local attempt=0
    
    # Wait for backend health check
    log_info "Waiting for backend to be healthy..."
    while [ $attempt -lt $max_attempts ]; do
        if curl -sf http://localhost:8080/health >/dev/null 2>&1; then
            log_success "Backend is healthy"
            break
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        log_warning "Backend health check timed out. Check logs with: docker compose logs backend"
    fi
    
    echo ""
}

show_summary() {
    log_step "🎉 Startup Complete!"
    
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    ACCESS INFORMATION                     ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    if [ "$PROD_MODE" = true ]; then
        echo -e "  Frontend:  ${CYAN}http://localhost:3000${NC}"
        echo -e "  Backend:   ${CYAN}http://localhost:8080${NC}"
        echo -e "  API Docs:  ${CYAN}http://localhost:8080/api/v1${NC}"
    else
        echo -e "  Frontend:  ${CYAN}http://localhost:5173${NC} ${YELLOW}(Hot Reload)${NC}"
        echo -e "  Backend:   ${CYAN}http://localhost:8080${NC} ${YELLOW}(Hot Reload)${NC}"
        echo -e "  Adminer:   ${CYAN}http://localhost:8081${NC} ${YELLOW}(Database Tool)${NC}"
        echo -e "  Debugger:  ${CYAN}localhost:2345${NC} ${YELLOW}(Delve)${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                    USEFUL COMMANDS                        ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  View logs:        ${YELLOW}docker compose logs -f${NC}"
    echo -e "  Stop services:    ${YELLOW}docker compose down${NC}"
    echo -e "  Restart services: ${YELLOW}docker compose restart${NC}"
    echo -e "  Clean restart:    ${YELLOW}./start.sh --clean${NC}"
    echo ""
    echo -e "  Or use Makefile:  ${YELLOW}make dev${NC} or ${YELLOW}make up${NC}"
    echo ""
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
    # Change to script directory
    cd "$(dirname "$0")" || exit 1
    
    # Show banner
    print_banner
    
    # Validate Docker installation
    check_docker_installation
    
    # Initialize environment
    initialize_environment
    
    # Kill processes on required ports
    kill_ports
    
    # Check prerequisites
    check_prerequisites
    
    # Start Docker environment
    start_docker_environment
    
    # Wait for services
    wait_for_services
    
    # Show summary
    show_summary
    
    # Success
    echo ""
    log_success "All services are running!"
    echo ""
}

# Run main function
main
