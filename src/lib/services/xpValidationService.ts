import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { XPEvent, UserProgress } from './xpService';

interface CooldownRule {
  event: XPEvent;
  cooldownMinutes: number;
  maxPerHour: number;
  maxPerDay: number;
}

interface ValidationAlert {
  id?: string;
  userId: string;
  alertType: 'cooldown_violation' | 'rate_limit_exceeded' | 'suspicious_pattern' | 'automated_behavior';
  event: XPEvent;
  details: Record<string, any>;
  timestamp: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

interface UserBehaviorPattern {
  userId: string;
  avgTimeBetweenActions: number;
  actionFrequency: number;
  peakHours: number[];
  suspiciousScore: number;
  lastAnalyzed: any;
}

export class XPValidationService {
  private static instance: XPValidationService;

  // Cooldown rules for different events
  private static readonly COOLDOWN_RULES: CooldownRule[] = [
    {
      event: 'bookingCompleted',
      cooldownMinutes: 60, // 1 hour between bookings
      maxPerHour: 2,
      maxPerDay: 8
    },
    {
      event: 'fiveStarReview',
      cooldownMinutes: 30, // 30 minutes between reviews
      maxPerHour: 3,
      maxPerDay: 10
    },
    {
      event: 'referralSignup',
      cooldownMinutes: 120, // 2 hours between referrals
      maxPerHour: 1,
      maxPerDay: 3
    },
    {
      event: 'profileCompleted',
      cooldownMinutes: 1440, // 24 hours - once per day
      maxPerHour: 1,
      maxPerDay: 1
    }
  ];

  static getInstance(): XPValidationService {
    if (!XPValidationService.instance) {
      XPValidationService.instance = new XPValidationService();
    }
    return XPValidationService.instance;
  }

