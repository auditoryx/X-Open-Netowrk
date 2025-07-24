#!/usr/bin/env node

/**
 * Phase 2B: Dependency Analysis and Cleanup
 * Identifies unused dependencies and provides cleanup recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Phase 2B Dependency Cleanup');
console.log('===============================\n');

async function analyzeDependencies() {
  console.log('📊 Analyzing dependencies...');
  
  try {
    // Check if depcheck is installed
    try {
      execSync('npx depcheck --version', { stdio: 'pipe' });
    } catch {
      console.log('Installing depcheck...');
      execSync('npm install -g depcheck', { stdio: 'inherit' });
    }

    // Run dependency analysis
    console.log('🔍 Running dependency analysis...');
    const result = execSync('npx depcheck --json', { encoding: 'utf8' });
    const analysis = JSON.parse(result);

    // Analyze unused dependencies
    if (analysis.dependencies && analysis.dependencies.length > 0) {
      console.log('\n❌ Unused dependencies found:');
      analysis.dependencies.forEach(dep => {
        console.log(`  - ${dep}`);
      });
      
      // Calculate potential size savings
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const unusedSize = await estimatePackageSize(analysis.dependencies);
      console.log(`\n💾 Potential bundle size reduction: ~${unusedSize}KB`);
    } else {
      console.log('✅ No unused dependencies found');
    }

    // Analyze unused dev dependencies
    if (analysis.devDependencies && analysis.devDependencies.length > 0) {
      console.log('\n⚠️ Unused dev dependencies:');
      analysis.devDependencies.forEach(dep => {
        console.log(`  - ${dep}`);
      });
    }

    // Analyze missing dependencies
    if (analysis.missing && Object.keys(analysis.missing).length > 0) {
      console.log('\n🔴 Missing dependencies:');
      Object.entries(analysis.missing).forEach(([dep, files]) => {
        console.log(`  - ${dep} (used in ${files.length} files)`);
      });
    }

    return analysis;
  } catch (error) {
    console.error('❌ Error analyzing dependencies:', error.message);
    return null;
  }
}

async function estimatePackageSize(packages) {
  let totalSize = 0;
  
  for (const pkg of packages) {
    try {
      const nodeModulesPath = path.join('node_modules', pkg);
      if (fs.existsSync(nodeModulesPath)) {
        const size = await getFolderSize(nodeModulesPath);
        totalSize += size;
      }
    } catch (error) {
      // Ignore errors for individual packages
    }
  }
  
  return Math.round(totalSize / 1024); // Convert to KB
}

async function getFolderSize(folderPath) {
  let totalSize = 0;
  
  function walkSync(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile()) {
        totalSize += stat.size;
      } else if (stat.isDirectory()) {
        walkSync(filePath);
      }
    }
  }
  
  try {
    walkSync(folderPath);
  } catch (error) {
    // Ignore errors
  }
  
  return totalSize;
}

async function identifyHeavyDependencies() {
  console.log('\n📦 Analyzing heavy dependencies...');
  
  const heavyPackages = [
    'googleapis',
    'mapbox-gl',
    '@firebase/firestore',
    'react-icons',
    'chart.js',
    'leaflet',
    'pdf-lib',
    '@next/bundle-analyzer',
    'typescript',
    '@types/node',
    'next-transpile-modules'
  ];

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const foundHeavy = heavyPackages.filter(pkg => allDeps[pkg]);
  
  if (foundHeavy.length > 0) {
    console.log('\n⚠️ Heavy dependencies detected:');
    
    for (const pkg of foundHeavy) {
      const nodeModulesPath = path.join('node_modules', pkg);
      if (fs.existsSync(nodeModulesPath)) {
        const size = await getFolderSize(nodeModulesPath);
        const sizeKB = Math.round(size / 1024);
        console.log(`  - ${pkg}: ~${sizeKB}KB`);
      } else {
        console.log(`  - ${pkg}: (not installed)`);
      }
    }
  }

  return foundHeavy;
}

async function generateCleanupPlan(analysis, heavyDeps) {
  console.log('\n📋 Phase 2B Cleanup Plan:');
  console.log('=========================');
  
  const plan = [];
  
  if (analysis && analysis.dependencies && analysis.dependencies.length > 0) {
    plan.push('1. 🗑️ Remove unused dependencies:');
    plan.push(`   npm uninstall ${analysis.dependencies.join(' ')}`);
    plan.push('');
  }

  if (heavyDeps.length > 0) {
    plan.push('2. ⚡ Optimize heavy dependencies:');
    
    heavyDeps.forEach(dep => {
      switch (dep) {
        case 'googleapis':
          plan.push('   - Consider using specific Google API packages instead of full googleapis');
          plan.push('   - Move to server-side only if possible');
          break;
        case 'mapbox-gl':
          plan.push('   - Implement dynamic import for map components');
          plan.push('   - Consider lighter alternatives like Leaflet for simple use cases');
          break;
        case 'react-icons':
          plan.push('   - Import only specific icons instead of the entire library');
          plan.push('   - Consider switching to lucide-react (already installed)');
          break;
        case 'chart.js':
          plan.push('   - Implement dynamic import for chart components');
          plan.push('   - Consider recharts as a lighter alternative');
          break;
        case '@next/bundle-analyzer':
          plan.push('   - Move to devDependencies (build tool only)');
          break;
        default:
          plan.push(`   - Review usage of ${dep} and consider alternatives`);
      }
    });
    plan.push('');
  }

  plan.push('3. 🎯 Bundle optimization strategies:');
  plan.push('   - Implement dynamic imports for feature-flagged components');
  plan.push('   - Use tree shaking for large libraries');
  plan.push('   - Move heavy processing to server-side APIs');
  plan.push('   - Consider CDN for large static assets');
  plan.push('');

  plan.push('4. 📱 Runtime optimizations:');
  plan.push('   - Lazy load non-critical components');
  plan.push('   - Implement progressive loading for heavy features');
  plan.push('   - Use service worker for caching strategies');
  
  plan.forEach(line => console.log(line));

  return plan;
}

async function executeAutomaticCleanup(analysis) {
  if (!analysis || !analysis.dependencies || analysis.dependencies.length === 0) {
    console.log('\n✅ No automatic cleanup needed');
    return;
  }

  console.log('\n🔧 Executing automatic cleanup...');
  
  // Create a safe list of packages that should NOT be auto-removed
  const safeList = [
    'react',
    'react-dom',
    'next',
    'firebase',
    'stripe',
    'zod',
    '@firebase/firestore'
  ];

  const safeToRemove = analysis.dependencies.filter(dep => 
    !safeList.some(safe => dep.includes(safe))
  );

  if (safeToRemove.length > 0) {
    console.log('📦 Safe to remove:');
    safeToRemove.forEach(dep => console.log(`  - ${dep}`));
    
    try {
      console.log('\n🗑️ Removing unused dependencies...');
      execSync(`npm uninstall ${safeToRemove.join(' ')}`, { stdio: 'inherit' });
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Error during cleanup:', error.message);
    }
  } else {
    console.log('⚠️ No dependencies safe for automatic removal');
  }
}

async function main() {
  const analysis = await analyzeDependencies();
  const heavyDeps = await identifyHeavyDependencies();
  
  await generateCleanupPlan(analysis, heavyDeps);
  
  // Only perform automatic cleanup in CI or with explicit flag
  if (process.env.CI || process.argv.includes('--auto-cleanup')) {
    await executeAutomaticCleanup(analysis);
  } else {
    console.log('\n💡 To perform automatic cleanup, run with --auto-cleanup flag');
  }
  
  console.log('\n🔧 Next steps:');
  console.log('1. Review the cleanup plan above');
  console.log('2. Test the application after removing dependencies');
  console.log('3. Run bundle analysis: npm run analyze:bundle');
  console.log('4. Verify bundle size reduction');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { analyzeDependencies, identifyHeavyDependencies };