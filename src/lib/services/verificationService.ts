/**
 * Verification Service - Standard → Verified tier progression system
 * Handles eligibility checking, auto-applications, and admin approval workflow
 */

import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit,
  Timestamp,
  runTransaction,
  updateDoc 
} from 'firebase/firestore';
import { xpService } from './xpService';
import { badgeService } from './badgeService';

// Verification application statuses
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

// Verification application interface
export interface VerificationApplication {
  id: string;
  userId: string;
  status: VerificationStatus;
  appliedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  reviewNotes?: string;
  eligibilitySnapshot: {
    totalXP: number;
    profileCompleteness: number;
    completedBookings: number;
    averageRating: number;
    hasViolations: boolean;
    meetsAllCriteria: boolean;
  };
  metadata?: Record<string, any>;
}

// Verification criteria configuration
export interface VerificationCriteria {
  minimumXP: number;
  minimumProfileCompleteness: number;
  minimumCompletedBookings: number;
  minimumAverageRating: number;
  maxRecentViolations: number;
  violationLookbackDays: number;
}

// Default verification criteria
const DEFAULT_CRITERIA: VerificationCriteria = {
  minimumXP: 1000,
  minimumProfileCompleteness: 90,
  minimumCompletedBookings: 3,
  minimumAverageRating: 4.0,
  maxRecentViolations: 0,
  violationLookbackDays: 90
};

// Eligibility check result
export interface EligibilityResult {
  isEligible: boolean;
  criteria: {
    xp: { met: boolean; current: number; required: number };
    profileCompleteness: { met: boolean; current: number; required: number };
    completedBookings: { met: boolean; current: number; required: number };
    averageRating: { met: boolean; current: number; required: number };
    violations: { met: boolean; current: number; allowed: number };
  };
  overallScore: number;
  nextSteps?: string[];
}

export class VerificationService {
  private static instance: VerificationService;
  private criteria: VerificationCriteria = DEFAULT_CRITERIA;

  private constructor() {}

