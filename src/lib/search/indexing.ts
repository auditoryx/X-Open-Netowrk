import { admin } from '@/lib/firebase-admin';
import { getAlgoliaService } from './algolia';
import { UnifiedUser, validateUnifiedUser } from '@/lib/unified-models/user';

/**
 * Search Indexing Service
 * 
 * Handles real-time indexing of Firestore documents to Algolia
 * Used by Firebase Functions and API endpoints to keep search indexes in sync
 */

interface IndexingResult {
  success: boolean;
  indexed: number;
  errors: Array<{ id: string; error: string }>;
}

export class SearchIndexingService {
  private algolia = getAlgoliaService();

  /**
   * Index a single user when created or updated
   */
  async indexUser(uid: string, userData?: any): Promise<void> {
    try {
      let user: UnifiedUser;

      if (userData) {
        // Convert Firestore data to UnifiedUser
        user = this.convertFirestoreUser(uid, userData);
      } else {
        // Fetch user from Firestore
        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        if (!userDoc.exists) {
          throw new Error(`User ${uid} not found`);
        }
        user = this.convertFirestoreUser(uid, userDoc.data()!);
      }

      // Only index active users
      if (!user.isActive) {
        await this.algolia.removeUser(uid);
        return;
      }

      await this.algolia.indexUser(user);
      console.log(`Indexed user ${uid} for search`);
    } catch (error) {
      console.error(`Failed to index user ${uid}:`, error);
      throw error;
    }
  }

  /**
   * Remove user from search index
   */
  async removeUserFromIndex(uid: string): Promise<void> {
    try {
      await this.algolia.removeUser(uid);
      console.log(`Removed user ${uid} from search index`);
    } catch (error) {
      console.error(`Failed to remove user ${uid} from index:`, error);
      throw error;
    }
  }

  /**
   * Index a single service when created or updated
   */
  async indexService(serviceId: string, serviceData?: any): Promise<void> {
    try {
      let service: any;

      if (serviceData) {
        service = this.convertFirestoreService(serviceId, serviceData);
      } else {
        // Fetch service from Firestore
        const serviceDoc = await admin.firestore().collection('services').doc(serviceId).get();
        if (!serviceDoc.exists) {
          throw new Error(`Service ${serviceId} not found`);
        }
        service = this.convertFirestoreService(serviceId, serviceDoc.data()!);
      }

      // Only index active services
      if (!service.isActive) {
        await this.algolia.removeService(serviceId);
        return;
      }

      // Fetch creator information for enhanced search
      const creatorDoc = await admin.firestore().collection('users').doc(service.creatorId).get();
      if (creatorDoc.exists) {
        const creator = this.convertFirestoreUser(service.creatorId, creatorDoc.data()!);
        service.creatorName = creator.displayName || creator.name;
        service.creatorRole = creator.role;
        service.creatorTier = creator.tier;
        service.creatorRating = creator.averageRating;
      }

      await this.algolia.indexService(service);
      console.log(`Indexed service ${serviceId} for search`);
    } catch (error) {
      console.error(`Failed to index service ${serviceId}:`, error);
      throw error;
    }
  }

  /**
   * Remove service from search index
   */
  async removeServiceFromIndex(serviceId: string): Promise<void> {
    try {
      await this.algolia.removeService(serviceId);
      console.log(`Removed service ${serviceId} from search index`);
    } catch (error) {
      console.error(`Failed to remove service ${serviceId} from index:`, error);
      throw error;
    }
  }

  /**
   * Bulk index all users from Firestore
   */
  async bulkIndexUsers(limit: number = 1000): Promise<IndexingResult> {
    const result: IndexingResult = {
      success: true,
      indexed: 0,
      errors: [],
    };

    try {
      console.log('Starting bulk user indexing...');
      
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .where('isActive', '==', true)
        .limit(limit)
        .get();

      const users: UnifiedUser[] = [];
      
      for (const doc of usersSnapshot.docs) {
        try {
          const user = this.convertFirestoreUser(doc.id, doc.data());
          users.push(user);
        } catch (error) {
          result.errors.push({
            id: doc.id,
            error: `Failed to convert user data: ${error}`,
          });
        }
      }

      if (users.length > 0) {
        await this.algolia.bulkIndexUsers(users);
        result.indexed = users.length;
      }

      console.log(`Bulk indexed ${result.indexed} users with ${result.errors.length} errors`);
      
      if (result.errors.length > 0) {
        result.success = false;
        console.error('Bulk indexing errors:', result.errors);
      }

    } catch (error) {
      console.error('Bulk indexing failed:', error);
      result.success = false;
      result.errors.push({
        id: 'system',
        error: `System error: ${error}`,
      });
    }

    return result;
  }

