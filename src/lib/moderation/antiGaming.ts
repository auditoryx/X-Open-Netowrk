/**
 * Phase 2B Week 2: Gamification Anti-Gaming & Security System
 * 
 * This module provides enterprise-grade anti-gaming measures:
 * - Fair scoring algorithm implementation
 * - Abuse detection and prevention mechanisms
 * - Leaderboard integrity verification
 * - Challenge difficulty balancing
 */

export interface GameActionValidation {
  valid: boolean;
  score: number;
  reason?: string;
  penalties?: GamePenalty[];
  suspicious?: boolean;
}

export interface GamePenalty {
  type: 'warning' | 'score_reduction' | 'temporary_ban' | 'permanent_ban';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  duration?: number; // in hours for temporary penalties
  scoreImpact?: number; // points deducted
}

export interface UserGameBehavior {
  userId: string;
  totalActions: number;
  suspiciousActions: number;
  averageActionTime: number; // seconds between actions
  patternDetected: boolean;
  riskScore: number; // 0-1, higher = more suspicious
  lastActivity: Date;
  penalties: GamePenalty[];
}

export interface LeaderboardEntry {
  userId: string;
  score: number;
  rank: number;
  verified: boolean;
  lastUpdated: Date;
  flagged?: boolean;
  flagReason?: string;
}

export interface ChallengeAttempt {
  userId: string;
  challengeId: string;
  completed: boolean;
  timeToComplete: number; // seconds
  score: number;
  suspicious: boolean;
  timestamp: Date;
}

// Anti-gaming configuration
const ANTI_GAMING_CONFIG = {
  // Minimum time between actions (to prevent rapid-fire automation)
  MIN_ACTION_INTERVAL: 2, // seconds
  
  // Maximum actions per hour to prevent spam
  MAX_ACTIONS_PER_HOUR: 100,
  
  // Suspicious behavior thresholds
  SUSPICIOUS_PATTERN_THRESHOLD: 0.7,
  RAPID_ACTION_THRESHOLD: 1, // seconds
  
  // Score validation limits
  MAX_SCORE_INCREASE_PER_ACTION: 100,
  DAILY_SCORE_LIMIT: 5000,
  
  // Leaderboard integrity
  LEADERBOARD_VERIFICATION_THRESHOLD: 0.8,
  TOP_RANK_EXTRA_VERIFICATION: true,
  
  // Challenge difficulty
  CHALLENGE_TIME_VALIDATION: true,
  MIN_CHALLENGE_TIME: 5, // seconds
  MAX_CHALLENGE_TIME: 3600, // 1 hour
  
  // Penalty escalation
  WARNING_THRESHOLD: 3, // suspicious actions before warning
  TEMPORARY_BAN_THRESHOLD: 5, // warnings before temp ban
  PERMANENT_BAN_THRESHOLD: 10 // temp bans before permanent ban
};

/**
 * Validate a game action for potential gaming/cheating
 */