  static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService();
    }
    return VerificationService.instance;
  }

  /**
   * Check if user is eligible for verification
   */
  async checkEligibility(userId: string): Promise<EligibilityResult> {
    try {
      // Get user's XP progress
      const userProgress = await xpService.getUserProgress(userId);
      if (!userProgress) {
        throw new Error('User progress not found');
      }

      // Get user profile data
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();

      // Calculate profile completeness
      const profileCompleteness = this.calculateProfileCompleteness(userData);

      // Get completed bookings count
      const completedBookings = await this.getCompletedBookingsCount(userId);

      // Get average rating
      const averageRating = userData.averageRating || 0;

      // Check for recent violations
      const recentViolations = await this.getRecentViolationsCount(userId);

      // Evaluate each criterion
      const criteria = {
        xp: {
          met: userProgress.totalXP >= this.criteria.minimumXP,
          current: userProgress.totalXP,
          required: this.criteria.minimumXP
        },
        profileCompleteness: {
          met: profileCompleteness >= this.criteria.minimumProfileCompleteness,
          current: profileCompleteness,
          required: this.criteria.minimumProfileCompleteness
        },
        completedBookings: {
          met: completedBookings >= this.criteria.minimumCompletedBookings,
          current: completedBookings,
          required: this.criteria.minimumCompletedBookings
        },
        averageRating: {
          met: averageRating >= this.criteria.minimumAverageRating,
          current: averageRating,
          required: this.criteria.minimumAverageRating
        },
        violations: {
          met: recentViolations <= this.criteria.maxRecentViolations,
          current: recentViolations,
          allowed: this.criteria.maxRecentViolations
        }
      };

      // Check if all criteria are met
      const isEligible = Object.values(criteria).every(criterion => criterion.met);

      // Calculate overall score (percentage of criteria met)
      const metCriteria = Object.values(criteria).filter(criterion => criterion.met).length;
      const totalCriteria = Object.values(criteria).length;
      const overallScore = Math.round((metCriteria / totalCriteria) * 100);

      // Generate next steps for incomplete criteria
      const nextSteps: string[] = [];
      if (!criteria.xp.met) {
        const needed = criteria.xp.required - criteria.xp.current;
        nextSteps.push(`Earn ${needed} more XP (complete ${Math.ceil(needed / 100)} more bookings)`);
      }
      if (!criteria.profileCompleteness.met) {
        nextSteps.push('Complete your profile (add bio, skills, portfolio)');
      }
      if (!criteria.completedBookings.met) {
        const needed = criteria.completedBookings.required - criteria.completedBookings.current;
        nextSteps.push(`Complete ${needed} more booking${needed > 1 ? 's' : ''}`);
      }
      if (!criteria.averageRating.met) {
        nextSteps.push('Improve your average rating by delivering high-quality work');
      }
      if (!criteria.violations.met) {
        nextSteps.push('Resolve any recent violations and maintain good standing');
      }

      return {
        isEligible,
        criteria,
        overallScore,
        nextSteps: nextSteps.length > 0 ? nextSteps : undefined
      };
    } catch (error) {
      console.error('Error checking verification eligibility:', error);
      throw error;
    }
  }

  /**
   * Submit verification application
   */
  async submitApplication(userId: string): Promise<{
    success: boolean;
    applicationId?: string;
    message: string;
  }> {
    try {
      // Check if user is eligible
      const eligibility = await this.checkEligibility(userId);
      if (!eligibility.isEligible) {
        return {
          success: false,
          message: 'You do not meet all verification criteria yet'
        };
      }

      // Check if user already has a pending application
      const existingApplication = await this.getUserPendingApplication(userId);
      if (existingApplication) {
        return {
          success: false,
          message: 'You already have a pending verification application'
        };
      }

      // Create application
      const applicationId = `${userId}_${Date.now()}`;
      const application: VerificationApplication = {
        id: applicationId,
        userId,
        status: 'pending',
        appliedAt: Timestamp.now(),
        eligibilitySnapshot: {
          totalXP: eligibility.criteria.xp.current,
          profileCompleteness: eligibility.criteria.profileCompleteness.current,
          completedBookings: eligibility.criteria.completedBookings.current,
          averageRating: eligibility.criteria.averageRating.current,
          hasViolations: !eligibility.criteria.violations.met,
          meetsAllCriteria: eligibility.isEligible
        },
        metadata: {
          submittedAt: new Date().toISOString(),
          eligibilityScore: eligibility.overallScore
        }
      };

      // Save application to Firestore
      await setDoc(doc(db, 'verificationApplications', applicationId), application);

      // Log the application
      await this.logVerificationActivity(userId, 'application_submitted', {
        applicationId,
        eligibilityScore: eligibility.overallScore
      });

      return {
        success: true,
        applicationId,
        message: 'Verification application submitted successfully'
      };
    } catch (error) {
      console.error('Error submitting verification application:', error);
      return {
        success: false,
        message: 'Failed to submit verification application'
      };
    }
  }

  /**
   * Auto-trigger verification application for eligible users
   */
  async autoTriggerApplication(userId: string): Promise<boolean> {
    try {
      // Only auto-trigger if user doesn't have pending application
      const pendingApplication = await this.getUserPendingApplication(userId);
      if (pendingApplication) {
        return false;
      }

      // Check eligibility
      const eligibility = await this.checkEligibility(userId);
      if (!eligibility.isEligible) {
        return false;
      }

      // Submit application automatically
      const result = await this.submitApplication(userId);
      return result.success;
    } catch (error) {
      console.error('Error auto-triggering verification application:', error);
      return false;
    }
  }

  /**
   * Get user's current verification status
   */
  async getUserVerificationStatus(userId: string): Promise<{
    isVerified: boolean;
    currentApplication?: VerificationApplication;
    eligibility: EligibilityResult;
  }> {
    try {
      // Check if user is already verified
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const isVerified = userData.tier === 'verified';

      // Get current application if any
      const currentApplication = await this.getUserPendingApplication(userId);

      // Get eligibility status
      const eligibility = await this.checkEligibility(userId);

      return {
        isVerified,
        currentApplication,
        eligibility
      };
    } catch (error) {
      console.error('Error getting user verification status:', error);
      throw error;
    }
  }

  /**
   * Admin: Review verification application
   */
  async reviewApplication(
    applicationId: string,
    adminId: string,
    decision: 'approve' | 'reject',
    notes?: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      return await runTransaction(db, async (transaction) => {
        // Get application
        const appRef = doc(db, 'verificationApplications', applicationId);
        const appDoc = await transaction.get(appRef);
        
        if (!appDoc.exists()) {
          throw new Error('Application not found');
        }

        const application = appDoc.data() as VerificationApplication;
        
        if (application.status !== 'pending') {
          throw new Error('Application has already been reviewed');
        }

        // Update application status
        const updatedApplication: Partial<VerificationApplication> = {
          status: decision === 'approve' ? 'approved' : 'rejected',
          reviewedAt: Timestamp.now(),
          reviewedBy: adminId,
          reviewNotes: notes
        };

        transaction.update(appRef, updatedApplication);

        // If approved, update user tier
        if (decision === 'approve') {
          const userRef = doc(db, 'users', application.userId);
          transaction.update(userRef, {
            tier: 'verified',
            verifiedAt: Timestamp.now(),
            verifiedBy: adminId
          });

          // Award Verified Pro badge
          setTimeout(async () => {
            try {
              await badgeService.checkAndAwardBadges(
                application.userId,
                'tierReached',
                { tier: 'verified', adminId }
              );
            } catch (error) {
              console.error('Error awarding Verified Pro badge:', error);
            }
          }, 1000);
        }

        return {
          success: true,
          message: `Application ${decision}d successfully`
        };
      });
    } catch (error) {
      console.error('Error reviewing verification application:', error);
      return {
        success: false,
        message: `Failed to ${decision} application`
      };
    }
  }

  /**
   * Admin: Get pending applications
   */
  async getPendingApplications(limitCount = 50): Promise<VerificationApplication[]> {
    try {
      const q = query(
        collection(db, 'verificationApplications'),
        where(SCHEMA_FIELDS.BOOKING.STATUS, '==', 'pending'),
        orderBy('appliedAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as VerificationApplication);
    } catch (error) {
      console.error('Error getting pending applications:', error);
      return [];
    }
  }

  /**
   * Admin: Get verification statistics
   */
  async getVerificationStatistics(): Promise<{
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    approvalRate: number;
    recentApplications: VerificationApplication[];
  }> {
    try {
      const allAppsSnapshot = await getDocs(collection(db, 'verificationApplications'));
      const applications = allAppsSnapshot.docs.map(doc => doc.data() as VerificationApplication);

      const pending = applications.filter(app => app.status === 'pending').length;
      const approved = applications.filter(app => app.status === 'approved').length;
      const rejected = applications.filter(app => app.status === 'rejected').length;
      const total = applications.length;

      const approvalRate = total > 0 ? Math.round((approved / (approved + rejected)) * 100) : 0;

      // Get recent applications (last 10)
      const recentApplications = applications
        .sort((a, b) => b.appliedAt.toMillis() - a.appliedAt.toMillis())
        .slice(0, 10);

      return {
        totalApplications: total,
        pendingApplications: pending,
        approvedApplications: approved,
        rejectedApplications: rejected,
        approvalRate,
        recentApplications
      };
    } catch (error) {
      console.error('Error getting verification statistics:', error);
      return {
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        approvalRate: 0,
        recentApplications: []
      };
    }
  }

  // Helper methods

  private async getUserPendingApplication(userId: string): Promise<VerificationApplication | null> {
    try {
      const q = query(
        collection(db, 'verificationApplications'),
        where(SCHEMA_FIELDS.NOTIFICATION.USER_ID, '==', userId),
        where(SCHEMA_FIELDS.BOOKING.STATUS, '==', 'pending'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      return snapshot.empty ? null : snapshot.docs[0].data() as VerificationApplication;
    } catch (error) {
      console.error('Error getting user pending application:', error);
      return null;
    }
  }

  private calculateProfileCompleteness(userData: any): number {
    const fields = [
      SCHEMA_FIELDS.USER.NAME,
      'bio',
      'profilePicture',
      'location',
      'skills',
      'portfolio',
      'pricing'
    ];

    let completedFields = 0;
    fields.forEach(field => {
      if (userData[field] && 
          (typeof userData[field] !== 'string' || userData[field].trim().length > 0) &&
          (Array.isArray(userData[field]) ? userData[field].length > 0 : true)) {
        completedFields++;
      }
    });

    return Math.round((completedFields / fields.length) * 100);
  }

  private async getCompletedBookingsCount(userId: string): Promise<number> {
    try {
      // This could query actual bookings collection
      // For now, estimate from XP transactions
      const xpHistory = await xpService.getUserXPHistory(userId, 1000);
      const bookingCompletions = xpHistory.filter(tx => tx.event === 'bookingCompleted');
      return bookingCompletions.length;
    } catch (error) {
      console.error('Error getting completed bookings count:', error);
      return 0;
    }
  }

  private async getRecentViolationsCount(userId: string): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.criteria.violationLookbackDays);

      const q = query(
        collection(db, 'userViolations'),
        where(SCHEMA_FIELDS.NOTIFICATION.USER_ID, '==', userId),
        where(SCHEMA_FIELDS.USER.CREATED_AT, '>=', Timestamp.fromDate(cutoffDate))
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting recent violations count:', error);
      return 0;
    }
  }

  private async logVerificationActivity(
    userId: string, 
    action: string, 
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      await setDoc(doc(collection(db, 'verificationActivityLog')), {
        userId,
        action,
        metadata,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error logging verification activity:', error);
    }
  }
}

// Export singleton instance
export const verificationService = VerificationService.getInstance();
