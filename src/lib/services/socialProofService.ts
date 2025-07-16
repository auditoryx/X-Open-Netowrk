import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { testimonialService, Testimonial } from './testimonialService';

export interface SocialProofMetrics {
  totalProjects: number;
  totalClients: number;
  averageRating: number;
  completionRate: number;
  responseTime: string;
  totalEarnings: number;
  yearsOfExperience: number;
  repeatClientRate: number;
  onTimeDeliveryRate: number;
  clientSatisfactionScore: number;
}

export interface SocialProofBadge {
  id: string;
  type: 'rating' | 'milestone' | 'achievement' | 'verification' | 'specialty';
  title: string;
  description: string;
  icon: string;
  color: string;
  isEarned: boolean;
  earnedAt?: Date;
  progress?: number;
  maxProgress?: number;
  criteria: {
    metric: string;
    operator: '>=' | '>' | '<=' | '<' | '==';
    value: number | string;
  };
}

export interface TrustSignal {
  id: string;
  type: 'verification' | 'certification' | 'portfolio' | 'testimonial' | 'social';
  title: string;
  description: string;
  status: 'verified' | 'pending' | 'expired';
  verifiedAt?: Date;
  expiresAt?: Date;
  source: string;
  credentialUrl?: string;
  weight: number; // Trust score weight
}

export interface SocialProofWidget {
  id: string;
  type: 'testimonials' | 'metrics' | 'badges' | 'recent_work' | 'certifications';
  title: string;
  isVisible: boolean;
  position: number;
  settings: {
    showCount?: number;
    displayStyle?: 'grid' | 'list' | 'carousel';
    autoRotate?: boolean;
    showRatings?: boolean;
    showAvatars?: boolean;
    compactMode?: boolean;
  };
}

export interface SocialProofProfile {
  creatorId: string;
  metrics: SocialProofMetrics;
  badges: SocialProofBadge[];
  trustSignals: TrustSignal[];
  widgets: SocialProofWidget[];
  trustScore: number;
  lastUpdated: Date;
}

class SocialProofService {
  private readonly BADGE_DEFINITIONS: Omit<SocialProofBadge, 'id' | 'isEarned' | 'earnedAt' | 'progress'>[] = [
    {
      type: SCHEMA_FIELDS.REVIEW.RATING,
      title: 'Top Rated Creator',
      description: 'Maintains a 4.8+ star rating with 20+ reviews',
      icon: 'star',
      color: 'yellow',
      maxProgress: 20,
      criteria: { metric: SCHEMA_FIELDS.USER.AVERAGE_RATING, operator: '>=', value: 4.8 }
    },
    {
      type: 'milestone',
      title: '100 Projects Completed',
      description: 'Successfully delivered 100+ projects',
      icon: 'target',
      color: 'blue',
      maxProgress: 100,
      criteria: { metric: 'totalProjects', operator: '>=', value: 100 }
    },
    {
      type: 'achievement',
      title: 'Lightning Fast',
      description: 'Average response time under 2 hours',
      icon: 'zap',
      color: 'purple',
      maxProgress: 1,
      criteria: { metric: 'responseTimeHours', operator: '<=', value: 2 }
    },
    {
      type: 'achievement',
      title: 'Client Favorite',
      description: '80%+ repeat client rate',
      icon: 'heart',
      color: 'red',
      maxProgress: 80,
      criteria: { metric: 'repeatClientRate', operator: '>=', value: 80 }
    },
    {
      type: 'milestone',
      title: 'Earning Milestone',
      description: 'Earned $10,000+ on the platform',
      icon: 'dollar-sign',
      color: 'green',
      maxProgress: 10000,
      criteria: { metric: 'totalEarnings', operator: '>=', value: 10000 }
    },
    {
      type: 'specialty',
      title: 'Audio Expert',
      description: 'Specialized in audio production and mixing',
      icon: 'music',
      color: 'indigo',
      maxProgress: 1,
      criteria: { metric: 'specialization', operator: '==', value: 'audio' }
    },
    {
      type: 'verification',
      title: 'Verified Professional',
      description: 'Identity and credentials verified',
      icon: 'shield-check',
      color: 'blue',
      maxProgress: 1,
      criteria: { metric: 'isVerified', operator: '==', value: true }
    },
    {
      type: 'achievement',
      title: 'Perfect Delivery',
      description: '95%+ on-time delivery rate',
      icon: 'clock',
      color: 'orange',
      maxProgress: 95,
      criteria: { metric: 'onTimeDeliveryRate', operator: '>=', value: 95 }
    }
  ];

