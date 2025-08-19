#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEV_SERVER_PORT=3000
HEALTH_CHECK_INTERVAL=30
PID_FILE="$PROJECT_DIR/.dev-manager.pid"

# Store PIDs for cleanup
DEV_SERVER_PID=""
HEALTH_CHECK_PID=""

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}   Development Manager Script   ${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_status() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARNING: $1${NC}"
}

print_error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ERROR: $1${NC}"
}

check_dependencies() {
    print_status "Checking project dependencies..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        return 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        return 1
    fi
    
    # Check if package.json exists
    if [ ! -f "$PROJECT_DIR/package.json" ]; then
        print_error "package.json not found in $PROJECT_DIR"
        return 1
    fi
    
    # Check if node_modules exists
    if [ ! -d "$PROJECT_DIR/node_modules" ]; then
        print_warning "node_modules not found, running npm install..."
        cd "$PROJECT_DIR"
        npm install
        if [ $? -ne 0 ]; then
            print_error "npm install failed"
            return 1
        fi
    fi
    
    print_status "Dependencies check passed ✓"
    return 0
}

check_environment() {
    print_status "Checking environment configuration..."
    
    # Check if .env.local exists
    if [ ! -f "$PROJECT_DIR/.env.local" ]; then
        print_warning ".env.local not found, creating with defaults..."
        cat > "$PROJECT_DIR/.env.local" << EOF
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
ADMIN_USERNAME=kk
ADMIN_PASSWORD=2025
CONTENT_STORAGE=FILE
EOF
    fi
    
    # Check required environment variables
    source "$PROJECT_DIR/.env.local"
    
    if [ -z "$ADMIN_USERNAME" ]; then
        print_error "ADMIN_USERNAME not set in .env.local"
        return 1
    fi
    
    if [ -z "$ADMIN_PASSWORD" ]; then
        print_error "ADMIN_PASSWORD not set in .env.local"
        return 1
    fi
    
    print_status "Environment check passed ✓"
    return 0
}

check_port_availability() {
    local port=$1
    if lsof -ti:$port > /dev/null 2>&1; then
        print_warning "Port $port is already in use"
        return 1
    fi
    return 0
}

run_health_checks() {
    print_status "Running comprehensive health checks..."
    
    # Check TypeScript compilation
    cd "$PROJECT_DIR"
    print_status "Checking TypeScript compilation..."
    npm run typecheck > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        print_error "TypeScript compilation failed"
        npm run typecheck
        return 1
    fi
    print_status "TypeScript check passed ✓"
    
    # Check ESLint
    print_status "Running ESLint..."
    npm run lint > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        print_error "ESLint check failed"
        npm run lint
        return 1
    fi
    print_status "ESLint check passed ✓"
    
    # Test build
    print_status "Testing production build..."
    if ! npm run build > /tmp/build.log 2>&1; then
        print_error "Production build failed"
        cat /tmp/build.log
        return 1
    fi
    print_status "Production build test passed ✓"
    
    return 0
}

start_dev_server() {
    print_status "Starting development server..."
    cd "$PROJECT_DIR"
    
    # Start the development server in background
    npm run dev &
    DEV_SERVER_PID=$!
    
    # Wait a moment for server to start
    sleep 3
    
    # Check if process is still running
    if ! kill -0 $DEV_SERVER_PID 2>/dev/null; then
        print_error "Development server failed to start"
        return 1
    fi
    
    print_status "Development server started with PID: $DEV_SERVER_PID"
    return 0
}

monitor_health() {
    while true; do
        sleep $HEALTH_CHECK_INTERVAL
        
        # Check if dev server is still running
        if ! kill -0 $DEV_SERVER_PID 2>/dev/null; then
            print_error "Development server has stopped unexpectedly"
            cleanup_and_exit 1
        fi
        
        # Try to ping the server
        local server_url="http://localhost:3000"
        if ! curl -s -f "$server_url" > /dev/null 2>&1; then
            # Try port 3001 if 3000 fails
            server_url="http://localhost:3001"
            if ! curl -s -f "$server_url" > /dev/null 2>&1; then
                print_warning "Server is not responding to HTTP requests"
            else
                print_status "Health check passed - Server responding on port 3001"
            fi
        else
            print_status "Health check passed - Server responding on port 3000"
        fi
    done
}

