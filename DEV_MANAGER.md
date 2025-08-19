# Development Manager

A comprehensive script to manage your Next.js development environment with health monitoring.

## Quick Start

```bash
# Start everything (recommended)
npm run dev:manage

# Stop everything
npm run dev:stop

# Check status
npm run dev:status

# Run health checks only
npm run health
```

## What it does

### ✅ Health Checks
- Verifies Node.js and npm installation
- Checks all required dependencies
- Validates environment variables
- Runs TypeScript compilation
- Runs ESLint
- Tests production build

### 🚀 Development Server
- Starts Next.js development server
- Automatically handles port conflicts (3000 → 3001)
- Monitors server health every 30 seconds
- Provides real-time status updates

### 🛡️ Monitoring
- Continuous health monitoring
- HTTP endpoint checks
- Process monitoring
- Automatic cleanup on exit

### 🔧 Environment Setup
- Auto-creates `.env.local` if missing
- Sets up required environment variables:
  - `ADMIN_USERNAME=kk`
  - `ADMIN_PASSWORD=2025`
  - `CONTENT_STORAGE=FILE`

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev:manage` | Start development server with monitoring |
| `npm run dev:stop` | Stop all processes |
| `npm run dev:status` | Show current status |
| `npm run health` | Run comprehensive health checks |

## Features

- **One-command start**: Everything starts with health checks
- **One-command stop**: Clean shutdown of all processes (Ctrl+C)
- **Health monitoring**: Continuous monitoring every 30 seconds
- **Auto-recovery**: Detects and reports issues
- **Port handling**: Automatically uses available ports
- **Environment validation**: Ensures all required config is present
- **Process management**: Clean PID tracking and cleanup

## Access Points

- **Main Site**: http://localhost:3000 (or :3001)
- **Admin Panel**: http://localhost:3000/admin (or :3001/admin)
- **Credentials**: Username: `kk`, Password: `2025`

## Exit

Press `Ctrl+C` to stop everything cleanly. The script will:
1. Stop the health monitor
2. Stop the development server
3. Clean up all processes
4. Remove temporary files

## Troubleshooting

If something goes wrong:

1. Run health checks: `npm run health`
2. Check status: `npm run dev:status`  
3. Force stop: `npm run dev:stop`
4. Check processes: `ps aux | grep next`
5. Kill manually if needed: `pkill -f "next dev"`

## Script Location

The main script is located at: `./scripts/dev-manager.sh`

You can also run it directly:
```bash
./scripts/dev-manager.sh start    # Start with monitoring
./scripts/dev-manager.sh stop     # Stop everything
./scripts/dev-manager.sh status   # Show status
./scripts/dev-manager.sh health   # Health checks only
```