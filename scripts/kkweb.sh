#!/bin/bash

# KKWeb Development Manager
# Comprehensive script to manage Next.js 14 Court × Street × Pixel website
# Handles installation, configuration, startup, monitoring, and shutdown

set -e

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m' # No Color

# Configuration
readonly PROJECT_NAME="KKWeb"
readonly PID_FILE=".kkweb.pid"
readonly LOG_FILE=".kkweb.log"
readonly ENV_FILE=".env.local"
readonly HEALTH_URL="http://localhost:3000/api/health"
readonly DEFAULT_PORT=3000
readonly FALLBACK_PORT=3001

# Global variables
NEXT_PID=""
MONITOR_PID=""
CURRENT_PORT=$DEFAULT_PORT

# Utility functions
print_header() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║  $PROJECT_NAME Development Manager - Court × Street × Pixel Architecture     ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_status() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')] INFO:${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] SUCCESS:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARNING:${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ERROR:${NC} $1" >&2
}

print_section() {
    echo -e "${PURPLE}▶ $1${NC}"
}

# Check if port is in use
is_port_in_use() {
    local port=$1
    if command -v lsof >/dev/null 2>&1; then
        lsof -ti:$port >/dev/null 2>&1
    else
        nc -z localhost $port >/dev/null 2>&1
    fi
}

# Find available port
find_available_port() {
    if ! is_port_in_use $DEFAULT_PORT; then
        CURRENT_PORT=$DEFAULT_PORT
        return
    fi
    
    if ! is_port_in_use $FALLBACK_PORT; then
        CURRENT_PORT=$FALLBACK_PORT
        print_warning "Port $DEFAULT_PORT in use, using $FALLBACK_PORT"
        return
    fi
    
    # Find any available port starting from 3002
    for port in $(seq 3002 3010); do
        if ! is_port_in_use $port; then
            CURRENT_PORT=$port
            print_warning "Using port $port"
            return
        fi
    done
    
    print_error "No available ports found"
    exit 1
}

# Check system requirements
check_system() {
    print_section "System Requirements Check"
    
    # Check Node.js
    if ! command -v node >/dev/null 2>&1; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    local node_version=$(node -v | sed 's/v//')
    local major_version=$(echo $node_version | cut -d. -f1)
    
    if [ "$major_version" -lt 18 ]; then
        print_error "Node.js version $node_version found. Please upgrade to Node.js 18+."
        exit 1
    fi
    
    print_success "Node.js $node_version ✓"
    
    # Check package manager
    if command -v pnpm >/dev/null 2>&1; then
        PACKAGE_MANAGER="pnpm"
    elif command -v npm >/dev/null 2>&1; then
        PACKAGE_MANAGER="npm"
    else
        print_error "No package manager found. Please install npm or pnpm."
        exit 1
    fi
    
    print_success "Package manager: $PACKAGE_MANAGER ✓"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    print_success "Project directory ✓"
}

# Install dependencies
install_dependencies() {
    print_section "Dependencies Installation"
    
    # Check if node_modules exists and is up to date
    if [ -d "node_modules" ]; then
        # Check if package.json is newer than lock file or if lock file conflicts
        local needs_reinstall=false
        
        if [ -f "package-lock.json" ] && [ "package.json" -nt "package-lock.json" ]; then
            needs_reinstall=true
            print_status "package.json is newer than package-lock.json"
        elif [ -f "pnpm-lock.yaml" ] && [ "package.json" -nt "pnpm-lock.yaml" ]; then
            needs_reinstall=true
            print_status "package.json is newer than pnpm-lock.yaml"
        fi
        
        # Test if npm ci would work (check for sync issues)
        if [ "$PACKAGE_MANAGER" = "npm" ] && [ -f "package-lock.json" ]; then
            if ! npm ci --dry-run >/dev/null 2>&1; then
                needs_reinstall=true
                print_status "Lock file is out of sync with package.json"
            fi
        fi
        
        if [ "$needs_reinstall" = false ]; then
            print_success "Dependencies already installed and up to date ✓"
            return
        fi
        
        print_status "Dependencies out of date, reinstalling..."
        rm -rf node_modules
        
        # Remove lock file if using npm to force regeneration
        if [ "$PACKAGE_MANAGER" = "npm" ] && [ -f "package-lock.json" ]; then
            print_status "Regenerating package-lock.json..."
            rm -f package-lock.json
        fi
    fi
    
    print_status "Installing dependencies with $PACKAGE_MANAGER..."
    
    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        # For pnpm, try frozen lockfile first, fallback to regular install
        if [ -f "pnpm-lock.yaml" ]; then
            if ! pnpm install --frozen-lockfile 2>/dev/null; then
                print_status "Frozen lockfile failed, updating dependencies..."
                pnpm install
            fi
        else
            pnpm install
        fi
    else
        # For npm, use regular install to handle any conflicts
        npm install
    fi
    
    print_success "Dependencies installed ✓"
}