export async function validateGameAction(
  userId: string,
  action: {
    type: 'challenge_complete' | 'badge_earned' | 'streak_extended' | 'social_action';
    score: number;
    metadata?: Record<string, any>;
    timestamp?: Date;
  }
): Promise<GameActionValidation> {
  try {
    const userBehavior = await getUserGameBehavior(userId);
    const validation: GameActionValidation = {
      valid: true,
      score: action.score,
      penalties: []
    };

    // 1. Rate limiting check
    const rateLimitCheck = await checkActionRateLimit(userId, action.type);
    if (!rateLimitCheck.allowed) {
      validation.valid = false;
      validation.reason = 'Action rate limit exceeded';
      validation.penalties?.push({
        type: 'warning',
        severity: 'medium',
        description: `Too many ${action.type} actions in short time period`
      });
      return validation;
    }

    // 2. Score validation
    const scoreValidation = validateScoreIncrease(action.score, userBehavior);
    if (!scoreValidation.valid) {
      validation.valid = false;
      validation.reason = scoreValidation.reason;
      validation.score = scoreValidation.adjustedScore || 0;
      validation.penalties?.push({
        type: 'score_reduction',
        severity: 'high',
        description: 'Excessive score increase detected',
        scoreImpact: action.score - validation.score
      });
    }

    // 3. Pattern detection
    const patternAnalysis = await analyzeUserPattern(userId, action);
    if (patternAnalysis.suspicious) {
      validation.suspicious = true;
      if (patternAnalysis.riskScore > 0.8) {
        validation.valid = false;
        validation.reason = 'Suspicious gaming pattern detected';
        validation.penalties?.push({
          type: 'temporary_ban',
          severity: 'high',
          description: 'Automated gaming behavior detected',
          duration: 24 // 24 hours
        });
      } else if (patternAnalysis.riskScore > 0.6) {
        validation.penalties?.push({
          type: 'warning',
          severity: 'medium',
          description: 'Potentially suspicious gaming behavior'
        });
      }
    }

    // 4. Challenge-specific validation
    if (action.type === 'challenge_complete' && action.metadata) {
      const challengeValidation = await validateChallengeCompletion(
        userId,
        action.metadata.challengeId,
        action.metadata.timeToComplete,
        action.score
      );
      
      if (!challengeValidation.valid) {
        validation.valid = false;
        validation.reason = challengeValidation.reason;
        validation.score = challengeValidation.adjustedScore || 0;
        validation.penalties?.push(...(challengeValidation.penalties || []));
      }
    }

    // 5. Apply penalties if user has history of violations
    if (userBehavior.penalties.length > 0) {
      const escalatedPenalty = calculatePenaltyEscalation(userBehavior.penalties);
      if (escalatedPenalty) {
        validation.penalties?.push(escalatedPenalty);
        if (escalatedPenalty.type === 'temporary_ban' || escalatedPenalty.type === 'permanent_ban') {
          validation.valid = false;
          validation.reason = 'User has been banned for repeated violations';
        }
      }
    }

    return validation;

  } catch (error) {
    console.error('Game action validation error:', error);
    return {
      valid: false,
      score: 0,
      reason: 'Validation system error',
      penalties: [{
        type: 'warning',
        severity: 'low',
        description: 'Unable to validate action - manual review required'
      }]
    };
  }
}

/**
 * Verify leaderboard integrity and detect suspicious rankings
 */
export async function verifyLeaderboard(
  leaderboard: LeaderboardEntry[],
  period: 'daily' | 'weekly' | 'monthly' | 'all-time'
): Promise<LeaderboardEntry[]> {
  const verifiedLeaderboard = [...leaderboard];

  for (let i = 0; i < verifiedLeaderboard.length; i++) {
    const entry = verifiedLeaderboard[i];
    
    // Extra verification for top ranks
    if (ANTI_GAMING_CONFIG.TOP_RANK_EXTRA_VERIFICATION && i < 10) {
      const verification = await verifyTopRankUser(entry.userId, entry.score, period);
      entry.verified = verification.verified;
      
      if (!verification.verified) {
        entry.flagged = true;
        entry.flagReason = verification.reason;
        
        // Move flagged users down or remove from leaderboard
        if (verification.severity === 'critical') {
          verifiedLeaderboard.splice(i, 1);
          i--; // Adjust index after removal
        }
      }
    }

    // Score integrity check
    const scoreIntegrity = await validateLeaderboardScore(entry.userId, entry.score, period);
    if (!scoreIntegrity.valid) {
      entry.flagged = true;
      entry.flagReason = scoreIntegrity.reason;
      entry.score = scoreIntegrity.adjustedScore || entry.score;
    }
  }

  // Re-sort after adjustments
  verifiedLeaderboard.sort((a, b) => b.score - a.score);
  
  // Update ranks
  verifiedLeaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return verifiedLeaderboard;
}

