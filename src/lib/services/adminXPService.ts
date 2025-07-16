import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  updateDoc,
  addDoc,
  serverTimestamp,
  writeBatch,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AdminXPOperation {
  id?: string;
  targetUserId: string;
  targetUserEmail?: string;
  targetUserName?: string;
  operationType: 'award' | 'deduct' | 'set';
  amount: number;
  reason: string;
  adminId: string;
  adminEmail: string;
  timestamp: any;
  oldXP?: number;
  newXP?: number;
}

export interface UserXPHistory {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  totalXP: number;
  dailyXP: number;
  tier: string;
  lastUpdated: any;
  operations: AdminXPOperation[];
}

export interface BulkXPOperation {
  userIds: string[];
  amount: number;
  reason: string;
  operationType: 'award' | 'deduct';
}

export class AdminXPService {
  private static instance: AdminXPService;

  static getInstance(): AdminXPService {
    if (!AdminXPService.instance) {
      AdminXPService.instance = new AdminXPService();
    }
    return AdminXPService.instance;
  }

  /**
   * Get user XP data for admin view
   */
  async getUserXPData(userId: string): Promise<UserXPHistory | null> {
    try {
      const userProgressDoc = await getDoc(doc(db, 'userProgress', userId));
      if (!userProgressDoc.exists()) return null;

      const userProgress = userProgressDoc.data();
      
      // Get user profile for display info
      const profileDoc = await getDoc(doc(db, 'profiles', userId));
      const profile = profileDoc.data();

      // Get admin operations for this user
      const operationsQuery = query(
        collection(db, 'adminXPOperations'),
        where('targetUserId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const operationsSnapshot = await getDocs(operationsQuery);
      const operations = operationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminXPOperation[];

      return {
        id: userId,
        userId,
        userEmail: profile?.email,
        userName: profile?.name,
        totalXP: userProgress.totalXP || 0,
        dailyXP: userProgress.dailyXP || 0,
        tier: userProgress.currentTier || 'Standard',
        lastUpdated: userProgress.lastUpdated,
        operations
      };
    } catch (error) {
      console.error('Error fetching user XP data:', error);
      throw new Error('Failed to fetch user XP data');
    }
  }

  /**
   * Manually award XP to a user
   */
  async awardXP(
    targetUserId: string,
    amount: number,
    reason: string,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    if (amount <= 0) throw new Error('Amount must be positive');
    if (!reason.trim()) throw new Error('Reason is required');

    const batch = writeBatch(db);

    try {
      // Get current user progress
      const userProgressRef = doc(db, 'userProgress', targetUserId);
      const userProgressDoc = await getDoc(userProgressRef);
      
      if (!userProgressDoc.exists()) {
        throw new Error('User progress not found');
      }

      const currentData = userProgressDoc.data();
      const oldXP = currentData.totalXP || 0;
      const newXP = oldXP + amount;

      // Update user progress
      batch.update(userProgressRef, {
        totalXP: newXP,
        lastUpdated: serverTimestamp()
      });

      // Log the admin operation
      const operationRef = doc(collection(db, 'adminXPOperations'));
      const operation: AdminXPOperation = {
        targetUserId,
        operationType: 'award',
        amount,
        reason,
        adminId,
        adminEmail,
        timestamp: serverTimestamp(),
        oldXP,
        newXP
      };
      batch.set(operationRef, operation);

      // Also log in XP audit trail
      const auditRef = doc(collection(db, 'xpAuditLog'));
      batch.set(auditRef, {
        userId: targetUserId,
        action: 'admin_award',
        xpChange: amount,
        details: { reason, adminId, adminEmail },
        timestamp: serverTimestamp(),
        metadata: { oldXP, newXP }
      });

      await batch.commit();
    } catch (error) {
      console.error('Error awarding XP:', error);
      throw new Error('Failed to award XP');
    }
  }

  /**
   * Manually deduct XP from a user
   */
  async deductXP(
    targetUserId: string,
    amount: number,
    reason: string,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    if (amount <= 0) throw new Error('Amount must be positive');
    if (!reason.trim()) throw new Error('Reason is required');

    const batch = writeBatch(db);

    try {
      // Get current user progress
      const userProgressRef = doc(db, 'userProgress', targetUserId);
      const userProgressDoc = await getDoc(userProgressRef);
      
      if (!userProgressDoc.exists()) {
        throw new Error('User progress not found');
      }

      const currentData = userProgressDoc.data();
      const oldXP = currentData.totalXP || 0;
      const newXP = Math.max(0, oldXP - amount); // Don't allow negative XP

      // Update user progress
      batch.update(userProgressRef, {
        totalXP: newXP,
        lastUpdated: serverTimestamp()
      });

      // Log the admin operation
      const operationRef = doc(collection(db, 'adminXPOperations'));
      const operation: AdminXPOperation = {
        targetUserId,
        operationType: 'deduct',
        amount,
        reason,
        adminId,
        adminEmail,
        timestamp: serverTimestamp(),
        oldXP,
        newXP
      };
      batch.set(operationRef, operation);

      // Also log in XP audit trail
      const auditRef = doc(collection(db, 'xpAuditLog'));
      batch.set(auditRef, {
        userId: targetUserId,
        action: 'admin_deduct',
        xpChange: -amount,
        details: { reason, adminId, adminEmail },
        timestamp: serverTimestamp(),
        metadata: { oldXP, newXP }
      });

      await batch.commit();
    } catch (error) {
      console.error('Error deducting XP:', error);
      throw new Error('Failed to deduct XP');
    }
  }

  /**
   * Set user XP to a specific value
   */
  async setXP(
    targetUserId: string,
    amount: number,
    reason: string,
    adminId: string,
    adminEmail: string
  ): Promise<void> {
    if (amount < 0) throw new Error('Amount cannot be negative');
    if (!reason.trim()) throw new Error('Reason is required');

    const batch = writeBatch(db);

    try {
      // Get current user progress
      const userProgressRef = doc(db, 'userProgress', targetUserId);
      const userProgressDoc = await getDoc(userProgressRef);
      
      if (!userProgressDoc.exists()) {
        throw new Error('User progress not found');
      }

      const currentData = userProgressDoc.data();
      const oldXP = currentData.totalXP || 0;
      const newXP = amount;

      // Update user progress
      batch.update(userProgressRef, {
        totalXP: newXP,
        lastUpdated: serverTimestamp()
      });

      // Log the admin operation
      const operationRef = doc(collection(db, 'adminXPOperations'));
      const operation: AdminXPOperation = {
        targetUserId,
        operationType: 'set',
        amount,
        reason,
        adminId,
        adminEmail,
        timestamp: serverTimestamp(),
        oldXP,
        newXP
      };
      batch.set(operationRef, operation);

      // Also log in XP audit trail
      const auditRef = doc(collection(db, 'xpAuditLog'));
      batch.set(auditRef, {
        userId: targetUserId,
        action: 'admin_set',
        xpChange: newXP - oldXP,
        details: { reason, adminId, adminEmail },
        timestamp: serverTimestamp(),
        metadata: { oldXP, newXP }
      });

      await batch.commit();
    } catch (error) {
      console.error('Error setting XP:', error);
      throw new Error('Failed to set XP');
    }
  }

  /**
   * Bulk award XP to multiple users
   */
  async bulkAwardXP(operation: BulkXPOperation, adminId: string, adminEmail: string): Promise<void> {
    if (operation.userIds.length === 0) throw new Error('No users selected');
    if (operation.amount <= 0) throw new Error('Amount must be positive');
    if (!operation.reason.trim()) throw new Error('Reason is required');

    const batch = writeBatch(db);
    let operationCount = 0;

    try {
      for (const userId of operation.userIds) {
        // Firestore batch limit is 500 operations
        if (operationCount >= 400) {
          await batch.commit();
          // Start a new batch
          const newBatch = writeBatch(db);
          operationCount = 0;
        }

        // Get current user progress
        const userProgressRef = doc(db, 'userProgress', userId);
        const userProgressDoc = await getDoc(userProgressRef);
        
        if (userProgressDoc.exists()) {
          const currentData = userProgressDoc.data();
          const oldXP = currentData.totalXP || 0;
          const newXP = operation.operationType === 'award' 
            ? oldXP + operation.amount 
            : Math.max(0, oldXP - operation.amount);

          // Update user progress
          batch.update(userProgressRef, {
            totalXP: newXP,
            lastUpdated: serverTimestamp()
          });

          // Log the admin operation
          const operationRef = doc(collection(db, 'adminXPOperations'));
          const adminOperation: AdminXPOperation = {
            targetUserId: userId,
            operationType: operation.operationType,
            amount: operation.amount,
            reason: `BULK: ${operation.reason}`,
            adminId,
            adminEmail,
            timestamp: serverTimestamp(),
            oldXP,
            newXP
          };
          batch.set(operationRef, adminOperation);

          operationCount += 2; // Two operations per user
        }
      }

      await batch.commit();
    } catch (error) {
      console.error('Error performing bulk XP operation:', error);
      throw new Error('Failed to perform bulk XP operation');
    }
  }

  /**
   * Get admin operation history with pagination
   */
  async getAdminOperationHistory(
    lastDoc?: DocumentSnapshot,
    limitCount: number = 50
  ): Promise<{ operations: AdminXPOperation[], lastDoc: DocumentSnapshot | null }> {
    try {
      let q = query(
        collection(db, 'adminXPOperations'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(
          collection(db, 'adminXPOperations'),
          orderBy('timestamp', 'desc'),
          startAfter(lastDoc),
          limit(limitCount)
        );
      }

      const snapshot = await getDocs(q);
      const operations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminXPOperation[];

      const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

      return { operations, lastDoc: newLastDoc };
    } catch (error) {
      console.error('Error fetching admin operation history:', error);
      throw new Error('Failed to fetch operation history');
    }
  }

  /**
   * Search users for XP management
   */
  async searchUsers(searchTerm: string, limitCount: number = 20): Promise<any[]> {
    if (!searchTerm.trim()) return [];

    try {
      // Search by email (assuming most searches will be by email)
      const emailQuery = query(
        collection(db, 'profiles'),
        where(SCHEMA_FIELDS.USER.EMAIL, '>=', searchTerm.toLowerCase()),
        where(SCHEMA_FIELDS.USER.EMAIL, '<=', searchTerm.toLowerCase() + '\uf8ff'),
        limit(limitCount)
      );

      const emailSnapshot = await getDocs(emailQuery);
      const users = emailSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));

      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  }

  /**
   * Get XP statistics for admin dashboard
   */
  async getXPStatistics(): Promise<{
    totalActiveUsers: number;
    totalXPAwarded: number;
    averageXP: number;
    topUsers: any[];
    recentOperations: AdminXPOperation[];
  }> {
    try {
      // Get all user progress data
      const userProgressSnapshot = await getDocs(collection(db, 'userProgress'));
      const allUsers = userProgressSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const totalActiveUsers = allUsers.length;
      const totalXPAwarded = allUsers.reduce((sum, user) => sum + (user.totalXP || 0), 0);
      const averageXP = totalActiveUsers > 0 ? totalXPAwarded / totalActiveUsers : 0;

      // Get top users
      const topUsers = allUsers
        .sort((a, b) => (b.totalXP || 0) - (a.totalXP || 0))
        .slice(0, 10);

      // Get recent admin operations
      const recentOpsQuery = query(
        collection(db, 'adminXPOperations'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const recentOpsSnapshot = await getDocs(recentOpsQuery);
      const recentOperations = recentOpsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminXPOperation[];

      return {
        totalActiveUsers,
        totalXPAwarded,
        averageXP,
        topUsers,
        recentOperations
      };
    } catch (error) {
      console.error('Error fetching XP statistics:', error);
      throw new Error('Failed to fetch XP statistics');
    }
  }
}

export const adminXPService = AdminXPService.getInstance();
