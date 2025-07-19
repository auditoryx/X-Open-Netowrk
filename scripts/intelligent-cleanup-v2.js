#!/usr/bin/env node

/**
 * Intelligent Re-wire & Safe-Delete Pass for Unused Components v2
 * 
 * This script implements a refined approach to component cleanup:
 * 1. Identifies truly unused files based on audit findings
 * 2. Cross-references with actual documentation (not audit files)
 * 3. Safely deletes components that are completely unused
 * 4. Categorizes others for manual review or re-wiring
 */

const fs = require('fs');
const path = require('path');

// Configuration
const REPO_ROOT = process.cwd();
const AUDIT_DIR = path.join(REPO_ROOT, 'docs', 'audit');
const CLEANUP_DIR = path.join(REPO_ROOT, 'docs', 'cleanup');
const UNUSED_COMPONENTS_FILE = path.join(AUDIT_DIR, 'UNUSED_COMPONENTS.md');

// Ensure cleanup directory exists
if (!fs.existsSync(CLEANUP_DIR)) {
    fs.mkdirSync(CLEANUP_DIR, { recursive: true });
}

/**
 * Find all markdown files in the repository excluding audit and cleanup files
 */
function findMarkdownFiles() {
    const mdFiles = [];
    
    function scanDirectory(dir) {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                // Skip certain directories
                if (['node_modules', '.git', '.next', 'dist', 'build'].includes(item)) {
                    continue;
                }
                scanDirectory(fullPath);
            } else if (item.endsWith('.md')) {
                const relativePath = path.relative(REPO_ROOT, fullPath);
                // Skip audit and cleanup files - they list unused components by definition
                if (!relativePath.includes('docs/audit/') && !relativePath.includes('docs/cleanup/')) {
                    mdFiles.push(fullPath);
                }
            }
        }
    }
    
    scanDirectory(REPO_ROOT);
    return mdFiles;
}

/**
 * Parse unused components file and extract file paths that are truly unused
 */
