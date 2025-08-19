#!/bin/bash

# Kadir's Personal Website - Admin Panel Startup Script
# This script sets up and starts the development environment with admin panel

echo "🚀 Starting Kadir's Personal Website with Admin Panel..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
    echo ""
fi

# Check if admin dependencies are installed
echo "📦 Checking admin panel dependencies..."
if ! npm list @radix-ui/react-label @radix-ui/react-switch &> /dev/null; then
    echo "Installing missing admin panel dependencies..."
    npm install @radix-ui/react-label @radix-ui/react-switch
    if [ $? -ne 0 ]; then
        echo "⚠️  Warning: Failed to install some admin dependencies, but continuing..."
    fi
else
    echo "✅ Admin panel dependencies already installed"
fi

# Run type check
echo "🔍 Running type check..."
npm run typecheck
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Type check failed, but continuing..."
fi

# Run linting
echo "🧹 Running linter..."
npm run lint
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Linting issues found, but continuing..."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Starting development server..."
echo "   - Main site: http://localhost:3000"
echo "   - Admin panel: http://localhost:3000/admin"
echo ""
echo "📋 Admin Panel Features:"
echo "   ✅ Project management"
echo "   ✅ Experience management" 
echo "   ✅ Social links management"
echo "   ✅ Media embeds management"
echo "   ✅ Build project from panel"
echo "   ✅ Real-time content editing"
echo ""
echo "🔧 Available commands:"
echo "   - npm run dev     (start development server)"
echo "   - npm run build   (build for production)"
echo "   - npm run lint    (run linter)"
echo "   - npm run format  (format code)"
echo ""
echo "Press Ctrl+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start the development server
npm run dev