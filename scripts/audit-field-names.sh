#!/bin/bash

# Field Name Audit Script
# This script checks for legacy field names in the codebase

echo "🔍 Firestore Field Name Audit"
echo "=============================="

# Define legacy field patterns to search for
LEGACY_PATTERNS=(
  "reviewerId"
  # Add more patterns as needed
)

# Define directories to scan
SCAN_DIRS=(
  "src/"
  "lib/"
  "functions/"
  "scripts/"
)

# Track total occurrences
total_occurrences=0
audit_passed=true

echo "📂 Scanning directories: ${SCAN_DIRS[*]}"
echo "🔍 Looking for patterns: ${LEGACY_PATTERNS[*]}"
echo ""

# Function to scan for a pattern
scan_pattern() {
  local pattern="$1"
  local count=0
  
  echo "🔍 Scanning for: $pattern"
  
  for dir in "${SCAN_DIRS[@]}"; do
    if [ -d "$dir" ]; then
      # Search for the pattern in TypeScript and JavaScript files, excluding tests and migration files
      results=$(grep -r "$pattern" "$dir" --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" \
        --exclude="*test*" --exclude="*spec*" --exclude="migrateFields.ts" 2>/dev/null)
      
      if [ -n "$results" ]; then
        echo "❌ Found $pattern in:"
        echo "$results" | while read -r line; do
          echo "   $line"
          ((count++))
        done
        echo ""
        audit_passed=false
      fi
    fi
  done
  
  if [ $count -eq 0 ]; then
    echo "✅ No occurrences of $pattern found"
  else
    echo "❌ Found $count occurrences of $pattern"
    total_occurrences=$((total_occurrences + count))
  fi
  
  echo ""
}

# Scan for each legacy pattern
for pattern in "${LEGACY_PATTERNS[@]}"; do
  scan_pattern "$pattern"
done

# Summary
echo "📊 AUDIT SUMMARY"
echo "================"
echo "Total legacy field occurrences: $total_occurrences"

if [ "$audit_passed" = true ]; then
  echo "✅ AUDIT PASSED: No legacy field names found"
  exit 0
else
  echo "❌ AUDIT FAILED: Legacy field names found in codebase"
  echo ""
  echo "🔧 Action Required:"
  echo "1. Run migration script: npm run migrate:fields"
  echo "2. Update code to use new field names"
  echo "3. Run audit again to verify cleanup"
  exit 1
fi