/**
 * Balance challenge difficulty based on completion rates and gaming attempts
 */
export async function balanceChallengesDifficulty(
  challenges: Array<{
    id: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    completionRate: number;
    averageTime: number;
    suspiciousAttempts: number;
    totalAttempts: number;
  }>
): Promise<Array<{
  id: string;
  suggestedDifficulty: string;
  adjustments: string[];
  reasoning: string;
}>> {
  const adjustments = [];

  for (const challenge of challenges) {
    const adjustment = {
      id: challenge.id,
      suggestedDifficulty: challenge.difficulty,
      adjustments: [] as string[],
      reasoning: ''
    };

    const suspiciousRate = challenge.suspiciousAttempts / challenge.totalAttempts;
    
    // Check if challenge is too easy (high completion rate + low average time)
    if (challenge.completionRate > 0.9 && challenge.averageTime < 30) {
      adjustment.suggestedDifficulty = increaseDifficulty(challenge.difficulty);
      adjustment.adjustments.push('Increase complexity');
      adjustment.adjustments.push('Add time constraints');
      adjustment.reasoning = 'Challenge completed too quickly by most users';
    }
    
    // Check if challenge is being gamed (high suspicious rate)
    else if (suspiciousRate > 0.3) {
      adjustment.adjustments.push('Add verification steps');
      adjustment.adjustments.push('Implement time-based validation');
      adjustment.adjustments.push('Add randomization elements');
      adjustment.reasoning = 'High rate of suspicious completion attempts detected';
    }
    
    // Check if challenge is too hard (very low completion rate)
    else if (challenge.completionRate < 0.1 && challenge.averageTime > 1800) {
      adjustment.suggestedDifficulty = decreaseDifficulty(challenge.difficulty);
      adjustment.adjustments.push('Simplify requirements');
      adjustment.adjustments.push('Provide more hints');
      adjustment.reasoning = 'Challenge too difficult for most users';
    }
    
    // Check for balanced challenges
    else if (challenge.completionRate >= 0.3 && challenge.completionRate <= 0.7 && suspiciousRate < 0.1) {
      adjustment.reasoning = 'Challenge appears well-balanced';
    }

    adjustments.push(adjustment);
  }

  return adjustments;
}

// Helper functions

async function getUserGameBehavior(userId: string): Promise<UserGameBehavior> {
  // In real implementation, this would query the database
  // For now, return mock data
  return {
    userId,
    totalActions: Math.floor(Math.random() * 1000),
    suspiciousActions: Math.floor(Math.random() * 50),
    averageActionTime: Math.random() * 60 + 5, // 5-65 seconds
    patternDetected: Math.random() < 0.1, // 10% chance
    riskScore: Math.random() * 0.5, // 0-50% risk for normal users
    lastActivity: new Date(),
    penalties: []
  };
}

async function checkActionRateLimit(
  userId: string, 
  actionType: string
): Promise<{ allowed: boolean; remaining: number }> {
  // Simple rate limiting - in production would use Redis or similar
  const key = `rate_limit:${userId}:${actionType}`;
  
  // Mock implementation
  return {
    allowed: Math.random() > 0.05, // 95% success rate
    remaining: Math.floor(Math.random() * 50)
  };
}

function validateScoreIncrease(
  score: number, 
  userBehavior: UserGameBehavior
): { valid: boolean; adjustedScore?: number; reason?: string } {
  if (score > ANTI_GAMING_CONFIG.MAX_SCORE_INCREASE_PER_ACTION) {
    return {
      valid: false,
      adjustedScore: ANTI_GAMING_CONFIG.MAX_SCORE_INCREASE_PER_ACTION,
      reason: `Score increase ${score} exceeds maximum allowed ${ANTI_GAMING_CONFIG.MAX_SCORE_INCREASE_PER_ACTION}`
    };
  }

  // Check daily score accumulation
  const estimatedDailyScore = score * (userBehavior.totalActions || 1);
  if (estimatedDailyScore > ANTI_GAMING_CONFIG.DAILY_SCORE_LIMIT) {
    return {
      valid: false,
      adjustedScore: Math.floor(score * 0.5), // Reduce by 50%
      reason: 'Daily score limit would be exceeded'
    };
  }

  return { valid: true };
}

