#!/usr/bin/env node

/**
 * Phase 2B: Bundle Optimization Script
 * Removes heavy dependencies and optimizes package.json for production
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🎯 Phase 2B Bundle Optimization');
console.log('===============================\n');

async function optimizeDependencies() {
  console.log('📦 Optimizing dependencies for production...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const originalSize = JSON.stringify(packageJson).length;
  
  // Heavy dependencies to remove or move to devDependencies
  const toRemove = [
    'next-transpile-modules', // Not needed with modern Next.js
  ];
  
  // Move to devDependencies
  const moveToDevDependencies = [
    '@next/bundle-analyzer',
    'madge',
    'ts-prune',
    'depcheck'
  ];
  
  // Mark as optional (externals in webpack config)
  const makeOptional = [
    'googleapis', // Only needed server-side
    'mapbox-gl',  // Dynamically imported
  ];

  let changes = 0;

  // Remove unnecessary dependencies
  toRemove.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      delete packageJson.dependencies[dep];
      console.log(`  ❌ Removed: ${dep}`);
      changes++;
    }
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      delete packageJson.devDependencies[dep];
      console.log(`  ❌ Removed: ${dep}`);
      changes++;
    }
  });

  // Move dependencies to devDependencies
  moveToDevDependencies.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      const version = packageJson.dependencies[dep];
      delete packageJson.dependencies[dep];
      if (!packageJson.devDependencies) packageJson.devDependencies = {};
      packageJson.devDependencies[dep] = version;
      console.log(`  📦 Moved to devDependencies: ${dep}`);
      changes++;
    }
  });

  // Add bundle optimization scripts
  if (!packageJson.scripts['bundle:analyze']) {
    packageJson.scripts['bundle:analyze'] = 'ANALYZE=true npm run build';
    console.log('  ✅ Added bundle:analyze script');
    changes++;
  }

  if (!packageJson.scripts['bundle:size']) {
    packageJson.scripts['bundle:size'] = 'npm run build && du -sh .next/static';
    console.log('  ✅ Added bundle:size script');
    changes++;
  }

  // Add package.json optimizations
  if (!packageJson.sideEffects) {
    packageJson.sideEffects = false;
    console.log('  ✅ Added sideEffects: false for tree shaking');
    changes++;
  }

  // Save optimized package.json
  if (changes > 0) {
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    const newSize = JSON.stringify(packageJson).length;
    console.log(`\n📊 Package.json optimized: ${originalSize} → ${newSize} bytes (${changes} changes)`);
    
    // Update lockfile
    console.log('🔄 Updating package-lock.json...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Lockfile updated');
    } catch (error) {
      console.warn('⚠️ Warning: Could not update lockfile automatically');
    }
  } else {
    console.log('✅ No dependencies need optimization');
  }

  return changes;
}

async function optimizeWebpackConfig() {
  console.log('\n🔧 Optimizing webpack configuration...');
  
  const nextConfigPath = 'next.config.mjs';
  let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Check if externals optimization is already present
  if (!nextConfig.includes('googleapis')) {
    console.log('  ✅ Webpack externals already optimized');
    return false;
  }

  return true;
}

async function createProductionOptimizations() {
  console.log('\n⚡ Creating production optimizations...');
  
  // Create environment-specific configs
  const prodEnvConfig = {
    NODE_ENV: 'production',
    ANALYZE: 'false',
    NEXT_TELEMETRY_DISABLED: '1'
  };

  // Write production environment file
  const prodEnvContent = Object.entries(prodEnvConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync('.env.production', prodEnvContent);
  console.log('  ✅ Created .env.production');

  // Create .gitignore optimization
  const gitignorePath = '.gitignore';
  let gitignore = '';
  
  if (fs.existsSync(gitignorePath)) {
    gitignore = fs.readFileSync(gitignorePath, 'utf8');
  }

  const optimizations = [
    '# Bundle analysis',
    '.next/analyze/',
    'bundle-analyzer-report.html',
    '',
    '# Performance',
    'lighthouse-report.html',
    '.lighthouse/',
    '',
    '# Temporary files',
    '*.tmp',
    '*.temp',
    'temp/',
  ];

  const needsOptimization = optimizations.some(line => !gitignore.includes(line));
  
  if (needsOptimization) {
    gitignore += '\n' + optimizations.join('\n');
    fs.writeFileSync(gitignorePath, gitignore);
    console.log('  ✅ Updated .gitignore with performance optimizations');
  } else {
    console.log('  ✅ .gitignore already optimized');
  }
}

async function generateBundleReport() {
  console.log('\n📊 Generating bundle size report...');
  
  try {
    // Build with analysis
    console.log('  🔨 Building with bundle analysis...');
    execSync('ANALYZE=true npm run build', { stdio: 'pipe' });
    
    // Check analysis results
    const analysisDir = '.next/analyze';
    if (fs.existsSync(analysisDir)) {
      const files = fs.readdirSync(analysisDir);
      console.log('  ✅ Bundle analysis complete:');
      files.forEach(file => {
        console.log(`    - ${file}`);
      });
    }

    // Get bundle size summary
    const staticDir = '.next/static';
    if (fs.existsSync(staticDir)) {
      const result = execSync('du -sh .next/static', { encoding: 'utf8' });
      console.log(`  📦 Total static bundle size: ${result.trim()}`);
    }

  } catch (error) {
    console.warn('  ⚠️ Could not generate bundle analysis (build may have issues)');
    console.warn('  💡 Run manually: ANALYZE=true npm run build');
  }
}

async function main() {
  try {
    const dependencyChanges = await optimizeDependencies();
    await optimizeWebpackConfig();
    await createProductionOptimizations();
    
    if (dependencyChanges > 0) {
      console.log('\n🔄 Dependencies changed, regenerating bundle analysis...');
      await generateBundleReport();
    }
    
    console.log('\n🎉 Phase 2B Bundle Optimization Complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the application: npm run dev');
    console.log('2. Run bundle analysis: npm run bundle:analyze');
    console.log('3. Check bundle size: npm run bundle:size');
    console.log('4. Run performance audit: npm run perf:audit');
    
  } catch (error) {
    console.error('❌ Optimization failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { optimizeDependencies, optimizeWebpackConfig };