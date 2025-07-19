#!/usr/bin/env node

/**
 * Restore actively imported components that were accidentally deleted
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = process.cwd();

// Find all actively imported component paths
function findActivelyImportedComponents() {
    try {
        // Search for all import statements in the codebase
        const result = execSync(`find src pages -name "*.tsx" -o -name "*.ts" | xargs grep -h "from '@/components/" | sed "s/.*from '@\\/components\\/\\([^']*\\)'.*/\\1/" | sort | uniq`, 
            { cwd: REPO_ROOT, encoding: 'utf8' });
        
        const componentPaths = result.split('\n').filter(line => line.trim() && !line.includes('import'));
        return componentPaths;
    } catch (error) {
        console.error('Error finding imported components:', error.message);
        return [];
    }
}

// Get list of deleted files from git status
function getDeletedFiles() {
    try {
        const result = execSync('git status --porcelain | grep "^D" | sed "s/^D  //"', 
            { cwd: REPO_ROOT, encoding: 'utf8' });
        
        return result.split('\n').filter(line => line.trim());
    } catch (error) {
        console.error('Error getting deleted files:', error.message);
        return [];
    }
}

// Restore files that are actively imported
function restoreActivelyImportedFiles() {
    const componentPaths = findActivelyImportedComponents();
    const deletedFiles = getDeletedFiles();
    
    console.log('🔍 Found actively imported components:');
    componentPaths.slice(0, 10).forEach(comp => console.log(`  - ${comp}`));
    if (componentPaths.length > 10) {
        console.log(`  ... and ${componentPaths.length - 10} more`);
    }
    
    console.log(`\n📁 Found ${deletedFiles.length} deleted files`);
    
    const filesToRestore = [];
    
    // Match component paths to actual file paths
    for (const componentPath of componentPaths) {
        // Try different possible file extensions and paths
        const possiblePaths = [
            `src/components/${componentPath}.tsx`,
            `src/components/${componentPath}.ts`,
            `src/components/${componentPath}/index.tsx`,
            `src/components/${componentPath}/index.ts`,
        ];
        
        for (const possiblePath of possiblePaths) {
            if (deletedFiles.includes(possiblePath)) {
                filesToRestore.push(possiblePath);
                break;
            }
        }
    }
    
    console.log(`\n🔧 Restoring ${filesToRestore.length} actively imported files:`);
    
    if (filesToRestore.length > 0) {
        try {
            execSync(`git restore ${filesToRestore.join(' ')}`, { cwd: REPO_ROOT });
            filesToRestore.forEach(file => {
                console.log(`  ✓ Restored: ${file}`);
            });
        } catch (error) {
            console.error('Error restoring files:', error.message);
        }
    } else {
        console.log('  No actively imported files found among deleted files');
    }
    
    return filesToRestore;
}

// Main function
function main() {
    console.log('🔧 Restoring Actively Imported Components...\n');
    
    const restoredFiles = restoreActivelyImportedFiles();
    
    console.log(`\n✅ Restoration complete. Restored ${restoredFiles.length} files.`);
}

if (require.main === module) {
    main();
}

module.exports = { main };