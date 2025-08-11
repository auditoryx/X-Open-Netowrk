#!/usr/bin/env node

/**
 * Rate Limiting Test Script
 * 
 * This script tests the rate limiting functionality by making multiple requests
 * to different API endpoints and observing the rate limiting behavior.
 */

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function makeRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': options.userAgent || 'rate-limit-test-script/1.0',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    
    const rateLimitHeaders = {
      limit: response.headers.get('x-ratelimit-limit'),
      remaining: response.headers.get('x-ratelimit-remaining'),
      reset: response.headers.get('x-ratelimit-reset'),
      retryAfter: response.headers.get('retry-after')
    };
    
    let responseBody;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = await response.text();
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      headers: rateLimitHeaders,
      body: responseBody,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function testRateLimit(endpoint, maxRequests = 25, delayMs = 100) {
  console.log(`\n🧪 Testing rate limiting for ${endpoint}`);
  console.log(`Making ${maxRequests} requests with ${delayMs}ms delay...\n`);
  
  const results = [];
  
  for (let i = 1; i <= maxRequests; i++) {
    const result = await makeRequest(endpoint, {
      headers: {
        'X-Test-Request': i.toString()
      }
    });
    
    results.push(result);
    
    const status = result.status || 'ERROR';
    const remaining = result.headers?.remaining || 'N/A';
    const retryAfter = result.headers?.retryAfter || '';
    
    console.log(`Request ${i.toString().padStart(2, '0')}: ${status} | Remaining: ${remaining} ${retryAfter ? `| Retry-After: ${retryAfter}s` : ''}`);
    
    if (result.status === 429) {
      console.log(`   ⚠️  Rate limited! ${result.body?.error || ''}`);
    }
    
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

async function testDifferentEndpoints() {
  console.log('🚀 Starting Rate Limiting Tests');
  console.log('=====================================');
  
  // Test different endpoint types
  const endpoints = [
    { path: '/api/test-rate-limit', name: 'General API', limit: 20 },
    { path: '/api/auth/session', name: 'Auth Endpoint', limit: 5 },
    { path: '/api/monitoring', name: 'Monitoring API', limit: 20 }
  ];
  
  for (const endpoint of endpoints) {
    await testRateLimit(endpoint.path, endpoint.limit + 5);
    console.log('\n' + '='.repeat(50) + '\n');
  }
}

async function testSuspiciousUserAgent() {
  console.log('🕷️  Testing DDoS Protection - Suspicious User Agent');
  console.log('====================================================');
  
  const suspiciousAgents = [
    'python-requests/2.25.1',
    'curl/7.68.0',
    'wget/1.20.3',
    'bot-scraper/1.0',
    'scanner-tool'
  ];
  
  for (const userAgent of suspiciousAgents) {
    console.log(`\nTesting with User-Agent: ${userAgent}`);
    
    const result = await makeRequest('/api/test-rate-limit', {
      userAgent
    });
    
    console.log(`Status: ${result.status} | Response: ${JSON.stringify(result.body)}`);
  }
}

async function testBurstRequests() {
  console.log('💥 Testing Burst Protection');
  console.log('============================');
  
  console.log('Making 10 rapid requests (no delay)...');
  
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(makeRequest('/api/test-rate-limit', {
      headers: { 'X-Burst-Test': i.toString() }
    }));
  }
  
  const results = await Promise.all(promises);
  
  results.forEach((result, index) => {
    const status = result.status || 'ERROR';
    console.log(`Burst Request ${index + 1}: ${status}`);
  });
}

async function testMonitoringEndpoint() {
  console.log('📊 Testing Monitoring Endpoint');
  console.log('==============================');
  
  const endpoints = [
    '/api/monitoring?action=health',
    '/api/monitoring?action=metrics',
    '/api/monitoring?action=events&limit=5'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\nTesting: ${endpoint}`);
    
    const result = await makeRequest(endpoint);
    
    console.log(`Status: ${result.status}`);
    if (result.body && typeof result.body === 'object') {
      console.log(`Response keys: ${Object.keys(result.body).join(', ')}`);
    }
  }
}

async function main() {
  console.log(`Testing against: ${baseUrl}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  try {
    // Test health endpoint first
    console.log('\n🏥 Testing server health...');
    const healthResult = await makeRequest('/api/monitoring?action=health');
    
    if (healthResult.error) {
      console.error('❌ Server not accessible:', healthResult.error);
      console.log('Make sure the development server is running with: npm run dev');
      return;
    }
    
    console.log('✅ Server is accessible');
    
    // Run all tests
    await testDifferentEndpoints();
    await testSuspiciousUserAgent();
    await testBurstRequests();
    await testMonitoringEndpoint();
    
    console.log('\n🏁 Rate limiting tests completed!');
    console.log('\nTo view detailed security events and metrics:');
    console.log(`Visit: ${baseUrl}/api/monitoring?action=events`);
    console.log(`Visit: ${baseUrl}/api/monitoring?action=metrics`);
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ or you can install node-fetch');
  console.log('Run with: node --version');
  process.exit(1);
}

main().catch(console.error);