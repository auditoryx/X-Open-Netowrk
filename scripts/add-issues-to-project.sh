#!/bin/bash
# Script to add all created issues to the Beta Launch project backlog
# This assumes all issues have been created and the project board exists

echo "🗂️  Adding all issues to Beta Launch project backlog..."

# Get project ID (you may need to update this)
PROJECT_ID=$(gh project list --owner auditoryx | grep "Beta Launch" | awk '{print $1}')

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Beta Launch project not found. Please create it first."
    exit 1
fi

echo "📌 Found project ID: $PROJECT_ID"

# Get all beta-gap and post-mvp issues
echo "🔍 Finding all beta-gap and post-mvp issues..."

# Add beta-gap issues
gh issue list --label "beta-gap" --limit 200 --json number | \
    jq -r '.[].number' | \
    while read issue_number; do
        echo "Adding issue #$issue_number to project backlog"
        gh project item-add $PROJECT_ID --issue $issue_number || echo "Failed to add #$issue_number"
    done

# Add post-mvp issues  
gh issue list --label "post-mvp" --limit 200 --json number | \
    jq -r '.[].number' | \
    while read issue_number; do
        echo "Adding issue #$issue_number to project backlog"
        gh project item-add $PROJECT_ID --issue $issue_number || echo "Failed to add #$issue_number"
    done

echo "✅ All issues added to project backlog!"
echo
echo "Next steps:"
echo "1. Review project board: https://github.com/auditoryx/X-Open-Netowrk/projects"
echo "2. Move issues to appropriate columns based on readiness"
echo "3. Assign issues to team members"
echo "4. Set up project automation rules"
