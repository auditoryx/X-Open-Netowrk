#!/bin/bash

# Script to systematically restore all imported components

echo "🔍 Finding all imported components..."

# Create a comprehensive list of all imported components from src/app and pages directories
find src/app pages -name "*.tsx" -o -name "*.ts" | xargs grep -h "from '@/components/" | \
  sed -E "s/.*from ['\"]@\/components\/([^'\"]+)['\"].*/\1/" | \
  sort | uniq > /tmp/imported_components.txt

echo "Found $(cat /tmp/imported_components.txt | wc -l) unique imported components"

# Try to restore each component
restored_count=0
while IFS= read -r component_path; do
    # Skip empty lines
    if [ -z "$component_path" ]; then
        continue
    fi
    
    # Try different possible file paths
    possible_files=(
        "src/components/${component_path}.tsx"
        "src/components/${component_path}.ts" 
        "src/components/${component_path}/index.tsx"
        "src/components/${component_path}/index.ts"
    )
    
    for file_path in "${possible_files[@]}"; do
        if git ls-files --deleted | grep -q "^$file_path$"; then
            echo "Restoring: $file_path"
            git restore "$file_path" 2>/dev/null
            if [ $? -eq 0 ]; then
                ((restored_count++))
                break
            fi
        fi
    done
done < /tmp/imported_components.txt

echo "✅ Restored $restored_count component files"

# Clean up
rm -f /tmp/imported_components.txt