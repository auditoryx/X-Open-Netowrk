#!/bin/bash
# Production build script with memory optimization

echo "🚀 Starting production build with memory optimization..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf .next

# Set Node.js memory limit and build options
export NODE_OPTIONS="--max-old-space-size=2048"
export SKIP_ENV_VALIDATION=true
export NEXT_TELEMETRY_DISABLED=1

# Disable linting during build to save memory
echo "🏗️ Building application (linting disabled for memory optimization)..."
npx next build --no-lint

# Check if build succeeded
if [ $? -eq 0 ]; then
  echo "✅ Build completed successfully!"
  
  # Run type checking separately
  echo "🔍 Running type checking..."
  npx tsc --noEmit
  
  echo "🎉 Production build process completed!"
else
  echo "❌ Build failed!"
  exit 1
fi
