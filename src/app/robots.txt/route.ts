import { NextResponse } from 'next/server';
import { robotsConfig } from '@/lib/seo/config';

export async function GET() {
  const robotsTxt = generateRobotsTxt();
  
  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400' // 24 hours
    }
  });
}

function generateRobotsTxt(): string {
  let robotsTxt = '';
  
  // Add rules for each user agent
  robotsConfig.rules.forEach(rule => {
    robotsTxt += `User-agent: ${rule.userAgent}\n`;
    
    if (rule.allow) {
      if (Array.isArray(rule.allow)) {
        rule.allow.forEach(path => {
          robotsTxt += `Allow: ${path}\n`;
        });
      } else {
        robotsTxt += `Allow: ${rule.allow}\n`;
      }
    }
    
    if (rule.disallow) {
      rule.disallow.forEach(path => {
        robotsTxt += `Disallow: ${path}\n`;
      });
    }
    
    robotsTxt += '\n';
  });
  
  // Add sitemap location
  if (robotsConfig.sitemap) {
    robotsTxt += `Sitemap: ${robotsConfig.sitemap}\n`;
  }
  
  // Add host if specified
  if (robotsConfig.host) {
    robotsTxt += `Host: ${robotsConfig.host}\n`;
  }
  
  return robotsTxt;
}

// Force dynamic rendering for fresh configuration
export const dynamic = 'force-dynamic';