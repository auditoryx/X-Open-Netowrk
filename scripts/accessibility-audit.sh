#!/bin/bash

# Accessibility Audit Script for AuditoryX
# Runs Lighthouse accessibility audits on key pages

echo "🔍 Running Accessibility Audit for AuditoryX..."

# Create audit directory
mkdir -p audits/accessibility

# Key pages to audit
declare -a pages=(
  "/"
  "/explore"
  "/dashboard"
  "/booking"
  "/profile"
)

# Start the development server
echo "📡 Starting development server..."
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 10

# Function to run lighthouse audit
run_audit() {
  local path=$1
  local name=$(echo $path | sed 's/\//_/g' | sed 's/^_//')
  if [ "$name" = "" ]; then
    name="homepage"
  fi
  
  echo "🔍 Auditing: $path"
  
  npx lighthouse "http://localhost:3000$path" \
    --only-categories=accessibility \
    --output=html \
    --output-path="audits/accessibility/${name}_accessibility.html" \
    --quiet
    
  npx lighthouse "http://localhost:3000$path" \
    --only-categories=accessibility \
    --output=json \
    --output-path="audits/accessibility/${name}_accessibility.json" \
    --quiet
}

# Run audits for each page
for page in "${pages[@]}"; do
  run_audit "$page"
done

# Stop the development server
kill $SERVER_PID

echo "✅ Accessibility audits completed!"
echo "📊 Reports saved to: audits/accessibility/"
echo ""
echo "📈 Summary:"

# Generate summary from JSON reports
for page in "${pages[@]}"; do
  local name=$(echo $page | sed 's/\//_/g' | sed 's/^_//')
  if [ "$name" = "" ]; then
    name="homepage"
  fi
  
  if [ -f "audits/accessibility/${name}_accessibility.json" ]; then
    score=$(cat "audits/accessibility/${name}_accessibility.json" | jq '.categories.accessibility.score * 100')
    echo "  $page: ${score}%"
  fi
done

echo ""
echo "🎯 Target: 90%+ accessibility score for all pages"
echo "📋 Open HTML reports in browser to see detailed recommendations"
