#!/bin/bash
# Production build script with memory optimization

echo "🚀 Starting production build with memory optimization..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf .next

# Set Node.js memory limit and build options
export NODE_OPTIONS="--max-old-space-size=4096"
export SKIP_ENV_VALIDATION=true
export NEXT_TELEMETRY_DISABLED=1

# Disable linting during build to save memory
echo "🏗️ Building application (linting disabled for memory optimization)..."
npx next build --no-lint

# Check if build succeeded
if [ $? -eq 0 ]; then
  echo "✅ Build completed successfully!"
  
  # Skip type checking in production build to avoid memory issues
  echo "⚠️  Skipping type checking in production build (memory optimization)"
  echo "💡 Run 'npm run type-check' separately if needed"
  
  echo "🎉 Production build process completed!"
else
  echo "❌ Build failed!"
  exit 1
fi