cleanup_and_exit() {
    local exit_code=${1:-0}
    
    print_status "Cleaning up..."
    
    # Kill health monitor
    if [ ! -z "$HEALTH_CHECK_PID" ]; then
        kill $HEALTH_CHECK_PID 2>/dev/null
    fi
    
    # Kill development server
    if [ ! -z "$DEV_SERVER_PID" ]; then
        print_status "Stopping development server (PID: $DEV_SERVER_PID)..."
        kill $DEV_SERVER_PID 2>/dev/null
        sleep 2
        # Force kill if still running
        kill -9 $DEV_SERVER_PID 2>/dev/null
    fi
    
    # Kill any remaining Next.js processes
    pkill -f "next dev" 2>/dev/null
    
    # Remove PID file
    rm -f "$PID_FILE"
    
    print_status "Cleanup complete"
    exit $exit_code
}

show_status() {
    print_header
    echo -e "${BLUE}Project Status:${NC}"
    echo "  Directory: $PROJECT_DIR"
    
    if [ ! -z "$DEV_SERVER_PID" ]; then
        echo "  Dev Server PID: $DEV_SERVER_PID"
        if kill -0 $DEV_SERVER_PID 2>/dev/null; then
            echo -e "  Dev Server Status: ${GREEN}Running${NC}"
        else
            echo -e "  Dev Server Status: ${RED}Stopped${NC}"
        fi
    fi
    
    # Check ports
    if lsof -ti:3000 > /dev/null 2>&1; then
        echo -e "  Port 3000: ${GREEN}In Use${NC}"
        echo "  Server URL: http://localhost:3000"
    elif lsof -ti:3001 > /dev/null 2>&1; then
        echo -e "  Port 3001: ${GREEN}In Use${NC}"
        echo "  Server URL: http://localhost:3001"
    else
        echo -e "  Ports: ${RED}Not in use${NC}"
    fi
    
    echo "  Admin URL: http://localhost:3000/admin (or :3001/admin)"
    echo "  Credentials: kk / 2025"
    echo ""
}

# Signal handlers
trap cleanup_and_exit SIGINT SIGTERM

# Main execution
case "${1:-start}" in
    "start")
        print_header
        
        # Store this script's PID
        echo $$ > "$PID_FILE"
        
        # Run all checks
        check_dependencies || cleanup_and_exit 1
        check_environment || cleanup_and_exit 1
        run_health_checks || cleanup_and_exit 1
        
        # Start the development server
        start_dev_server || cleanup_and_exit 1
        
        # Show status
        show_status
        
        print_status "All systems running! Press Ctrl+C to stop everything"
        print_status "Monitoring health every $HEALTH_CHECK_INTERVAL seconds..."
        
        # Start health monitoring in background
        monitor_health &
        HEALTH_CHECK_PID=$!
        
        # Wait for interrupt
        while true; do
            sleep 1
        done
        ;;
    
    "status")
        show_status
        ;;
    
    "stop")
        if [ -f "$PID_FILE" ]; then
            local manager_pid=$(cat "$PID_FILE")
            print_status "Stopping development manager (PID: $manager_pid)..."
            kill $manager_pid 2>/dev/null
        fi
        
        # Also kill any Next.js processes
        pkill -f "next dev" 2>/dev/null
        print_status "All processes stopped"
        ;;
    
    "health")
        print_status "Running health checks..."
        check_dependencies && check_environment && run_health_checks
        if [ $? -eq 0 ]; then
            print_status "All health checks passed ✓"
        else
            print_error "Some health checks failed"
            exit 1
        fi
        ;;
    
    *)
        echo "Usage: $0 [start|stop|status|health]"
        echo "  start   - Start development server with health monitoring (default)"
        echo "  stop    - Stop all processes"
        echo "  status  - Show current status"
        echo "  health  - Run health checks only"
        exit 1
        ;;
esac