function extractUnusedFiles() {
    if (!fs.existsSync(UNUSED_COMPONENTS_FILE)) {
        console.error('UNUSED_COMPONENTS.md not found!');
        process.exit(1);
    }
    
    const content = fs.readFileSync(UNUSED_COMPONENTS_FILE, 'utf8');
    const unusedFiles = new Set();
    const componentInfo = [];
    
    // Look for specific sections that list fully unused files
    const lines = content.split('\n');
    let currentSection = '';
    let inUnusedFilesSection = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.startsWith('### ') || line.startsWith('#### ')) {
            currentSection = line.replace(/^#+\s*/, '').trim();
            inUnusedFilesSection = currentSection.includes('Fully Unused Component Files');
            continue;
        }
        
        // Look for fully unused files in the specific section
        if (inUnusedFilesSection) {
            const fileMatch = line.match(/^\s*-\s*\*\*`([^`]+)`\*\*/);
            if (fileMatch) {
                const filePath = fileMatch[1];
                unusedFiles.add(filePath);
                
                // Look for export information in the next few lines
                let exports = [];
                for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
                    const exportMatch = lines[j].match(/Exports:\s*(.+)/);
                    if (exportMatch) {
                        exports = exportMatch[1].split(',').map(e => e.trim());
                        break;
                    }
                    if (lines[j].trim() === '' || lines[j].startsWith('- **')) {
                        break;
                    }
                }
                
                componentInfo.push({
                    filePath,
                    exports,
                    reason: 'All exports unused'
                });
            }
        }
        
        // Also look for component entries with file paths
        const componentMatch = line.match(/^-\s*\*\*([^*]+)\*\*/);
        if (componentMatch) {
            const componentName = componentMatch[1].trim();
            
            // Look ahead for the Files line
            for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                const fileMatch = lines[j].match(/Files?:\s*([^\n]+)/);
                if (fileMatch) {
                    const files = fileMatch[1].split(',').map(f => f.trim());
                    for (const file of files) {
                        if (file && !file.includes('Status:')) {
                            componentInfo.push({
                                componentName,
                                filePath: file,
                                exports: [componentName],
                                reason: 'Component unused',
                                section: currentSection
                            });
                        }
                    }
                    break;
                }
            }
        }
    }
    
    return { unusedFiles: Array.from(unusedFiles), componentInfo };
}

/**
 * Check if any of the files/components are referenced in actual documentation
 */
function checkDocumentationReferences(componentInfo, mdFiles) {
    console.log(`Scanning ${mdFiles.length} documentation files for references...`);
    
    const references = new Map();
    
    // Initialize reference tracking
    for (const info of componentInfo) {
        const key = info.componentName || path.basename(info.filePath, path.extname(info.filePath));
        if (!references.has(key)) {
            references.set(key, {
                info,
                referencedInFiles: [],
                contexts: []
            });
        }
    }
    
    // Scan markdown files
    for (const mdFile of mdFiles) {
        try {
            const content = fs.readFileSync(mdFile, 'utf8');
            const relativePath = path.relative(REPO_ROOT, mdFile);
            
            for (const [key, refData] of references) {
                const patterns = [
                    key,
                    key.toLowerCase(),
                    key.replace(/([A-Z])/g, '-$1').toLowerCase().substring(1), // kebab-case
                    key.replace(/([A-Z])/g, '_$1').toLowerCase().substring(1)  // snake_case
                ];
                
                for (const pattern of patterns) {
                    if (content.toLowerCase().includes(pattern.toLowerCase())) {
                        if (!refData.referencedInFiles.includes(relativePath)) {
                            refData.referencedInFiles.push(relativePath);
                            
                            // Extract context
                            const lines = content.split('\n');
                            for (let i = 0; i < lines.length; i++) {
                                if (lines[i].toLowerCase().includes(pattern.toLowerCase())) {
                                    const context = lines.slice(Math.max(0, i-1), i+2).join('\n');
                                    refData.contexts.push({
                                        file: relativePath,
                                        lineNumber: i + 1,
                                        context: context.substring(0, 200) + (context.length > 200 ? '...' : '')
                                    });
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }
            }
        } catch (error) {
            console.warn(`Warning: Could not read ${mdFile}: ${error.message}`);
        }
    }
    
    return references;
}

/**
 * Categorize files for different cleanup actions
 */
function categorizeForCleanup(references) {
    const safeToDelete = [];
    const rewireCandidates = [];
    const needsReview = [];
    
    for (const [key, refData] of references) {
        const { info, referencedInFiles, contexts } = refData;
        
        if (referencedInFiles.length === 0) {
            // No documentation references - safe to delete
            safeToDelete.push(info);
        } else {
            // Has documentation references - needs analysis
            const hasImportContext = contexts.some(ctx => 
                ctx.context.toLowerCase().includes('import') || 
                ctx.context.toLowerCase().includes('component') ||
                ctx.context.toLowerCase().includes('use ')
            );
            
            if (hasImportContext) {
                rewireCandidates.push({
                    ...info,
                    references: referencedInFiles,
                    contexts,
                    reason: 'Referenced in documentation with import/usage context'
                });
            } else {
                needsReview.push({
                    ...info,
                    references: referencedInFiles,
                    contexts,
                    reason: 'Mentioned in documentation but context unclear'
                });
            }
        }
    }
    
    return { safeToDelete, rewireCandidates, needsReview };
}

/**
 * Safely delete files that have no references
 */
function performSafeDelete(safeToDelete, dryRun = false) {
    const deletedFiles = [];
    
    console.log(`\n${dryRun ? 'DRY RUN - Would delete' : 'Deleting'} ${safeToDelete.length} unused files...`);
    
    for (const fileInfo of safeToDelete) {
        const filePath = fileInfo.filePath;
        if (!filePath) continue;
        
        const fullPath = path.join(REPO_ROOT, filePath);
        
        if (fs.existsSync(fullPath)) {
            try {
                if (!dryRun) {
                    fs.unlinkSync(fullPath);
                }
                deletedFiles.push(filePath);
                console.log(`  ${dryRun ? 'Would delete' : 'Deleted'}: ${filePath}`);
            } catch (error) {
                console.error(`  ✗ Error ${dryRun ? 'checking' : 'deleting'} ${filePath}: ${error.message}`);
            }
        } else {
            console.log(`  ⚠ File not found: ${filePath}`);
        }
    }
    
    return deletedFiles;
}

/**
 * Generate comprehensive cleanup documentation
 */
function generateCleanupDocs(safeToDelete, rewireCandidates, needsReview, deletedFiles) {
    const timestamp = new Date().toISOString();
    
    // Generate DELETED_SAFE.md
    const deletedSafeContent = `# Safely Deleted Components

Generated on: ${timestamp}

## Summary

This document lists components and files that were safely deleted because they had zero references in both code and documentation (excluding audit files).

**Total files deleted**: ${deletedFiles.length}
**Components/functions removed**: ${safeToDelete.length}

## Deletion Criteria

Files were considered safe to delete if:
1. Listed as unused in the audit report
2. No references found in any documentation files
3. No import statements or usage examples in docs

## Deleted Files

${deletedFiles.map(file => `- \`${file}\``).join('\n') || 'No files deleted'}

## Deleted Components/Functions

${safeToDelete.map(item => `
### ${item.componentName || path.basename(item.filePath, path.extname(item.filePath))}

- **File**: \`${item.filePath}\`
- **Exports**: ${item.exports.join(', ') || 'Unknown'}
- **Reason**: ${item.reason}

`).join('') || 'No components deleted'}

---

*Generated by: Intelligent Re-wire & Safe-Delete Pass v2*
`;

    // Generate REWIRED_COMPONENTS.md  
    const rewiredContent = `# Re-wire Candidates

Generated on: ${timestamp}

## Summary

This document lists components that are unused in code but are mentioned in documentation with clear usage context. These should be re-integrated into the codebase or their documentation updated.

**Total re-wire candidates**: ${rewireCandidates.length}

## Re-wiring Strategy

These components fall into categories:
1. **Import Examples**: Components shown in import statements in docs
2. **Usage Examples**: Components with usage examples in documentation  
3. **Feature References**: Components mentioned as part of feature descriptions

## Components for Re-wiring

${rewireCandidates.map(item => `
### ${item.componentName || path.basename(item.filePath, path.extname(item.filePath))}

- **File**: \`${item.filePath}\`
- **Exports**: ${item.exports.join(', ') || 'Unknown'}
- **Referenced In**: ${item.references.join(', ')}
- **Reason**: ${item.reason}

**Documentation References**:
${item.contexts.map(ctx => `
- **${ctx.file}:${ctx.lineNumber}**
  \`\`\`
  ${ctx.context}
  \`\`\`
`).join('')}

`).join('')}

---

*Generated by: Intelligent Re-wire & Safe-Delete Pass v2*
`;

    // Generate REVIEW_NEEDED.md
    const reviewContent = `# Manual Review Required

Generated on: ${timestamp}

## Summary

This document lists components that require manual review due to ambiguous documentation references or unclear usage patterns.

**Total components needing review**: ${needsReview.length}

## Review Guidelines

Consider these questions for each component:
1. Is this component actually needed for documented features?
2. Should the documentation be updated to remove outdated references?
3. Can this component be safely deleted or does it need re-integration?

## Components for Manual Review

${needsReview.map(item => `
### ${item.componentName || path.basename(item.filePath, path.extname(item.filePath))}

- **File**: \`${item.filePath}\`
- **Exports**: ${item.exports.join(', ') || 'Unknown'}
- **Referenced In**: ${item.references.join(', ')}
- **Reason**: ${item.reason}

**Documentation Context**:
${item.contexts.map(ctx => `
- **${ctx.file}:${ctx.lineNumber}**
  \`\`\`
  ${ctx.context}
  \`\`\`
`).join('')}

