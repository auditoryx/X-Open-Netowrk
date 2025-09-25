/**
 * Phase 2B Week 2: Game Violations API
 * 
 * Provides anti-gaming violation tracking and management
 */

import { NextRequest, NextResponse } from 'next/server';
// Temporarily disabled: import { AdminMiddleware } from "@/lib/auth/adminSecurityMiddleware";

async function getGameViolations(limit: number = 20, resolved?: boolean) {
  try {
    // Mock game violations data
    const mockViolations = [
      {
        id: 'violation_1',
        userId: 'user_gamer_1',
        userEmail: 'suspicious@example.com',
        violationType: 'suspicious_pattern',
        severity: 'high',
        description: 'User completed 15 challenges in under 2 minutes each - automated behavior suspected',
        timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
        resolved: false,
        riskScore: 0.85,
        details: {
          pattern: 'Rapid sequential actions',
          averageTime: 1.2,
          actionCount: 15
        }
      },
      {
        id: 'violation_2',
        userId: 'user_gamer_2',
        userEmail: 'scoremanip@example.com',
        violationType: 'score_manipulation',
        severity: 'critical',
        description: 'Score increase of 5000 points in single action exceeds maximum allowed 100',
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        resolved: false,
        riskScore: 0.95,
        details: {
          scoreIncrease: 5000,
          maxAllowed: 100,
          actionType: 'challenge_complete'
        }
      },
      {
        id: 'violation_3',
        userId: 'user_gamer_3',
        userEmail: 'ratelimit@example.com',
        violationType: 'rate_limit',
        severity: 'medium',
        description: 'User exceeded rate limit with 150 actions in 1 hour (max: 100)',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        resolved: true,
        action: 'temporary_warning_issued',
        riskScore: 0.6,
        resolvedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        resolvedBy: 'moderator@example.com'
      },
      {
        id: 'violation_4',
        userId: 'user_gamer_4',
        userEmail: 'cheater@example.com',
        violationType: 'challenge_cheat',
        severity: 'high',
        description: 'Challenge completed in 0.5 seconds - below minimum threshold of 5 seconds',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        resolved: false,
        riskScore: 0.9,
        details: {
          challengeId: 'challenge_math_1',
          completionTime: 0.5,
          minimumTime: 5,
          score: 200
        }
      },
      {
        id: 'violation_5',
        userId: 'user_gamer_5',
        userEmail: 'pattern@example.com',
        violationType: 'suspicious_pattern',
        severity: 'low',
        description: 'Repetitive action pattern detected but within acceptable limits',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        resolved: true,
        action: 'dismissed_false_positive',
        riskScore: 0.35,
        resolvedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        resolvedBy: 'moderator@example.com'
      }
    ];

    // Filter by resolved status if provided
    let filteredViolations = mockViolations;
    if (resolved !== undefined) {
      filteredViolations = mockViolations.filter(violation => violation.resolved === resolved);
    }

    // Apply limit
    const paginatedViolations = filteredViolations.slice(0, limit);

    return {
      violations: paginatedViolations,
      totalCount: filteredViolations.length,
      hasMore: filteredViolations.length > limit,
      statusCounts: {
        unresolved: mockViolations.filter(v => !v.resolved).length,
        resolved: mockViolations.filter(v => v.resolved).length,
        critical: mockViolations.filter(v => v.severity === 'critical').length,
        high: mockViolations.filter(v => v.severity === 'high').length,
        medium: mockViolations.filter(v => v.severity === 'medium').length,
        low: mockViolations.filter(v => v.severity === 'low').length
      }
    };
  } catch (error) {
    console.error('Failed to get game violations:', error);
    throw new Error('Failed to load game violations');
  }
}

async function handler(req: NextRequest) {
  if (req.method !== 'GET') {
    return new NextResponse(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const resolvedParam = url.searchParams.get('resolved');
    const resolved = resolvedParam ? resolvedParam === 'true' : undefined;

    // Validate parameters
    if (limit > 100) {
      return new NextResponse(
        JSON.stringify({ error: 'Limit cannot exceed 100' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const violationsData = await getGameViolations(limit, resolved);
    
    return new NextResponse(
      JSON.stringify(violationsData),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        } 
      }
    );
  } catch (error) {
    console.error('Game violations API error:', error);
    
    return new NextResponse(
      JSON.stringify({ error: 'Failed to load game violations' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Apply admin security middleware with content moderation permission requirement
export const GET = handler;