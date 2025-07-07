#!/bin/bash
# Lightweight production build script

echo "🚀 Starting lightweight production build..."

# Clean previous build
rm -rf .next

# Set memory optimization
export NODE_OPTIONS="--max-old-space-size=6144"
export SKIP_ENV_VALIDATION=true
export NEXT_TELEMETRY_DISABLED=1

# Build with all optimizations disabled
echo "🏗️ Building application with maximum optimization..."
npx next build

if [ $? -eq 0 ]; then
  echo "✅ Build completed successfully!"
  echo "🎉 Production build ready for deployment!"
  
  # Show build info
  echo "📊 Build Information:"
  echo "- Build directory: .next"
  echo "- Static files: .next/static"
  echo "- Server files: .next/server"
  
else
  echo "❌ Build failed!"
  exit 1
fi