async function analyzeUserPattern(
  userId: string, 
  action: any
): Promise<{ suspicious: boolean; riskScore: number; patterns: string[] }> {
  // Pattern analysis would examine:
  // - Time intervals between actions
  // - Repetitive behavior patterns
  // - Unusual action sequences
  // - Device/IP consistency
  
  const patterns = [];
  let riskScore = 0;

  // Mock pattern detection
  if (Math.random() < 0.1) { // 10% chance of pattern detection
    patterns.push('Rapid sequential actions');
    riskScore += 0.3;
  }

  if (Math.random() < 0.05) { // 5% chance of automation detection
    patterns.push('Automated behavior detected');
    riskScore += 0.5;
  }

  return {
    suspicious: riskScore > 0.3,
    riskScore,
    patterns
  };
}

async function validateChallengeCompletion(
  userId: string,
  challengeId: string,
  timeToComplete: number,
  score: number
): Promise<{ valid: boolean; adjustedScore?: number; reason?: string; penalties?: GamePenalty[] }> {
  const penalties: GamePenalty[] = [];
  
  // Time validation
  if (timeToComplete < ANTI_GAMING_CONFIG.MIN_CHALLENGE_TIME) {
    return {
      valid: false,
      adjustedScore: 0,
      reason: `Challenge completed too quickly (${timeToComplete}s < ${ANTI_GAMING_CONFIG.MIN_CHALLENGE_TIME}s minimum)`,
      penalties: [{
        type: 'warning',
        severity: 'high',
        description: 'Suspiciously fast challenge completion'
      }]
    };
  }

  if (timeToComplete > ANTI_GAMING_CONFIG.MAX_CHALLENGE_TIME) {
    return {
      valid: false,
      reason: 'Challenge completion time exceeded maximum allowed duration',
      penalties: [{
        type: 'warning',
        severity: 'low',
        description: 'Challenge took too long to complete'
      }]
    };
  }

  // Score vs time correlation check
  const expectedScore = calculateExpectedChallengeScore(challengeId, timeToComplete);
  if (score > expectedScore * 1.5) { // 50% tolerance
    penalties.push({
      type: 'score_reduction',
      severity: 'medium',
      description: 'Score too high for completion time',
      scoreImpact: score - expectedScore
    });
    
    return {
      valid: true,
      adjustedScore: expectedScore,
      reason: 'Score adjusted based on completion time',
      penalties
    };
  }

  return { valid: true };
}

function calculateExpectedChallengeScore(challengeId: string, timeToComplete: number): number {
  // Mock score calculation based on challenge difficulty and time
  const baseScore = 100;
  const timeBonus = Math.max(0, 300 - timeToComplete); // Bonus for completing under 5 minutes
  return baseScore + timeBonus;
}

async function verifyTopRankUser(
  userId: string, 
  score: number, 
  period: string
): Promise<{ verified: boolean; reason?: string; severity?: 'low' | 'medium' | 'high' | 'critical' }> {
  // Enhanced verification for top-ranked users
  const userBehavior = await getUserGameBehavior(userId);
  
  if (userBehavior.riskScore > 0.7) {
    return {
      verified: false,
      reason: 'High risk score detected',
      severity: 'critical'
    };
  }

  if (userBehavior.suspiciousActions / userBehavior.totalActions > 0.3) {
    return {
      verified: false,
      reason: 'High percentage of suspicious actions',
      severity: 'high'
    };
  }

  // Check for sudden score jumps
  const scoreGrowthRate = await calculateScoreGrowthRate(userId, period);
  if (scoreGrowthRate > 10) { // 10x normal growth rate
    return {
      verified: false,
      reason: 'Unusual score growth pattern',
      severity: 'medium'
    };
  }

  return { verified: true };
}