  /**
   * Validate XP award before processing
   */
  async validateXPAward(
    userId: string,
    event: XPEvent,
    contextId?: string
  ): Promise<{
    isValid: boolean;
    reason?: string;
    cooldownRemaining?: number;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }> {
    try {
      // Check cooldown periods
      const cooldownCheck = await this.checkCooldownPeriod(userId, event);
      if (!cooldownCheck.isValid) {
        await this.logValidationAlert(userId, 'cooldown_violation', event, {
          cooldownRemaining: cooldownCheck.cooldownRemaining,
          contextId
        }, 'medium');
        
        return {
          isValid: false,
          reason: `Cooldown period active. ${Math.ceil(cooldownCheck.cooldownRemaining! / 60)} minutes remaining.`,
          cooldownRemaining: cooldownCheck.cooldownRemaining,
          severity: 'medium'
        };
      }

      // Check rate limits
      const rateLimitCheck = await this.checkRateLimits(userId, event);
      if (!rateLimitCheck.isValid) {
        await this.logValidationAlert(userId, 'rate_limit_exceeded', event, {
          hourlyCount: rateLimitCheck.hourlyCount,
          dailyCount: rateLimitCheck.dailyCount,
          contextId
        }, 'high');
        
        return {
          isValid: false,
          reason: rateLimitCheck.reason,
          severity: 'high'
        };
      }

      // Check for suspicious patterns
      const patternCheck = await this.checkSuspiciousPatterns(userId, event);
      if (!patternCheck.isValid) {
        await this.logValidationAlert(userId, 'suspicious_pattern', event, {
          suspiciousScore: patternCheck.suspiciousScore,
          contextId
        }, patternCheck.severity || 'high');
        
        return {
          isValid: false,
          reason: patternCheck.reason,
          severity: patternCheck.severity || 'high'
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating XP award:', error);
      return {
        isValid: false,
        reason: 'Validation error occurred',
        severity: 'critical'
      };
    }
  }

  /**
   * Check cooldown periods for events
   */
  private async checkCooldownPeriod(
    userId: string,
    event: XPEvent
  ): Promise<{ isValid: boolean; cooldownRemaining?: number }> {
    const rule = XPValidationService.COOLDOWN_RULES.find(r => r.event === event);
    if (!rule) return { isValid: true };

    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - rule.cooldownMinutes);

    const recentTransactions = await getDocs(query(
      collection(db, 'xpTransactions'),
      where('userId', '==', userId),
      where('event', '==', event),
      where('timestamp', '>', Timestamp.fromDate(cutoffTime)),
      orderBy('timestamp', 'desc'),
      limit(1)
    ));

    if (!recentTransactions.empty) {
      const lastTransaction = recentTransactions.docs[0].data();
      const lastTime = lastTransaction.timestamp.toDate();
      const cooldownEnd = new Date(lastTime.getTime() + (rule.cooldownMinutes * 60000));
      const remainingMs = cooldownEnd.getTime() - Date.now();
      
      if (remainingMs > 0) {
        return {
          isValid: false,
          cooldownRemaining: Math.ceil(remainingMs / 1000) // seconds
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Check rate limits (hourly and daily)
   */
  private async checkRateLimits(
    userId: string,
    event: XPEvent
  ): Promise<{ 
    isValid: boolean; 
    reason?: string; 
    hourlyCount?: number; 
    dailyCount?: number 
  }> {
    const rule = XPValidationService.COOLDOWN_RULES.find(r => r.event === event);
    if (!rule) return { isValid: true };

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    // Check hourly limit
    const hourlyTransactions = await getDocs(query(
      collection(db, 'xpTransactions'),
      where('userId', '==', userId),
      where('event', '==', event),
      where('timestamp', '>', Timestamp.fromDate(oneHourAgo))
    ));

    if (hourlyTransactions.size >= rule.maxPerHour) {
      return {
        isValid: false,
        reason: `Hourly rate limit exceeded for ${event}. Max ${rule.maxPerHour} per hour.`,
        hourlyCount: hourlyTransactions.size
      };
    }

    // Check daily limit
    const dailyTransactions = await getDocs(query(
      collection(db, 'xpTransactions'),
      where('userId', '==', userId),
      where('event', '==', event),
      where('timestamp', '>', Timestamp.fromDate(oneDayAgo))
    ));

    if (dailyTransactions.size >= rule.maxPerDay) {
      return {
        isValid: false,
        reason: `Daily rate limit exceeded for ${event}. Max ${rule.maxPerDay} per day.`,
        dailyCount: dailyTransactions.size
      };
    }

    return { 
      isValid: true, 
      hourlyCount: hourlyTransactions.size,
      dailyCount: dailyTransactions.size 
    };
  }

  /**
   * Analyze user behavior patterns for suspicious activity
   */
  private async checkSuspiciousPatterns(
    userId: string,
    event: XPEvent
  ): Promise<{ 
    isValid: boolean; 
    reason?: string; 
    suspiciousScore?: number;
    severity?: 'low' | 'medium' | 'high' | 'critical'
  }> {
    try {
      // Get recent transactions for pattern analysis
      const recentTransactions = await getDocs(query(
        collection(db, 'xpTransactions'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(50)
      ));

      if (recentTransactions.size < 5) {
        return { isValid: true }; // Not enough data for pattern analysis
      }

      const transactions = recentTransactions.docs.map(doc => doc.data());
      let suspiciousScore = 0;

      // Check for automated behavior patterns
      const timeBetweenActions = this.calculateTimeBetweenActions(transactions);
      
      // Suspicious if actions are too regular (automated)
      const avgTimeBetween = timeBetweenActions.reduce((a, b) => a + b, 0) / timeBetweenActions.length;
      const timeVariance = this.calculateVariance(timeBetweenActions);
      
      if (timeVariance < 60000 && avgTimeBetween < 300000) { // Very regular actions under 5 minutes
        suspiciousScore += 30;
      }

      // Check for burst patterns
      const actionsInLastHour = transactions.filter(t => {
        const transactionTime = t.timestamp.toDate();
        return (Date.now() - transactionTime.getTime()) < 3600000;
      }).length;

      if (actionsInLastHour > 10) {
        suspiciousScore += 25;
      }

      // Check for unusual timing patterns
      const actionHours = transactions.map(t => t.timestamp.toDate().getHours());
      const nightTimeActions = actionHours.filter(hour => hour >= 2 && hour <= 5).length;
      
      if (nightTimeActions > transactions.length * 0.3) { // More than 30% at night
        suspiciousScore += 15;
      }

      // Check for same contextId repeated use
      const contextIds = transactions.map(t => t.contextId).filter(Boolean);
      const uniqueContexts = new Set(contextIds).size;
      
      if (contextIds.length > 0 && uniqueContexts / contextIds.length < 0.8) { // Less than 80% unique
        suspiciousScore += 20;
      }

      // Determine result based on score
      if (suspiciousScore >= 70) {
        return {
          isValid: false,
          reason: 'Highly suspicious automated behavior detected',
          suspiciousScore,
          severity: 'critical'
        };
      } else if (suspiciousScore >= 50) {
        return {
          isValid: false,
          reason: 'Suspicious behavior pattern detected',
          suspiciousScore,
          severity: 'high'
        };
      } else if (suspiciousScore >= 30) {
        // Log but allow - just flag for review
        await this.logValidationAlert(userId, 'suspicious_pattern', event, {
          suspiciousScore,
          reason: 'Moderately suspicious pattern'
        }, 'medium');
      }

      return { isValid: true, suspiciousScore };
    } catch (error) {
      console.error('Error checking suspicious patterns:', error);
      return { isValid: true }; // Fail open to not block legitimate users
    }
  }

  /**
   * Log validation alerts for admin review
   */
  private async logValidationAlert(
    userId: string,
    alertType: ValidationAlert['alertType'],
    event: XPEvent,
    details: Record<string, any>,
    severity: ValidationAlert['severity']
  ): Promise<void> {
    try {
      const alert: ValidationAlert = {
        userId,
        alertType,
        event,
        details,
        timestamp: serverTimestamp(),
        severity,
        resolved: false
      };

      await addDoc(collection(db, 'validationAlerts'), alert);
    } catch (error) {
      console.error('Error logging validation alert:', error);
    }
  }

  /**
   * Get unresolved validation alerts for admin review
   */
  async getValidationAlerts(limit: number = 50): Promise<ValidationAlert[]> {
    try {
      const alertsQuery = query(
        collection(db, 'validationAlerts'),
        where('resolved', '==', false),
        orderBy('timestamp', 'desc'),
        limit
      );

      const alertsSnapshot = await getDocs(alertsQuery);
      return alertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ValidationAlert[];
    } catch (error) {
      console.error('Error fetching validation alerts:', error);
      return [];
    }
  }

  /**
   * Resolve a validation alert
   */
  async resolveAlert(alertId: string, adminId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'validationAlerts', alertId), {
        resolved: true,
        resolvedBy: adminId,
        resolvedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw new Error('Failed to resolve alert');
    }
  }

  /**
   * Utility methods
   */
  private calculateTimeBetweenActions(transactions: any[]): number[] {
    const times = transactions.map(t => t.timestamp.toDate().getTime()).sort();
    const differences = [];
    
    for (let i = 1; i < times.length; i++) {
      differences.push(times[i] - times[i - 1]);
    }
    
    return differences;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Get user behavior summary for admin dashboard
   */
  async getUserBehaviorSummary(userId: string): Promise<UserBehaviorPattern | null> {
    try {
      const transactions = await getDocs(query(
        collection(db, 'xpTransactions'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(100)
      ));

      if (transactions.size < 5) return null;

      const transactionData = transactions.docs.map(doc => doc.data());
      const timeBetweenActions = this.calculateTimeBetweenActions(transactionData);
      const avgTimeBetween = timeBetweenActions.reduce((a, b) => a + b, 0) / timeBetweenActions.length;
      
      const actionHours = transactionData.map(t => t.timestamp.toDate().getHours());
      const hourCounts = new Array(24).fill(0);
      actionHours.forEach(hour => hourCounts[hour]++);
      
      const peakHours = hourCounts
        .map((count, hour) => ({ hour, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(item => item.hour);

      // Calculate basic suspicion score
      const timeVariance = this.calculateVariance(timeBetweenActions);
      let suspiciousScore = 0;
      
      if (timeVariance < 60000 && avgTimeBetween < 300000) suspiciousScore += 20;
      if (actionHours.filter(h => h >= 2 && h <= 5).length > transactionData.length * 0.3) suspiciousScore += 15;
      
      return {
        userId,
        avgTimeBetweenActions: avgTimeBetween,
        actionFrequency: transactionData.length,
        peakHours,
        suspiciousScore,
        lastAnalyzed: serverTimestamp()
      };
    } catch (error) {
      console.error('Error getting user behavior summary:', error);
      return null;
    }
  }
}

// Export singleton instance
export const xpValidationService = XPValidationService.getInstance();
