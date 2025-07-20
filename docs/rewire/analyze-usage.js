#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const babel = require('@babel/parser');

function findImports(content) {
  const imports = [];
  try {
    const ast = babel.parse(content, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
    for (const node of ast.program.body) {
      if (node.type === 'ImportDeclaration') {
        if (node.source?.value.startsWith('.') || node.source?.value.startsWith('@/')) {
          imports.push(node.source.value);
        }
      }
    }
  } catch (error) {
    // If parsing fails, return empty imports array
    console.warn(`Failed to parse imports in file: ${error.message}`);
  }
  return imports;
}

function findTsxTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findTsxTsFiles(itemPath, files);
    } else if (item.match(/\.(tsx?|jsx?)$/)) {
      files.push(itemPath);
    }
  }
  
  return files;
}

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Find imports using Babel parser
    const imports = findImports(content);
    
    // Find exports (simple heuristic)
    const exports = [];
    
    // Default export
    const defaultExportMatch = content.match(/export\s+default\s+(?:function\s+)?(\w+)/);
    if (defaultExportMatch) {
      exports.push({ name: defaultExportMatch[1], type: 'default' });
    }
    
    // Named exports
    const namedExportRegex = /export\s+(?:const|function|class|type|interface)\s+(\w+)/g;
    while ((match = namedExportRegex.exec(content)) !== null) {
      exports.push({ name: match[1], type: 'named' });
    }
    
    // Re-exports
    const reExportRegex = /export\s+{([^}]+)}\s+from/g;
    while ((match = reExportRegex.exec(content)) !== null) {
      const names = match[1].split(',').map(s => s.trim().split(' as ')[0].trim());
      names.forEach(name => exports.push({ name, type: 're-export' }));
    }
    
    return {
      path: relativePath,
      imports,
      exports
    };
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return null;
  }
}

function main() {
  console.log('Analyzing component usage...');
  
  const allFiles = [
    ...findTsxTsFiles('src'),
    ...findTsxTsFiles('components'),
    ...findTsxTsFiles('pages'),
    ...findTsxTsFiles('lib')
  ];
  
  console.log(`Found ${allFiles.length} TypeScript/JavaScript files`);
  
  const analysisResults = allFiles
    .map(analyzeFile)
    .filter(Boolean);
  
  // Build component name collision map
  const componentsByName = {};
  analysisResults.forEach(result => {
    result.exports.forEach(exp => {
      if (!componentsByName[exp.name]) {
        componentsByName[exp.name] = [];
      }
      componentsByName[exp.name].push({
        path: result.path,
        type: exp.type
      });
    });
  });
  
  // Find duplicates
  const duplicates = Object.entries(componentsByName)
    .filter(([name, locations]) => locations.length > 1)
    .reduce((acc, [name, locations]) => {
      acc[name] = locations;
      return acc;
    }, {});
  
  const results = {
    totalFiles: allFiles.length,
    analysisResults,
    componentsByName,
    duplicates,
    generatedAt: new Date().toISOString()
  };
  
  // Save results
  fs.writeFileSync('docs/rewire/usage-map.json', JSON.stringify(results, null, 2));
  
  console.log('Analysis complete!');
  console.log(`- Total files analyzed: ${analysisResults.length}`);
  console.log(`- Total components found: ${Object.keys(componentsByName).length}`);
  console.log(`- Components with name collisions: ${Object.keys(duplicates).length}`);
  
  return results;
}

if (require.main === module) {
  main();
}

module.exports = { main, analyzeFile };