  async getSocialProofProfile(creatorId: string): Promise<SocialProofProfile> {
    try {
      // Get creator metrics
      const metrics = await this.calculateSocialProofMetrics(creatorId);
      
      // Calculate badges
      const badges = await this.calculateBadges(creatorId, metrics);
      
      // Get trust signals
      const trustSignals = await this.getTrustSignals(creatorId);
      
      // Get widget configuration
      const widgets = await this.getWidgetConfiguration(creatorId);
      
      // Calculate trust score
      const trustScore = this.calculateTrustScore(metrics, badges, trustSignals);

      return {
        creatorId,
        metrics,
        badges,
        trustSignals,
        widgets,
        trustScore,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting social proof profile:', error);
      throw error;
    }
  }

  async calculateSocialProofMetrics(creatorId: string): Promise<SocialProofMetrics> {
    try {
      // Get data from various services
      const [
        testimonials,
        // portfolioData,
        // bookingData,
        // userProfile
      ] = await Promise.all([
        testimonialService.getCreatorTestimonials(creatorId, { status: 'approved' }),
        // portfolioService.getCreatorPortfolio(creatorId),
        // bookingService.getCreatorBookings(creatorId),
        // userService.getUserProfile(creatorId)
      ]);

      // Calculate metrics from available data
      const totalTestimonials = testimonials.testimonials.length;
      const averageRating = totalTestimonials > 0 
        ? testimonials.testimonials.reduce((sum, t) => sum + t.rating, 0) / totalTestimonials 
        : 0;

      // Mock data for now - would be calculated from real data
      const metrics: SocialProofMetrics = {
        totalProjects: Math.floor(Math.random() * 150) + 50,
        totalClients: Math.floor(Math.random() * 80) + 30,
        averageRating: Number(averageRating.toFixed(1)),
        completionRate: 98.5,
        responseTime: '1.2 hours',
        totalEarnings: Math.floor(Math.random() * 25000) + 5000,
        yearsOfExperience: Math.floor(Math.random() * 8) + 2,
        repeatClientRate: Math.floor(Math.random() * 40) + 60,
        onTimeDeliveryRate: Math.floor(Math.random() * 10) + 90,
        clientSatisfactionScore: Math.floor(Math.random() * 20) + 80
      };

      return metrics;
    } catch (error) {
      console.error('Error calculating social proof metrics:', error);
      throw error;
    }
  }

  async calculateBadges(creatorId: string, metrics: SocialProofMetrics): Promise<SocialProofBadge[]> {
    try {
      const badges: SocialProofBadge[] = [];

      for (const badgeDefinition of this.BADGE_DEFINITIONS) {
        const badge: SocialProofBadge = {
          id: `${creatorId}_${badgeDefinition.type}_${badgeDefinition.title.replace(/\s+/g, '_').toLowerCase()}`,
          ...badgeDefinition,
          isEarned: false,
          progress: 0
        };

        // Check if badge criteria is met
        const metricValue = this.getMetricValue(metrics, badge.criteria.metric);
        const isEarned = this.evaluateCriteria(metricValue, badge.criteria);

        badge.isEarned = isEarned;
        badge.progress = this.calculateProgress(metricValue, badge.criteria, badge.maxProgress);

        if (isEarned) {
          badge.earnedAt = new Date(); // Would be actual earned date from database
        }

        badges.push(badge);
      }

      return badges;
    } catch (error) {
      console.error('Error calculating badges:', error);
      throw error;
    }
  }

  async getTrustSignals(creatorId: string): Promise<TrustSignal[]> {
    try {
      // This would integrate with various verification systems
      const trustSignals: TrustSignal[] = [
        {
          id: `${creatorId}_email_verification`,
          type: 'verification',
          title: 'Email Verified',
          description: 'Email address has been verified',
          status: 'verified',
          verifiedAt: new Date(),
          source: 'Platform',
          weight: 10
        },
        {
          id: `${creatorId}_identity_verification`,
          type: 'verification',
          title: 'Identity Verified',
          description: 'Government ID verified',
          status: 'verified',
          verifiedAt: new Date(),
          source: 'ID Verification Service',
          weight: 25
        },
        {
          id: `${creatorId}_portfolio_verification`,
          type: 'portfolio',
          title: 'Portfolio Verified',
          description: 'Work samples verified as original',
          status: 'verified',
          verifiedAt: new Date(),
          source: 'Platform Review',
          weight: 15
        }
      ];

      return trustSignals;
    } catch (error) {
      console.error('Error getting trust signals:', error);
      throw error;
    }
  }

  async getWidgetConfiguration(creatorId: string): Promise<SocialProofWidget[]> {
    try {
      // Default widget configuration
      const defaultWidgets: SocialProofWidget[] = [
        {
          id: 'testimonials',
          type: 'testimonials',
          title: 'Client Testimonials',
          isVisible: true,
          position: 1,
          settings: {
            showCount: 3,
            displayStyle: 'carousel',
            autoRotate: true,
            showRatings: true,
            showAvatars: true,
            compactMode: false
          }
        },
        {
          id: 'metrics',
          type: 'metrics',
          title: 'Key Metrics',
          isVisible: true,
          position: 2,
          settings: {
            showCount: 4,
            displayStyle: 'grid',
            compactMode: true
          }
        },
        {
          id: 'badges',
          type: 'badges',
          title: 'Achievements',
          isVisible: true,
          position: 3,
          settings: {
            showCount: 6,
            displayStyle: 'grid',
            compactMode: false
          }
        },
        {
          id: 'certifications',
          type: 'certifications',
          title: 'Verifications',
          isVisible: true,
          position: 4,
          settings: {
            showCount: 5,
            displayStyle: 'list',
            compactMode: true
          }
        }
      ];

      return defaultWidgets;
    } catch (error) {
      console.error('Error getting widget configuration:', error);
      throw error;
    }
  }

  calculateTrustScore(
    metrics: SocialProofMetrics, 
    badges: SocialProofBadge[], 
    trustSignals: TrustSignal[]
  ): number {
    let score = 0;

    // Base metrics score (0-50 points)
    score += Math.min(metrics.averageRating * 10, 50); // Max 50 points from rating
    score += Math.min(metrics.completionRate / 2, 50); // Max 50 points from completion rate
    score += Math.min(metrics.totalProjects / 2, 50); // Max 50 points from project count

    // Badges score (0-30 points)
    const earnedBadges = badges.filter(b => b.isEarned).length;
    score += Math.min(earnedBadges * 3, 30);

    // Trust signals score (0-20 points)
    const trustSignalScore = trustSignals
      .filter(ts => ts.status === 'verified')
      .reduce((sum, ts) => sum + ts.weight, 0);
    score += Math.min(trustSignalScore, 20);

    return Math.min(Math.round(score), 100);
  }

  private getMetricValue(metrics: SocialProofMetrics, metricName: string): any {
    switch (metricName) {
      case 'averageRating':
        return metrics.averageRating;
      case 'totalProjects':
        return metrics.totalProjects;
      case 'totalClients':
        return metrics.totalClients;
      case 'responseTimeHours':
        return parseFloat(metrics.responseTime.split(' ')[0]);
      case 'repeatClientRate':
        return metrics.repeatClientRate;
      case 'totalEarnings':
        return metrics.totalEarnings;
      case 'onTimeDeliveryRate':
        return metrics.onTimeDeliveryRate;
      case 'clientSatisfactionScore':
        return metrics.clientSatisfactionScore;
      case 'isVerified':
        return true; // Would check actual verification status
      case 'specialization':
        return 'audio'; // Would get from user profile
      default:
        return 0;
    }
  }

  private evaluateCriteria(value: any, criteria: SocialProofBadge['criteria']): boolean {
    switch (criteria.operator) {
      case '>=':
        return value >= criteria.value;
      case '>':
        return value > criteria.value;
      case '<=':
        return value <= criteria.value;
      case '<':
        return value < criteria.value;
      case '==':
        return value === criteria.value;
      default:
        return false;
    }
  }

  private calculateProgress(
    currentValue: any, 
    criteria: SocialProofBadge['criteria'], 
    maxProgress?: number
  ): number {
    if (!maxProgress) return this.evaluateCriteria(currentValue, criteria) ? 100 : 0;

    const progress = (currentValue / criteria.value) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }

  // Widget-specific data methods
  async getTestimonialWidgetData(creatorId: string, settings: SocialProofWidget['settings']): Promise<Testimonial[]> {
    try {
      const testimonials = await testimonialService.getFeaturedTestimonials(
        creatorId, 
        settings.showCount || 3
      );
      return testimonials;
    } catch (error) {
      console.error('Error getting testimonial widget data:', error);
      return [];
    }
  }

  async getMetricsWidgetData(creatorId: string): Promise<{ label: string; value: string; trend?: string }[]> {
    try {
      const metrics = await this.calculateSocialProofMetrics(creatorId);
      
      return [
        {
          label: 'Projects Completed',
          value: metrics.totalProjects.toString(),
          trend: '+12%'
        },
        {
          label: 'Client Rating',
          value: `${metrics.averageRating}/5.0`,
          trend: '+0.2'
        },
        {
          label: 'Response Time',
          value: metrics.responseTime,
          trend: '-15min'
        },
        {
          label: 'Client Satisfaction',
          value: `${metrics.clientSatisfactionScore}%`,
          trend: '+3%'
        }
      ];
    } catch (error) {
      console.error('Error getting metrics widget data:', error);
      return [];
    }
  }

  async getBadgesWidgetData(creatorId: string, settings: SocialProofWidget['settings']): Promise<SocialProofBadge[]> {
    try {
      const profile = await this.getSocialProofProfile(creatorId);
      const earnedBadges = profile.badges.filter(b => b.isEarned);
      
      return earnedBadges.slice(0, settings.showCount || 6);
    } catch (error) {
      console.error('Error getting badges widget data:', error);
      return [];
    }
  }

  async getCertificationsWidgetData(creatorId: string): Promise<TrustSignal[]> {
    try {
      const trustSignals = await this.getTrustSignals(creatorId);
      return trustSignals.filter(ts => ts.status === 'verified');
    } catch (error) {
      console.error('Error getting certifications widget data:', error);
      return [];
    }
  }
}

export const socialProofService = new SocialProofService();
