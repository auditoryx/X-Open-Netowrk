#!/usr/bin/env node

/**
 * Phase 2B Performance Optimization Script
 * Analyzes bundle size and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Phase 2B Performance Optimization');
console.log('=====================================\n');

async function analyzeBundleSize() {
  console.log('📊 Analyzing bundle size...');
  
  try {
    // Check if .next build exists
    const nextDir = path.join(process.cwd(), '.next');
    if (!fs.existsSync(nextDir)) {
      console.log('❌ No build found. Running production build...');
      execSync('npm run build', { stdio: 'inherit' });
    }

    // Get build stats
    const buildManifest = path.join(nextDir, '.next-build-id');
    if (fs.existsSync(buildManifest)) {
      console.log('✅ Build found, analyzing...');
    }

    // Check current bundle sizes
    const staticDir = path.join(nextDir, 'static');
    if (fs.existsSync(staticDir)) {
      const chunks = fs.readdirSync(path.join(staticDir, 'chunks')).filter(f => f.endsWith('.js'));
      let totalSize = 0;
      
      console.log('\n📦 Current JavaScript Bundle Sizes:');
      chunks.forEach(chunk => {
        const filePath = path.join(staticDir, 'chunks', chunk);
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        totalSize += sizeKB;
        
        if (sizeKB > 100) {
          console.log(`  ⚠️  ${chunk}: ${sizeKB}KB (Large)`);
        } else {
          console.log(`  ✅ ${chunk}: ${sizeKB}KB`);
        }
      });
      
      console.log(`\n📊 Total bundle size: ${totalSize}KB`);
      console.log(`🎯 Target: <500KB`);
      
      if (totalSize > 500) {
        console.log('❌ Bundle size exceeds target. Optimizations needed.');
        return false;
      } else {
        console.log('✅ Bundle size within target.');
        return true;
      }
    }
  } catch (error) {
    console.error('❌ Error analyzing bundle:', error.message);
    return false;
  }
}

async function checkLighthouseReadiness() {
  console.log('\n🔍 Checking Lighthouse readiness...');
  
  const optimizations = [
    {
      name: 'next/image usage',
      check: () => {
        const appDir = path.join(process.cwd(), 'src/app');
        const files = getAllFiles(appDir, ['.tsx', '.jsx']);
        let nextImageUsage = 0;
        let regularImgUsage = 0;
        
        files.forEach(file => {
          const content = fs.readFileSync(file, 'utf8');
          nextImageUsage += (content.match(/import.*Image.*from.*['"]next\/image['"]/g) || []).length;
          regularImgUsage += (content.match(/<img\s/g) || []).length;
        });
        
        return {
          score: nextImageUsage > 0 && regularImgUsage === 0 ? 100 : Math.max(0, 100 - (regularImgUsage * 10)),
          details: `Next/Image: ${nextImageUsage}, Regular img: ${regularImgUsage}`
        };
      }
    },
    {
      name: 'Font optimization',
      check: () => {
        const layoutFile = path.join(process.cwd(), 'src/app/layout.tsx');
        if (fs.existsSync(layoutFile)) {
          const content = fs.readFileSync(layoutFile, 'utf8');
          const hasFontOptimization = content.includes('next/font') || content.includes('@fontsource');
          return {
            score: hasFontOptimization ? 100 : 0,
            details: hasFontOptimization ? 'Font optimization detected' : 'No font optimization found'
          };
        }
        return { score: 50, details: 'Layout file not found' };
      }
    },
    {
      name: 'Dynamic imports',
      check: () => {
        const appDir = path.join(process.cwd(), 'src/app');
        const files = getAllFiles(appDir, ['.tsx', '.jsx']);
        let dynamicImports = 0;
        
        files.forEach(file => {
          const content = fs.readFileSync(file, 'utf8');
          dynamicImports += (content.match(/dynamic\(/g) || []).length;
        });
        
        return {
          score: dynamicImports > 5 ? 100 : dynamicImports * 20,
          details: `Dynamic imports found: ${dynamicImports}`
        };
      }
    }
  ];

  console.log('\n🎯 Performance Optimization Checklist:');
  let totalScore = 0;
  
  optimizations.forEach(opt => {
    const result = opt.check();
    totalScore += result.score;
    const status = result.score >= 80 ? '✅' : result.score >= 50 ? '⚠️' : '❌';
    console.log(`  ${status} ${opt.name}: ${result.score}% (${result.details})`);
  });
  
  const avgScore = Math.round(totalScore / optimizations.length);
  console.log(`\n📊 Overall Performance Readiness: ${avgScore}%`);
  
  return avgScore >= 80;
}

function getAllFiles(dir, extensions) {
  let files = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  });
  
  return files;
}

async function generateOptimizationPlan() {
  console.log('\n📋 Phase 2B Optimization Plan:');
  console.log('==============================');
  
  const plan = [
    '1. ⚡ Bundle Size Optimization:',
    '   - Implement dynamic imports for heavy components',
    '   - Remove unused dependencies',
    '   - Split vendor chunks properly',
    '',
    '2. 🖼️ Image Optimization:',
    '   - Convert all <img> tags to next/image',
    '   - Implement WebP format delivery',
    '   - Add lazy loading for non-critical images',
    '',
    '3. 🔤 Font Optimization:',
    '   - Preload critical fonts',
    '   - Use font-display: swap',
    '   - Minimize font requests',
    '',
    '4. 📱 Core Web Vitals:',
    '   - Optimize Largest Contentful Paint (LCP)',
    '   - Reduce Cumulative Layout Shift (CLS)',
    '   - Improve First Input Delay (FID)',
    '',
    '5. 🗜️ Code Optimization:',
    '   - Tree shake unused code',
    '   - Minimize JavaScript execution',
    '   - Implement service worker caching'
  ];
  
  plan.forEach(line => console.log(line));
}

async function main() {
  const bundleOptimal = await analyzeBundleSize();
  const lighthouseReady = await checkLighthouseReadiness();
  
  if (bundleOptimal && lighthouseReady) {
    console.log('\n🎉 Phase 2B Performance: READY FOR LIGHTHOUSE TESTING');
  } else {
    console.log('\n⚠️ Performance optimizations needed before Lighthouse testing');
  }
  
  await generateOptimizationPlan();
  
  console.log('\n🔧 Next steps:');
  console.log('1. Run: npm run phase2b:performance');
  console.log('2. Implement optimizations based on analysis');
  console.log('3. Test with: npm run perf:audit');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { analyzeBundleSize, checkLighthouseReadiness };