`).join('')}

---

*Generated by: Intelligent Re-wire & Safe-Delete Pass v2*
`;

    // Write files
    fs.writeFileSync(path.join(CLEANUP_DIR, 'DELETED_SAFE.md'), deletedSafeContent);
    fs.writeFileSync(path.join(CLEANUP_DIR, 'REWIRED_COMPONENTS.md'), rewiredContent);
    fs.writeFileSync(path.join(CLEANUP_DIR, 'REVIEW_NEEDED.md'), reviewContent);
}

/**
 * Main execution function
 */
function main() {
    console.log('🔍 Starting Intelligent Re-wire & Safe-Delete Pass v2...\n');
    
    try {
        // Step 1: Find documentation files (excluding audit files)
        console.log('📑 Finding documentation files...');
        const mdFiles = findMarkdownFiles();
        console.log(`Found ${mdFiles.length} documentation files (excluding audit files)`);
        
        // Step 2: Extract unused files from audit
        console.log('\n🔍 Extracting unused components from audit...');
        const { unusedFiles, componentInfo } = extractUnusedFiles();
        console.log(`Found ${componentInfo.length} unused components/files`);
        
        // Step 3: Check for documentation references
        console.log('\n🔗 Checking documentation references...');
        const references = checkDocumentationReferences(componentInfo, mdFiles);
        
        // Step 4: Categorize for cleanup
        console.log('\n📊 Categorizing components for cleanup...');
        const { safeToDelete, rewireCandidates, needsReview } = categorizeForCleanup(references);
        
        console.log(`  ✅ Safe to delete: ${safeToDelete.length}`);
        console.log(`  🔧 Re-wire candidates: ${rewireCandidates.length}`);
        console.log(`  ⚠️  Need review: ${needsReview.length}`);
        
        // Step 5: Perform safe deletions (dry run first)
        console.log('\n🔍 Performing dry run...');
        const wouldDelete = performSafeDelete(safeToDelete, true);
        
        if (wouldDelete.length > 0 && safeToDelete.length > 0) {
            console.log('\n⚡ Performing actual deletions...');
            const deletedFiles = performSafeDelete(safeToDelete, false);
            
            // Step 6: Generate documentation
            console.log('\n📝 Generating cleanup documentation...');
            generateCleanupDocs(safeToDelete, rewireCandidates, needsReview, deletedFiles);
            
            console.log('\n✅ Cleanup completed successfully!');
            console.log(`\n📈 Summary:`);
            console.log(`  - Files deleted: ${deletedFiles.length}`);
            console.log(`  - Components for re-wiring: ${rewireCandidates.length}`);
            console.log(`  - Components needing review: ${needsReview.length}`);
        } else {
            console.log('\n✅ No files were safe to delete.');
            generateCleanupDocs(safeToDelete, rewireCandidates, needsReview, []);
        }
        
        console.log('\n📄 Generated cleanup documentation:');
        console.log(`  ✓ docs/cleanup/DELETED_SAFE.md`);
        console.log(`  ✓ docs/cleanup/REWIRED_COMPONENTS.md`);
        console.log(`  ✓ docs/cleanup/REVIEW_NEEDED.md`);
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { main };