#!/bin/bash

# Frontend Build Configuration Script
echo "🚀 Frontend Build Configuration"
echo "================================"

# Build the project
echo "📦 Building React application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Copy config file to build directory
    cp public/config.js build/config.js
    echo "✅ Runtime configuration copied to build directory"
    
    # Show build info
    echo ""
    echo "📁 Build Output:"
    echo "  - Static files: build/static/"
    echo "  - Main HTML: build/index.html"
    echo "  - Runtime config: build/config.js"
    echo ""
    echo "⚙️  To change backend URL after build:"
    echo "  1. Edit build/config.js file"
    echo "  2. Update BACKEND_URL and API_URL values"
    echo "  3. No rebuild required!"
    echo ""
    echo "🌐 Current configuration:"
    echo "  BACKEND_URL: $(grep BACKEND_URL public/config.js)"
    echo "  API_URL: $(grep API_URL public/config.js)"
    
else
    echo "❌ Build failed!"
    exit 1
fi