# Setup environment variables
setup_environment() {
    print_section "Environment Configuration"
    
    if [ -f "$ENV_FILE" ]; then
        print_success "Environment file exists ✓"
        
        # Check for required variables
        local missing_vars=()
        
        if ! grep -q "^ADMIN_USERNAME=" "$ENV_FILE"; then
            missing_vars+=("ADMIN_USERNAME")
        fi
        
        if ! grep -q "^ADMIN_PASSWORD=" "$ENV_FILE"; then
            missing_vars+=("ADMIN_PASSWORD")
        fi
        
        if [ ${#missing_vars[@]} -gt 0 ]; then
            print_warning "Missing required environment variables: ${missing_vars[*]}"
            print_status "Adding default values..."
            
            for var in "${missing_vars[@]}"; do
                case $var in
                    "ADMIN_USERNAME")
                        echo "ADMIN_USERNAME=admin" >> "$ENV_FILE"
                        ;;
                    "ADMIN_PASSWORD")
                        echo "ADMIN_PASSWORD=kkweb2024" >> "$ENV_FILE"
                        ;;
                esac
            done
            
            print_success "Environment variables updated ✓"
        fi
        
        return
    fi
    
    print_status "Creating environment file..."
    
    cat > "$ENV_FILE" << EOF
# KKWeb Development Environment
# Auto-generated by kkweb.sh on $(date)

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:$CURRENT_PORT

# Admin Authentication (Required)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=kkweb2024

# Content Storage (FILE for dev, MEMORY for prod)
CONTENT_STORAGE=FILE

# Security & Rate Limiting
RATE_LIMIT=10
REVALIDATE_TOKEN=kkweb-dev-token-$(date +%s)

# Observability (Development)
METRICS_ENABLED=true
METRICS_BASIC=1

# Development Features
DEBUG_MODE=true
NODE_ENV=development

# Build Information
BUILD_ID=development-$(date +%s)
EOF
    
    print_success "Environment file created ✓"
    print_warning "Default admin credentials: admin / kkweb2024"
}

# Run health checks
run_health_checks() {
    print_section "Pre-flight Health Checks"
    
    # TypeScript check
    print_status "Running TypeScript check..."
    if $PACKAGE_MANAGER run typecheck > /dev/null 2>&1; then
        print_success "TypeScript check ✓"
    else
        print_error "TypeScript check failed"
        $PACKAGE_MANAGER run typecheck
        exit 1
    fi
    
    # ESLint check
    print_status "Running ESLint..."
    if $PACKAGE_MANAGER run lint > /dev/null 2>&1; then
        print_success "ESLint check ✓"
    else
        print_warning "ESLint issues found, continuing anyway..."
    fi
    
    # Build check
    print_status "Testing production build..."
    if $PACKAGE_MANAGER run build > /dev/null 2>&1; then
        print_success "Build test ✓"
    else
        print_error "Build failed"
        exit 1
    fi
    
    print_success "All health checks passed ✓"
}

