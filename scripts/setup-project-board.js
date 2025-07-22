#!/usr/bin/env node
/**
 * Beta Launch Project Board Setup Script
 * 
 * This script provides instructions and automation for setting up
 * the "Beta Launch" project board with the required column structure.
 * 
 * Usage: node scripts/setup-project-board.js
 */

const { execSync } = require('child_process');

/**
 * Project board configuration
 */
const PROJECT_CONFIG = {
  title: "Beta Launch",
  description: "Beta launch issue tracking and project management board",
  columns: [
    "Backlog",
    "Ready", 
    "In Progress",
    "Review",
    "Testing",
    "Done"
  ]
};

/**
 * Generates GitHub CLI commands for project setup
 */
function generateProjectSetupCommands() {
  return `
# Create the Beta Launch project board
gh project create --title "${PROJECT_CONFIG.title}" --body "${PROJECT_CONFIG.description}"

# Note: Column creation via CLI is limited. 
# You may need to set up columns manually via the GitHub web interface:
# https://github.com/auditoryx/X-Open-Netowrk/projects

echo "📝 Manual setup required:"
echo "1. Go to: https://github.com/auditoryx/X-Open-Netowrk/projects"
echo "2. Find the '${PROJECT_CONFIG.title}' project"
echo "3. Add the following columns in order:"
${PROJECT_CONFIG.columns.map((col, index) => `echo "   ${index + 1}. ${col}"`).join('\n')}
echo
echo "4. Configure column automation (optional):"
echo "   - Backlog: Newly added issues"
echo "   - Ready: Issues ready for development"
echo "   - In Progress: Issues being worked on"
echo "   - Review: Issues in code review"
echo "   - Testing: Issues in QA testing"
echo "   - Done: Completed issues"
`.trim();
}

/**
 * Generates script to add all issues to backlog
 */
function generateAddIssuesToBacklogScript() {
  return `#!/bin/bash
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
gh issue list --label "beta-gap" --limit 200 --json number | \\
    jq -r '.[].number' | \\
    while read issue_number; do
        echo "Adding issue #$issue_number to project backlog"
        gh project item-add $PROJECT_ID --issue $issue_number || echo "Failed to add #$issue_number"
    done

# Add post-mvp issues  
gh issue list --label "post-mvp" --limit 200 --json number | \\
    jq -r '.[].number' | \\
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
`;
}

/**
 * Creates complete project board setup documentation
 */
function generateProjectDocumentation() {
  return `# Beta Launch Project Board Setup Guide

## Overview
This document provides step-by-step instructions for setting up the "Beta Launch" project board
as required by issue #273.

## Project Configuration
- **Title:** ${PROJECT_CONFIG.title}
- **Description:** ${PROJECT_CONFIG.description}
- **Repository:** auditoryx/X-Open-Netowrk

## Required Columns
The project board must have the following columns in order:

${PROJECT_CONFIG.columns.map((col, index) => `${index + 1}. **${col}**`).join('\n')}

## Setup Steps

### Step 1: Create Project Board
Run the following command to create the project:

\`\`\`bash
gh project create --title "${PROJECT_CONFIG.title}" --body "${PROJECT_CONFIG.description}"
\`\`\`

### Step 2: Set Up Columns
Since GitHub CLI has limited project column management, you'll need to:

1. Go to [GitHub Projects](https://github.com/auditoryx/X-Open-Netowrk/projects)
2. Find the "${PROJECT_CONFIG.title}" project
3. Add columns manually using the web interface

### Step 3: Configure Column Automation (Recommended)
Set up the following automation rules:

- **Backlog:** Auto-add newly created issues with labels \`beta-gap\` or \`post-mvp\`
- **Ready:** Issues that are ready for development (manual move)
- **In Progress:** Auto-move when assigned to a developer
- **Review:** Auto-move when PR is created
- **Testing:** Auto-move when PR is merged
- **Done:** Auto-move when issue is closed

### Step 4: Add Issues to Project
Use the generated script to add all created issues to the backlog:

\`\`\`bash
./scripts/add-issues-to-project.sh
\`\`\`

## Project Board Views
Consider setting up these views for better organization:

### By Priority
- Filter by priority labels (\`priority:critical\`, \`priority:high\`, etc.)
- Sort by priority level

### By Milestone
- Group by milestone (\`Pre Launch Sprint\`, \`Beta v1.1\`, etc.)
- Sort by due date

### By Assignee
- Group by assigned team member
- Shows workload distribution

### By Label
- Filter by feature area (\`authentication\`, \`payments\`, \`ui-ux\`, etc.)
- Helps track progress by domain

## Maintenance
- Review project board weekly
- Update issue status as work progresses
- Archive completed issues monthly
- Update automation rules as needed

## Success Metrics
- All ${PROJECT_CONFIG.columns.length} columns configured
- All issues added to backlog
- Automation rules active
- Team members have access
- Regular updates being made

## Troubleshooting

### Project Not Found
If the project doesn't appear, check:
- Project was created successfully
- You have proper repository permissions
- Project is public/visible to team

### Issues Not Adding
If issues won't add to project:
- Verify project ID is correct
- Check issue exists and is accessible
- Ensure proper GitHub CLI authentication

### Automation Not Working
If column automation fails:
- Review automation rule configuration
- Check rule triggers and conditions
- Test with a sample issue

## Next Steps After Setup
1. Comment "DONE" on issue #273 with project board summary
2. Share project board link with team
3. Begin triaging and assigning issues
4. Set up regular project review meetings
`;
}

/**
 * Main execution function
 */
function main() {
  console.log('🗂️  Beta Launch Project Board Setup');
  console.log('===================================');
  console.log();
  
  console.log('📋 Project Configuration:');
  console.log(`- Title: ${PROJECT_CONFIG.title}`);
  console.log(`- Columns: ${PROJECT_CONFIG.columns.length}`);
  console.log(`- Column Order: ${PROJECT_CONFIG.columns.join(' → ')}`);
  console.log();
  
  // Generate setup commands
  console.log('🔧 Setup Commands:');
  console.log('==================');
  console.log(generateProjectSetupCommands());
  console.log();
  
  // Create scripts
  const addIssuesScript = generateAddIssuesToBacklogScript();
  require('fs').writeFileSync('./scripts/add-issues-to-project.sh', addIssuesScript);
  require('fs').chmodSync('./scripts/add-issues-to-project.sh', '755');
  
  // Create documentation
  const documentation = generateProjectDocumentation();
  require('fs').writeFileSync('./docs/BETA_PROJECT_BOARD_SETUP.md', documentation);
  
  console.log('📝 Generated Files:');
  console.log('- ./scripts/add-issues-to-project.sh (executable)');
  console.log('- ./docs/BETA_PROJECT_BOARD_SETUP.md (documentation)');
  console.log();
  
  console.log('🚀 Next Steps:');
  console.log('1. Run the setup commands above to create the project');
  console.log('2. Manually set up columns in GitHub web interface');
  console.log('3. Run ./scripts/add-issues-to-project.sh to add issues');
  console.log('4. Review documentation in ./docs/BETA_PROJECT_BOARD_SETUP.md');
}

if (require.main === module) {
  main();
}

module.exports = {
  PROJECT_CONFIG,
  generateProjectSetupCommands,
  generateAddIssuesToBacklogScript,
  generateProjectDocumentation
};