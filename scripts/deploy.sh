#!/bin/bash

# CollageForge Deployment Script for Render

echo "🚀 Preparing CollageForge for Render deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server && npm install && cd ..

# Build the frontend
echo "🏗️ Building frontend for production..."
npm run build

# Test the build
if [ ! -d "build" ]; then
    echo "❌ Error: Build directory not found. Build failed."
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📁 Build size:"
du -sh build/

echo ""
echo "🎉 Ready for Render deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your GitHub repo to Render"
echo "3. Use the render.yaml configuration"
echo "4. Set environment variables in Render dashboard"
echo ""
echo "🔧 Required environment variables:"
echo "- REACT_APP_PRINTFUL_API_KEY (optional)"
echo "- REACT_APP_PRINT_ORDER_EMAIL (optional)"
echo ""