# Start development server
start_dev_server() {
    print_section "Starting Development Server"
    
    find_available_port
    
    # Update NEXT_PUBLIC_SITE_URL if port changed
    if [ $CURRENT_PORT -ne $DEFAULT_PORT ]; then
        sed -i.bak "s|NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=http://localhost:$CURRENT_PORT|" "$ENV_FILE"
        rm -f "${ENV_FILE}.bak"
    fi
    
    print_status "Starting Next.js development server on port $CURRENT_PORT..."
    
    # Start server in background
    PORT=$CURRENT_PORT $PACKAGE_MANAGER run dev > "$LOG_FILE" 2>&1 &
    NEXT_PID=$!
    
    # Save PID
    echo "$NEXT_PID" > "$PID_FILE"
    
    print_status "Server starting (PID: $NEXT_PID)..."
    
    # Give server initial time to start
    sleep 5
    
    # Wait for server to be ready
    local attempts=0
    local max_attempts=60
    
    while [ $attempts -lt $max_attempts ]; do
        if curl -s "$HEALTH_URL" >/dev/null 2>&1; then
            print_success "Server ready at http://localhost:$CURRENT_PORT ✓"
            return
        fi
        
        sleep 2
        attempts=$((attempts + 1))
        printf "."
    done
    
    echo
    print_error "Server failed to start within $(($max_attempts * 2)) seconds"
    
    if [ -n "$NEXT_PID" ]; then
        kill $NEXT_PID 2>/dev/null || true
    fi
    
    exit 1
}

# Monitor server health
start_monitoring() {
    print_section "Starting Health Monitor"
    
    (
        while true; do
            sleep 30
            
            # Check if main process is still running
            if ! kill -0 $NEXT_PID 2>/dev/null; then
                echo "[$(date '+%H:%M:%S')] ERROR: Development server stopped unexpectedly" >&2
                break
            fi
            
            # Check if server is responsive
            if ! curl -s "$HEALTH_URL" >/dev/null 2>&1; then
                echo "[$(date '+%H:%M:%S')] WARNING: Server not responding to health checks" >&2
            fi
        done
    ) &
    
    MONITOR_PID=$!
    print_success "Health monitor started (PID: $MONITOR_PID) ✓"
}

# Display running info
show_running_info() {
    echo -e "${WHITE}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║  🎮 $PROJECT_NAME is running - Court × Street × Pixel Architecture          ║"
    echo "╠══════════════════════════════════════════════════════════════════════════════╣"
    echo "║  🌐 Website:      http://localhost:$CURRENT_PORT                                      ║"
    echo "║  🔧 Admin Panel:  http://localhost:$CURRENT_PORT/admin                               ║"
    echo "║  📊 Health:       http://localhost:$CURRENT_PORT/api/health                          ║"
    echo "║  📈 Metrics:      http://localhost:$CURRENT_PORT/api/metrics                         ║"
    echo "║  🎯 Interactive:  http://localhost:$CURRENT_PORT/interactive                         ║"
    echo "╠══════════════════════════════════════════════════════════════════════════════╣"
    echo "║  👤 Admin Login:  admin / kkweb2024                                         ║"
    echo "║  📝 Logs:         tail -f $LOG_FILE                                      ║"
    echo "║  🛑 Stop:         Ctrl+C or kill $NEXT_PID                                    ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    print_success "$PROJECT_NAME development environment ready!"
    print_status "Press Ctrl+C to stop all services..."
}

# Cleanup function
cleanup() {
    print_section "Shutting Down Services"
    
    # Stop monitoring
    if [ -n "$MONITOR_PID" ]; then
        kill $MONITOR_PID 2>/dev/null || true
        print_status "Health monitor stopped"
    fi
    
    # Stop development server
    if [ -n "$NEXT_PID" ]; then
        print_status "Stopping development server..."
        kill $NEXT_PID 2>/dev/null || true
        
        # Wait for graceful shutdown
        local attempts=0
        while kill -0 $NEXT_PID 2>/dev/null && [ $attempts -lt 10 ]; do
            sleep 1
            attempts=$((attempts + 1))
        done
        
        # Force kill if still running
        if kill -0 $NEXT_PID 2>/dev/null; then
            kill -9 $NEXT_PID 2>/dev/null || true
            print_warning "Force killed development server"
        else
            print_success "Development server stopped gracefully"
        fi
    fi
    
    # Clean up PID file
    if [ -f "$PID_FILE" ]; then
        rm -f "$PID_FILE"
    fi
    
    # Kill any remaining Next.js processes on our port
    if is_port_in_use $CURRENT_PORT; then
        local port_pids=$(lsof -ti:$CURRENT_PORT 2>/dev/null || true)
        if [ -n "$port_pids" ]; then
            echo $port_pids | xargs kill 2>/dev/null || true
            print_status "Cleaned up remaining processes on port $CURRENT_PORT"
        fi
    fi
    
    print_success "All services stopped"
    echo -e "${CYAN}Thank you for using $PROJECT_NAME! 🎮${NC}"
}