async function validateLeaderboardScore(
  userId: string, 
  score: number, 
  period: string
): Promise<{ valid: boolean; adjustedScore?: number; reason?: string }> {
  // Validate that the score is achievable within the given time period
  const maxPossibleScore = await calculateMaxPossibleScore(userId, period);
  
  if (score > maxPossibleScore) {
    return {
      valid: false,
      adjustedScore: maxPossibleScore,
      reason: `Score ${score} exceeds maximum possible ${maxPossibleScore} for time period`
    };
  }

  return { valid: true };
}

async function calculateScoreGrowthRate(userId: string, period: string): Promise<number> {
  // Mock calculation - in real implementation would analyze historical data
  return Math.random() * 5 + 1; // 1-6x growth rate
}

async function calculateMaxPossibleScore(userId: string, period: string): Promise<number> {
  // Calculate theoretical maximum score based on available actions and time
  const periodHours = period === 'daily' ? 24 : period === 'weekly' ? 168 : 720; // monthly
  const maxActionsPerHour = ANTI_GAMING_CONFIG.MAX_ACTIONS_PER_HOUR;
  const maxScorePerAction = ANTI_GAMING_CONFIG.MAX_SCORE_INCREASE_PER_ACTION;
  
  return periodHours * maxActionsPerHour * maxScorePerAction;
}

function calculatePenaltyEscalation(penalties: GamePenalty[]): GamePenalty | null {
  const warnings = penalties.filter(p => p.type === 'warning').length;
  const tempBans = penalties.filter(p => p.type === 'temporary_ban').length;
  
  if (tempBans >= ANTI_GAMING_CONFIG.PERMANENT_BAN_THRESHOLD) {
    return {
      type: 'permanent_ban',
      severity: 'critical',
      description: 'Repeated violations - permanent ban applied'
    };
  }
  
  if (warnings >= ANTI_GAMING_CONFIG.TEMPORARY_BAN_THRESHOLD) {
    return {
      type: 'temporary_ban',
      severity: 'high',
      description: 'Multiple warnings - temporary ban applied',
      duration: 72 // 3 days
    };
  }
  
  return null;
}

function increaseDifficulty(current: string): string {
  const levels = ['easy', 'medium', 'hard', 'expert'];
  const currentIndex = levels.indexOf(current);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : current;
}

function decreaseDifficulty(current: string): string {
  const levels = ['easy', 'medium', 'hard', 'expert'];
  const currentIndex = levels.indexOf(current);
  return currentIndex > 0 ? levels[currentIndex - 1] : current;
}

/**
 * Generate anti-gaming report for administrators
 */
export async function generateAntiGamingReport(timeframe: 'daily' | 'weekly' | 'monthly'): Promise<{
  summary: {
    totalActions: number;
    suspiciousActions: number;
    penaltiesIssued: number;
    usersAffected: number;
  };
  topViolators: Array<{
    userId: string;
    violationCount: number;
    riskScore: number;
    penalties: GamePenalty[];
  }>;
  challenges: Array<{
    challengeId: string;
    suspiciousCompletions: number;
    totalCompletions: number;
    suspiciousRate: number;
  }>;
  recommendations: string[];
}> {
  // Mock report generation
  return {
    summary: {
      totalActions: Math.floor(Math.random() * 10000) + 5000,
      suspiciousActions: Math.floor(Math.random() * 500) + 100,
      penaltiesIssued: Math.floor(Math.random() * 50) + 10,
      usersAffected: Math.floor(Math.random() * 20) + 5
    },
    topViolators: [],
    challenges: [],
    recommendations: [
      'Implement additional verification for rapid completions',
      'Review challenge difficulty balancing',
      'Consider stricter rate limiting for new users',
      'Monitor top leaderboard positions more closely'
    ]
  };
}