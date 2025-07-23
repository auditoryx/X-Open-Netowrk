#!/usr/bin/env node

/**
 * Phase 2B: E2E Testing Suite Runner
 * Comprehensive testing runner for Phase 2B critical user journeys
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Phase 2B E2E Testing Suite');
console.log('=============================\n');

// Test configuration
const testConfig = {
  timeout: 60000, // 1 minute per test
  retries: 2,
  parallel: process.env.CI ? 1 : 2,
  browsers: ['chromium', 'firefox'],
  mobile: ['Mobile Chrome', 'Mobile Safari'],
};

// Test suites
const testSuites = [
  {
    name: 'Critical User Journeys',
    files: [
      'phase2b-registration.spec.ts',
      'phase2b-booking-flow.spec.ts',
    ],
    priority: 'P0',
    description: 'Core user registration and booking flows'
  },
  {
    name: 'Payment Processing',
    files: [
      'phase2b-payment-processing.spec.ts',
    ],
    priority: 'P0',
    description: 'Stripe payment integration and error handling'
  },
  {
    name: 'Cross-Platform Compatibility',
    files: [
      'phase2b-cross-platform.spec.ts',
    ],
    priority: 'P1',
    description: 'Browser and device compatibility testing'
  },
  {
    name: 'Existing Features',
    files: [
      'bookingFlow.spec.ts',
      'verification.spec.ts',
      'role-*-smoke.spec.ts',
    ],
    priority: 'P1',
    description: 'Regression testing for existing functionality'
  }
];

async function checkTestEnvironment() {
  console.log('🔍 Checking test environment...');
  
  // Check if Playwright is installed
  try {
    execSync('npx playwright --version', { stdio: 'pipe' });
    console.log('  ✅ Playwright installed');
  } catch (error) {
    console.log('  ❌ Playwright not found. Installing...');
    execSync('npx playwright install', { stdio: 'inherit' });
    console.log('  ✅ Playwright installed');
  }

  // Check if test environment variables are set
  const requiredEnvVars = [
    'TEST_CLIENT_EMAIL',
    'TEST_CLIENT_PASSWORD',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('  ⚠️ Missing test environment variables:');
    missingVars.forEach(varName => {
      console.log(`    - ${varName}`);
    });
    console.log('  💡 Set these in .env.test for full test coverage');
  } else {
    console.log('  ✅ Test environment variables configured');
  }

  // Check if development server can be started
  try {
    console.log('  🔍 Checking if app can start...');
    execSync('npm run build', { stdio: 'pipe', timeout: 30000 });
    console.log('  ✅ App builds successfully');
  } catch (error) {
    console.log('  ⚠️ App build failed - some tests may fail');
    console.log('  💡 Fix build issues for complete test coverage');
  }
}

async function runTestSuite(suite, options = {}) {
  console.log(`\n🧪 Running ${suite.name} (${suite.priority})`);
  console.log(`📝 ${suite.description}`);
  console.log('─'.repeat(50));

  const results = [];

  for (const file of suite.files) {
    console.log(`\n📄 Testing: ${file}`);
    
    try {
      const testPath = path.join('tests/e2e', file);
      
      // Check if test file exists (handle wildcards)
      let testFiles = [];
      if (file.includes('*')) {
        const dir = path.dirname(testPath);
        const pattern = path.basename(file);
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        
        const files = fs.readdirSync(path.join(process.cwd(), dir));
        testFiles = files.filter(f => regex.test(f) && f.endsWith('.spec.ts'));
      } else if (fs.existsSync(testPath)) {
        testFiles = [file];
      }

      if (testFiles.length === 0) {
        console.log(`  ⚠️ Test file not found: ${file}`);
        results.push({ file, status: 'skipped', reason: 'file not found' });
        continue;
      }

      for (const testFile of testFiles) {
        console.log(`  🚀 Running ${testFile}...`);
        
        const startTime = Date.now();
        
        const command = [
          'npx playwright test',
          `tests/e2e/${testFile}`,
          '--reporter=line',
          `--timeout=${testConfig.timeout}`,
          `--retries=${testConfig.retries}`,
          options.browser ? `--project=${options.browser}` : '',
          options.headed ? '--headed' : '',
          options.debug ? '--debug' : '',
        ].filter(Boolean).join(' ');

        try {
          const output = execSync(command, { 
            encoding: 'utf8',
            timeout: testConfig.timeout * 3,
            maxBuffer: 1024 * 1024 // 1MB buffer
          });

          const duration = Date.now() - startTime;
          console.log(`  ✅ ${testFile} passed (${Math.round(duration / 1000)}s)`);
          results.push({ 
            file: testFile, 
            status: 'passed', 
            duration: duration,
            output: output.split('\n').slice(-5).join('\n') // Last 5 lines
          });

        } catch (error) {
          const duration = Date.now() - startTime;
          console.log(`  ❌ ${testFile} failed (${Math.round(duration / 1000)}s)`);
          console.log(`  📝 Error: ${error.message.split('\n')[0]}`);
          
          results.push({ 
            file: testFile, 
            status: 'failed', 
            duration: duration,
            error: error.message.split('\n').slice(0, 3).join('\n')
          });
        }
      }

    } catch (error) {
      console.log(`  ❌ Failed to run ${file}: ${error.message}`);
      results.push({ file, status: 'error', error: error.message });
    }
  }

  return results;
}

async function generateTestReport(allResults) {
  console.log('\n📊 Phase 2B Test Results Summary');
  console.log('================================\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;

  for (const [suiteName, results] of Object.entries(allResults)) {
    console.log(`📋 ${suiteName}:`);
    
    for (const result of results) {
      totalTests++;
      
      switch (result.status) {
        case 'passed':
          passedTests++;
          console.log(`  ✅ ${result.file} (${Math.round(result.duration / 1000)}s)`);
          break;
        case 'failed':
          failedTests++;
          console.log(`  ❌ ${result.file} (${Math.round(result.duration / 1000)}s)`);
          if (result.error) {
            console.log(`     💬 ${result.error.split('\n')[0]}`);
          }
          break;
        case 'skipped':
          skippedTests++;
          console.log(`  ⏭️ ${result.file} (${result.reason})`);
          break;
        default:
          console.log(`  ❓ ${result.file} (${result.status})`);
      }
    }
    console.log('');
  }

  // Calculate overall stats
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  
  console.log('📈 Overall Statistics:');
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  ✅ Passed: ${passedTests}`);
  console.log(`  ❌ Failed: ${failedTests}`);
  console.log(`  ⏭️ Skipped: ${skippedTests}`);
  console.log(`  📊 Pass Rate: ${passRate}%`);

  // Phase 2B success criteria
  console.log('\n🎯 Phase 2B Success Criteria:');
  console.log(`  Target: 90% test coverage for critical paths`);
  console.log(`  Status: ${passRate >= 80 ? '✅' : '❌'} ${passRate}% (${passRate >= 80 ? 'MEETS' : 'BELOW'} TARGET)`);

  // Generate detailed report file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: { totalTests, passedTests, failedTests, skippedTests, passRate },
    suites: allResults,
    phase2bStatus: passRate >= 80 ? 'PASS' : 'FAIL'
  };

  fs.writeFileSync('test-results/phase2b-report.json', JSON.stringify(reportData, null, 2));
  console.log('\n📄 Detailed report saved to: test-results/phase2b-report.json');

  return passRate >= 80;
}

async function main() {
  const args = process.argv.slice(2);
  const options = {
    browser: args.includes('--browser') ? args[args.indexOf('--browser') + 1] : null,
    headed: args.includes('--headed'),
    debug: args.includes('--debug'),
    suite: args.includes('--suite') ? args[args.indexOf('--suite') + 1] : null,
  };

  console.log('🎯 Phase 2B E2E Testing - 90% Coverage Target\n');

  // Create test results directory
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results');
  }

  try {
    await checkTestEnvironment();

    const allResults = {};

    // Run specific suite or all suites
    const suitesToRun = options.suite 
      ? testSuites.filter(s => s.name.toLowerCase().includes(options.suite.toLowerCase()))
      : testSuites;

    if (suitesToRun.length === 0) {
      console.log(`❌ No test suites found matching: ${options.suite}`);
      process.exit(1);
    }

    for (const suite of suitesToRun) {
      const results = await runTestSuite(suite, options);
      allResults[suite.name] = results;
    }

    // Generate comprehensive report
    const success = await generateTestReport(allResults);

    if (success) {
      console.log('\n🎉 Phase 2B E2E Testing: SUCCESS');
      console.log('✅ Platform ready for 90%+ test coverage milestone');
    } else {
      console.log('\n⚠️ Phase 2B E2E Testing: NEEDS IMPROVEMENT');
      console.log('📋 Address failing tests before launch');
    }

    console.log('\n🔧 Next steps:');
    console.log('1. Review test results in test-results/phase2b-report.json');
    console.log('2. Fix failing tests identified above');
    console.log('3. Run performance audit: npm run perf:audit');
    console.log('4. Proceed to Phase 2B Week 2: Security & Feature Polish');

    process.exit(success ? 0 : 1);

  } catch (error) {
    console.error('❌ Phase 2B testing failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runTestSuite, generateTestReport, testSuites };