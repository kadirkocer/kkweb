# 🎮 KKWeb Development Manager

## One Script to Rule Them All

The KKWeb development manager is a comprehensive script that handles everything from installation to deployment for your Next.js 14 Court × Street × Pixel website.

## 🚀 Quick Start

```bash
# Start everything (installs dependencies, sets up environment, runs health checks, starts server)
./kkweb

# Or using npm
npm run dev
```

That's it! The script will automatically:
- ✅ Check system requirements (Node.js 18+)
- ✅ Install/update dependencies
- ✅ Create/update `.env.local` with secure defaults
- ✅ Run TypeScript and ESLint checks
- ✅ Test production build
- ✅ Start development server with health monitoring
- ✅ Handle port conflicts (3000 → 3001 → 3002+)
- ✅ Display all access URLs and credentials

## 📋 Available Commands

### Basic Commands
```bash
./kkweb start    # Start development environment (default)
./kkweb stop     # Stop all services gracefully
./kkweb status   # Check if services are running
./kkweb health   # Run comprehensive health checks
```

### Utility Commands
```bash
./kkweb install     # Install dependencies and setup environment only
./kkweb force-stop  # Force kill all processes
./kkweb help        # Show help message
```

### NPM Scripts (equivalent)
```bash
npm run dev         # Start development environment
npm run stop        # Stop all services
npm run status      # Check status
npm run health      # Run health checks
npm run install-setup  # Setup only
```

## 🎯 What Happens When You Start

### 1. System Check ✅
- Verifies Node.js 18+ is installed
- Detects package manager (pnpm preferred, npm fallback)
- Confirms you're in the correct project directory

### 2. Dependencies 📦
- Installs/updates packages if needed
- Uses frozen lockfile for consistency
- Automatically detects if reinstall is needed

### 3. Environment Setup 🔧
- Creates `.env.local` if missing
- Sets secure default admin credentials
- Configures all required environment variables
- Updates URLs if port changes

### 4. Health Checks 🏥
- Runs TypeScript compilation check
- Executes ESLint validation
- Tests production build to catch issues early
- All must pass before starting server

### 5. Server Launch 🚀
- Finds available port (3000 → 3001 → 3002+)
- Starts Next.js development server
- Waits for server to be ready
- Confirms health endpoint responds

### 6. Monitoring 👁️
- Continuous health monitoring every 30 seconds
- Detects server crashes automatically
- Monitors HTTP endpoint availability
- Logs all activity to `.kkweb.log`

## 🌐 Access Points

Once running, you'll have access to:

| Service | URL | Purpose |
|---------|-----|---------|
| **Website** | http://localhost:3000 | Main site with side-scrolling experience |
| **Admin Panel** | http://localhost:3000/admin | Content management (admin/kkweb2024) |
| **Health Check** | http://localhost:3000/api/health | System status and configuration |
| **Metrics** | http://localhost:3000/api/metrics | Prometheus metrics (if enabled) |
| **Interactive** | http://localhost:3000/interactive | Side-scrolling showcase |

## 🔐 Default Credentials

- **Username**: `admin`
- **Password**: `kkweb2024`

⚠️ **Change these in production!**

## 🛑 Stopping Services

### Graceful Shutdown
```bash
# In the terminal where kkweb is running
Ctrl+C

# Or from another terminal
./kkweb stop
npm run stop
```

### Force Stop
```bash
# If graceful shutdown fails
./kkweb force-stop
```

## 📊 Environment Variables Set

The script automatically creates these environment variables:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=kkweb2024

# Content Storage
CONTENT_STORAGE=FILE

# Security & Rate Limiting
RATE_LIMIT=10
REVALIDATE_TOKEN=kkweb-dev-token-[timestamp]

# Observability
METRICS_ENABLED=true
METRICS_BASIC=1

# Development Features
DEBUG_MODE=true
NODE_ENV=development
BUILD_ID=development-[timestamp]
```

## 🔧 Troubleshooting

### Port Already in Use
The script automatically finds available ports. If you see:
```
Port 3000 in use, using 3001
```
This is normal and handled automatically.

### Health Checks Fail
If TypeScript or build checks fail:
```bash
# Run individual checks
npm run typecheck
npm run lint
npm run build
```

### Server Won't Start
```bash
# Check what's using the port
lsof -i :3000

# Force stop everything
./kkweb force-stop

# Try again
./kkweb start
```

### Environment Issues
```bash
# Recreate environment file
rm .env.local
./kkweb install
```

## 📝 Logging

All server output is logged to `.kkweb.log`:
```bash
# Watch logs in real-time
tail -f .kkweb.log

# View recent errors
tail -50 .kkweb.log | grep ERROR
```

## 🎮 Features

### Court × Street × Pixel Theme
- Custom color palette with CSS variables
- Pixel-perfect rendering and animations
- Accessibility support with reduced motion
- Box mark and stencil label motifs

### Security Hardening
- Basic Auth for admin routes
- Rate limiting (10 req/sec default)
- Metrics endpoint protection
- Request ID generation for debugging

### Performance & SEO
- ISR with 60-second revalidation
- Draft mode with `?draft=1`
- Automatic asset optimization
- Core Web Vitals monitoring

### Developer Experience
- Hot reload with file watching
- Comprehensive error handling
- Debug mode with keyboard shortcuts
- Health monitoring and auto-recovery

## 🆘 Support

If something goes wrong:

1. **Check Status**: `./kkweb status`
2. **View Logs**: `tail -f .kkweb.log`
3. **Run Health Check**: `./kkweb health`
4. **Force Restart**: `./kkweb force-stop && ./kkweb start`

## 🎯 Advanced Usage

### Custom Port
```bash
# The script handles this automatically, but you can force a port:
PORT=3005 ./kkweb start
```

### Production Mode
```bash
# Build and start production server
npm run build
npm run prod
```

### Health Check Only
```bash
# Run checks without starting server
./kkweb health
```

---

**That's it!** One script handles everything from development to deployment. Just run `./kkweb` and start coding! 🎮