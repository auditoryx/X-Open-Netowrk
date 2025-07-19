#!/usr/bin/env node

/**
 * Intelligent Re-wire & Safe-Delete Pass for Unused Components
 * 
 * This script implements the component cleanup requirements:
 * 1. Scans all Markdown files for component references
 * 2. Cross-references with unused components list
 * 3. Safely deletes components with zero references
 * 4. Identifies re-wire candidates
 * 5. Generates cleanup documentation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
 * Find all markdown files in the repository
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
                mdFiles.push(fullPath);
            }
        }
    }
    
    scanDirectory(REPO_ROOT);
    return mdFiles;
}

/**
 * Parse the unused components file to extract component information
 */
function parseUnusedComponents() {
    if (!fs.existsSync(UNUSED_COMPONENTS_FILE)) {
        console.error('UNUSED_COMPONENTS.md not found!');
        process.exit(1);
    }
    
    const content = fs.readFileSync(UNUSED_COMPONENTS_FILE, 'utf8');
    const components = [];
    
    // Parse components from the markdown
    const lines = content.split('\n');
    let currentSection = '';
    
    for (const line of lines) {
        if (line.startsWith('### ') || line.startsWith('#### ')) {
            currentSection = line.replace(/^#+\s*/, '').trim();
            continue;
        }
        
        // Look for component entries like "- **ComponentName**"
        const componentMatch = line.match(/^-\s*\*\*([^*]+)\*\*/);
        if (componentMatch) {
            const componentName = componentMatch[1].trim();
            
            // Look ahead for the Files line
            let files = [];
            let nextLineIndex = lines.indexOf(line) + 1;
            if (nextLineIndex < lines.length) {
                const nextLine = lines[nextLineIndex];
                const fileMatch = nextLine.match(/Files?:\s*([^\n]+)/);
                if (fileMatch) {
                    files = fileMatch[1].split(',').map(f => f.trim());
                }
            }
            
            components.push({
                name: componentName,
                files: files,
                section: currentSection,
                originalLine: line.trim()
            });
        }
    }
    
    return components;
}

/**
 * Scan all markdown files for references to components
 */
function scanMarkdownForReferences(components, mdFiles) {
    const references = new Map();
    
    // Initialize reference map
    for (const component of components) {
        references.set(component.name, {
            component,
            referencedInFiles: [],
            contexts: []
        });
    }
    
    console.log(`Scanning ${mdFiles.length} markdown files for component references...`);
    
    for (const mdFile of mdFiles) {
        try {
            const content = fs.readFileSync(mdFile, 'utf8');
            const relativePath = path.relative(REPO_ROOT, mdFile);
            
            // Skip audit files for reference checking (they list unused components by definition)
            if (relativePath.includes('docs/audit/')) {
                continue;
            }
            
            // Check each component for mentions
            for (const component of components) {
                const patterns = [
                    component.name,
                    component.name.toLowerCase(),
                    component.name.replace(/([A-Z])/g, '-$1').toLowerCase().substring(1), // kebab-case
                    component.name.replace(/([A-Z])/g, '_$1').toLowerCase().substring(1)  // snake_case
                ];
                
                for (const pattern of patterns) {
                    if (content.includes(pattern)) {
                        const ref = references.get(component.name);
                        if (!ref.referencedInFiles.includes(relativePath)) {
                            ref.referencedInFiles.push(relativePath);
                            
                            // Extract context around the reference
                            const lines = content.split('\n');
                            for (let i = 0; i < lines.length; i++) {
                                if (lines[i].includes(pattern)) {
                                    const context = lines.slice(Math.max(0, i-1), i+2).join('\n');
                                    ref.contexts.push({
                                        file: relativePath,
                                        lineNumber: i + 1,
                                        context: context,
                                        pattern: pattern
                                    });
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
 * Categorize components based on references
 */
function categorizeComponents(references) {
    const safeToDelete = [];
    const rewireCandidates = [];
    const needsReview = [];
    
    for (const [componentName, refData] of references) {
        const { component, referencedInFiles, contexts } = refData;
        
        if (referencedInFiles.length === 0) {
            safeToDelete.push(component);
        } else {
            // Components with references need further analysis
            const isDirectlyUsed = contexts.some(ctx => 
                ctx.context.includes('import') || 
                ctx.context.includes('component') ||
                ctx.context.includes('Component')
            );
            
            if (isDirectlyUsed) {
                rewireCandidates.push({
                    component,
                    references: referencedInFiles,
                    contexts: contexts,
                    reason: 'Referenced in documentation and may need re-integration'
                });
            } else {
                needsReview.push({
                    component,
                    references: referencedInFiles,
                    contexts: contexts,
                    reason: 'Mentioned in documentation but usage context unclear'
                });
            }
        }
    }
    
    return { safeToDelete, rewireCandidates, needsReview };
}

/**
 * Safely delete components that have zero references
 */
function performSafeDelete(safeToDelete) {
    const deletedFiles = [];
    
    console.log(`\nPerforming safe delete of ${safeToDelete.length} components...`);
    
    for (const component of safeToDelete) {
        console.log(`Deleting: ${component.name}`);
        
        for (const filePath of component.files) {
            const fullPath = path.join(REPO_ROOT, filePath);
            
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                    deletedFiles.push(filePath);
                    console.log(`  ✓ Deleted: ${filePath}`);
                } catch (error) {
                    console.error(`  ✗ Error deleting ${filePath}: ${error.message}`);
                }
            } else {
                console.log(`  ⚠ File not found: ${filePath}`);
            }
        }
    }
    
    return deletedFiles;
}

/**
 * Generate cleanup documentation
 */
function generateCleanupDocs(safeToDelete, rewireCandidates, needsReview, deletedFiles) {
    const timestamp = new Date().toISOString();
    
    // Generate DELETED_SAFE.md
    const deletedSafeContent = `# Safely Deleted Components

Generated on: ${timestamp}

## Summary

This document lists components that were safely deleted because they had zero references in both code and documentation.

**Total components deleted**: ${safeToDelete.length}
**Total files deleted**: ${deletedFiles.length}

## Deleted Components

${safeToDelete.map(component => `
### ${component.name}

- **Files**: ${component.files.join(', ')}
- **Section**: ${component.section}
- **Reason**: No references found in code or documentation

`).join('')}

## Deleted Files

${deletedFiles.map(file => `- \`${file}\``).join('\n')}

---

*Generated by: Intelligent Re-wire & Safe-Delete Pass*
`;

    // Generate REWIRED_COMPONENTS.md
    const rewiredContent = `# Re-wire Candidates

Generated on: ${timestamp}

## Summary

This document lists components that are unused in code but are mentioned in documentation. These components may need to be re-integrated or their logic extracted to shared utilities.

**Total re-wire candidates**: ${rewireCandidates.length}

## Components for Re-wiring

${rewireCandidates.map(item => `
### ${item.component.name}

- **Files**: ${item.component.files.join(', ')}
- **Section**: ${item.component.section}
- **Referenced In**: ${item.references.join(', ')}
- **Reason**: ${item.reason}

**Contexts**:
${item.contexts.map(ctx => `
- **${ctx.file}:${ctx.lineNumber}** (pattern: "${ctx.pattern}")
  \`\`\`
  ${ctx.context}
  \`\`\`
`).join('')}

`).join('')}

---

*Generated by: Intelligent Re-wire & Safe-Delete Pass*
`;

    // Generate REVIEW_NEEDED.md
    const reviewContent = `# Manual Review Required

Generated on: ${timestamp}

## Summary

This document lists components that require manual review due to ambiguous usage patterns or unclear documentation references.

**Total components needing review**: ${needsReview.length}

## Components for Manual Review

${needsReview.map(item => `
### ${item.component.name}

- **Files**: ${item.component.files.join(', ')}
- **Section**: ${item.component.section}
- **Referenced In**: ${item.references.join(', ')}
- **Reason**: ${item.reason}

**Contexts**:
${item.contexts.map(ctx => `
- **${ctx.file}:${ctx.lineNumber}** (pattern: "${ctx.pattern}")
  \`\`\`
  ${ctx.context}
  \`\`\`
`).join('')}

`).join('')}

---

*Generated by: Intelligent Re-wire & Safe-Delete Pass*
`;

    // Write files
    fs.writeFileSync(path.join(CLEANUP_DIR, 'DELETED_SAFE.md'), deletedSafeContent);
    fs.writeFileSync(path.join(CLEANUP_DIR, 'REWIRED_COMPONENTS.md'), rewiredContent);
    fs.writeFileSync(path.join(CLEANUP_DIR, 'REVIEW_NEEDED.md'), reviewContent);
    
    console.log('\n📄 Generated cleanup documentation:');
    console.log(`  ✓ docs/cleanup/DELETED_SAFE.md`);
    console.log(`  ✓ docs/cleanup/REWIRED_COMPONENTS.md`);
    console.log(`  ✓ docs/cleanup/REVIEW_NEEDED.md`);
}

/**
 * Main execution function
 */
function main() {
    console.log('🔍 Starting Intelligent Re-wire & Safe-Delete Pass...\n');
    
    try {
        // Step 1: Find all markdown files
        console.log('📑 Finding all Markdown files...');
        const mdFiles = findMarkdownFiles();
        console.log(`Found ${mdFiles.length} Markdown files`);
        
        // Step 2: Parse unused components
        console.log('\n🔍 Parsing unused components...');
        const components = parseUnusedComponents();
        console.log(`Found ${components.length} unused components`);
        
        // Step 3: Scan markdown for references
        console.log('\n🔗 Cross-referencing components with documentation...');
        const references = scanMarkdownForReferences(components, mdFiles);
        
        // Step 4: Categorize components
        console.log('\n📊 Categorizing components...');
        const { safeToDelete, rewireCandidates, needsReview } = categorizeComponents(references);
        
        console.log(`  ✅ Safe to delete: ${safeToDelete.length}`);
        console.log(`  🔧 Re-wire candidates: ${rewireCandidates.length}`);
        console.log(`  ⚠️  Need review: ${needsReview.length}`);
        
        // Step 5: Perform safe deletions
        if (safeToDelete.length > 0) {
            const deletedFiles = performSafeDelete(safeToDelete);
            
            // Step 6: Generate documentation
            console.log('\n📝 Generating cleanup documentation...');
            generateCleanupDocs(safeToDelete, rewireCandidates, needsReview, deletedFiles);
            
            console.log('\n✅ Cleanup completed successfully!');
            console.log(`\n📈 Summary:`);
            console.log(`  - Components deleted: ${safeToDelete.length}`);
            console.log(`  - Files deleted: ${deletedFiles.length}`);
            console.log(`  - Components for re-wiring: ${rewireCandidates.length}`);
            console.log(`  - Components needing review: ${needsReview.length}`);
        } else {
            console.log('\n✅ No components were safe to delete.');
            generateCleanupDocs(safeToDelete, rewireCandidates, needsReview, []);
        }
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { main, findMarkdownFiles, parseUnusedComponents, scanMarkdownForReferences };