# Status check function
show_status() {
    print_header
    
    if [ ! -f "$PID_FILE" ]; then
        print_status "$PROJECT_NAME is not running"
        return 1
    fi
    
    local pid=$(cat "$PID_FILE" 2>/dev/null || echo "")
    
    if [ -z "$pid" ] || ! kill -0 "$pid" 2>/dev/null; then
        print_warning "$PROJECT_NAME PID file exists but process is not running"
        rm -f "$PID_FILE"
        return 1
    fi
    
    print_success "$PROJECT_NAME is running (PID: $pid)"
    
    # Check server health
    if curl -s "$HEALTH_URL" >/dev/null 2>&1; then
        print_success "Server is responsive"
    else
        print_warning "Server is not responding to health checks"
    fi
    
    return 0
}

# Force stop function
force_stop() {
    print_section "Force Stopping All Services"
    
    # Kill by PID file
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE" 2>/dev/null || echo "")
        if [ -n "$pid" ]; then
            kill -9 "$pid" 2>/dev/null || true
        fi
        rm -f "$PID_FILE"
    fi
    
    # Kill all Next.js processes
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "node.*next" 2>/dev/null || true
    
    # Kill processes on common ports
    for port in 3000 3001 3002; do
        if is_port_in_use $port; then
            local port_pids=$(lsof -ti:$port 2>/dev/null || true)
            if [ -n "$port_pids" ]; then
                echo $port_pids | xargs kill -9 2>/dev/null || true
            fi
        fi
    done
    
    print_success "All processes terminated"
}

# Main function
main() {
    case "${1:-}" in
        "start"|"")
            # Default action is start
            print_header
            
            # Check if already running
            if show_status >/dev/null 2>&1; then
                print_warning "$PROJECT_NAME is already running"
                show_running_info
                return
            fi
            
            # Setup signal handlers for cleanup
            trap cleanup INT TERM EXIT
            
            check_system
            install_dependencies
            setup_environment
            run_health_checks
            start_dev_server
            start_monitoring
            show_running_info
            
            # Wait for interruption
            while kill -0 $NEXT_PID 2>/dev/null; do
                sleep 1
            done
            ;;
            
        "status")
            show_status
            ;;
            
        "stop")
            cleanup
            ;;
            
        "force-stop")
            force_stop
            ;;
            
        "health")
            print_header
            check_system
            run_health_checks
            print_success "All health checks passed ✓"
            ;;
            
        "install")
            print_header
            check_system
            install_dependencies
            setup_environment
            print_success "Installation complete ✓"
            ;;
            
        "clean")
            print_header
            print_section "Clean Installation"
            print_status "Removing node_modules and lock files..."
            rm -rf node_modules
            rm -f package-lock.json pnpm-lock.yaml
            print_status "Running fresh installation..."
            install_dependencies
            print_success "Clean installation complete ✓"
            ;;
            
        "reset")
            print_header
            print_section "Full Reset"
            force_stop
            rm -rf node_modules .next
            rm -f package-lock.json pnpm-lock.yaml .env.local
            rm -f .kkweb.pid .kkweb.log
            print_success "Full reset complete ✓"
            print_status "Run './kkweb' to reinstall and start"
            ;;

        "help"|"-h"|"--help")
            print_header
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  start          Start the development environment (default)"
            echo "  status         Show current status"
            echo "  stop           Stop all services"
            echo "  force-stop     Force kill all processes"
            echo "  health         Run health checks only"
            echo "  install        Install dependencies and setup environment"
            echo "  clean          Clean install dependencies (fixes lock file issues)"
            echo "  reset          Full reset (removes everything, forces fresh start)"
            echo "  help           Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0             # Start development environment"
            echo "  $0 start       # Start development environment"
            echo "  $0 status      # Check if running"
            echo "  $0 stop        # Stop services"
            echo "  $0 clean       # Fix dependency/lock file issues"
            echo "  $0 reset       # Nuclear option - reset everything"
            ;;
            
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' for available commands"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"