  /**
   * Bulk index all services from Firestore
   */
  async bulkIndexServices(limit: number = 1000): Promise<IndexingResult> {
    const result: IndexingResult = {
      success: true,
      indexed: 0,
      errors: [],
    };

    try {
      console.log('Starting bulk service indexing...');
      
      const servicesSnapshot = await admin.firestore()
        .collection('services')
        .where('isActive', '==', true)
        .limit(limit)
        .get();

      const batch = admin.firestore().batch();
      const services: any[] = [];
      
      for (const doc of servicesSnapshot.docs) {
        try {
          const service = this.convertFirestoreService(doc.id, doc.data());
          
          // Fetch creator info
          const creatorDoc = await admin.firestore().collection('users').doc(service.creatorId).get();
          if (creatorDoc.exists) {
            const creator = this.convertFirestoreUser(service.creatorId, creatorDoc.data()!);
            service.creatorName = creator.displayName || creator.name;
            service.creatorRole = creator.role;
            service.creatorTier = creator.tier;
            service.creatorRating = creator.averageRating;
          }
          
          services.push(service);
        } catch (error) {
          result.errors.push({
            id: doc.id,
            error: `Failed to convert service data: ${error}`,
          });
        }
      }

      // Index services in batches
      const batchSize = 100;
      for (let i = 0; i < services.length; i += batchSize) {
        const batch = services.slice(i, i + batchSize);
        try {
          await Promise.all(batch.map(service => this.algolia.indexService(service)));
          result.indexed += batch.length;
        } catch (error) {
          result.errors.push({
            id: `batch-${i}`,
            error: `Batch indexing failed: ${error}`,
          });
        }
      }

      console.log(`Bulk indexed ${result.indexed} services with ${result.errors.length} errors`);
      
      if (result.errors.length > 0) {
        result.success = false;
        console.error('Bulk service indexing errors:', result.errors);
      }

    } catch (error) {
      console.error('Bulk service indexing failed:', error);
      result.success = false;
      result.errors.push({
        id: 'system',
        error: `System error: ${error}`,
      });
    }

    return result;
  }

  /**
   * Setup search indexes with proper configuration
   */
  async setupIndexes(): Promise<void> {
    try {
      await this.algolia.configureIndexes();
      console.log('Search indexes configured successfully');
    } catch (error) {
      console.error('Failed to configure search indexes:', error);
      throw error;
    }
  }

  /**
   * Clear all search indexes (use with extreme caution)
   */
  async clearAllIndexes(): Promise<void> {
    try {
      await this.algolia.clearIndexes();
      console.log('All search indexes cleared');
    } catch (error) {
      console.error('Failed to clear search indexes:', error);
      throw error;
    }
  }

  /**
   * Health check for search service
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    try {
      // Try a simple search to verify service is working
      const testResult = await this.algolia.searchUsers('test', {}, { hitsPerPage: 1 });
      
      return {
        status: 'healthy',
        details: {
          processingTimeMS: testResult.processingTimeMS,
          nbHits: testResult.nbHits,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Convert Firestore user data to UnifiedUser
   */
  private convertFirestoreUser(uid: string, data: any): UnifiedUser {
    const userData = {
      ...data,
      uid,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastSignIn: data.lastSignIn?.toDate(),
      verifiedAt: data.verifiedAt?.toDate(),
      migratedAt: data.migratedAt?.toDate(),
      deletedAt: data.deletedAt?.toDate(),
    };

    return validateUnifiedUser(userData);
  }

  /**
   * Convert Firestore service data
   */
  private convertFirestoreService(id: string, data: any): any {
    return {
      ...data,
      id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),
    };
  }

  /**
   * Handle Firestore document change for indexing
   */
  async handleDocumentChange(
    change: any,
    collection: 'users' | 'services'
  ): Promise<void> {
    const { before, after } = change;
    const docId = after.id || before.id;

    try {
      if (!after.exists) {
        // Document deleted
        if (collection === 'users') {
          await this.removeUserFromIndex(docId);
        } else {
          await this.removeServiceFromIndex(docId);
        }
      } else {
        // Document created or updated
        const data = after.data();
        
        if (collection === 'users') {
          await this.indexUser(docId, data);
        } else {
          await this.indexService(docId, data);
        }
      }
    } catch (error) {
      console.error(`Failed to handle ${collection} document change for ${docId}:`, error);
      // Don't throw here to avoid blocking the Firestore operation
    }
  }
}

// Singleton instance
let indexingService: SearchIndexingService | null = null;

export function getSearchIndexingService(): SearchIndexingService {
  if (!indexingService) {
    indexingService = new SearchIndexingService();
  }
  return indexingService;
}

export default SearchIndexingService;