import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadPortfolioMedia } from './portfolioService';

export interface CaseStudy {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  
  // Project details
  client: {
    name: string;
    industry?: string;
    anonymous?: boolean;
  };
  
  challenge: string;
  solution: string;
  results: string;
  
  // Media assets
  beforeImages?: string[];
  afterImages?: string[];
  processImages?: string[];
  videoUrl?: string;
  
  // Metrics
  metrics: {
    duration: string; // e.g., "2 weeks"
    budget?: string;
    roi?: string;
    satisfaction?: number; // 1-5 rating
  };
  
  // Testimonial
  testimonial?: {
    quote: string;
    clientName: string;
    clientTitle?: string;
    clientPhoto?: string;
  };
  
  // Status and visibility
  isPublic: boolean;
  isFeatured: boolean;
  status: 'draft' | 'published' | 'archived';
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
  
  // Analytics
  views: number;
  likes: number;
  shares: number;
}

export interface CaseStudyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  sections: {
    id: string;
    type: 'text' | 'image' | 'video' | 'metrics' | 'testimonial';
    label: string;
    required: boolean;
  }[];
}

class CaseStudyService {
  private collectionName = 'caseStudies';
  private templatesCollection = 'caseStudyTemplates';

  // Case Study CRUD operations
  async createCaseStudy(creatorId: string, data: Partial<CaseStudy>): Promise<string> {
    try {
      const caseStudyId = doc(collection(db, this.collectionName)).id;
      
      const caseStudy: CaseStudy = {
        id: caseStudyId,
        creatorId,
        title: data.title || 'Untitled Case Study',
        description: data.description || '',
        category: data.category || 'General',
        tags: data.tags || [],
        client: data.client || { name: 'Anonymous Client', anonymous: true },
        challenge: data.challenge || '',
        solution: data.solution || '',
        results: data.results || '',
        beforeImages: data.beforeImages || [],
        afterImages: data.afterImages || [],
        processImages: data.processImages || [],
        videoUrl: data.videoUrl,
        metrics: data.metrics || { duration: '' },
        testimonial: data.testimonial,
        isPublic: data.isPublic ?? true,
        isFeatured: data.isFeatured ?? false,
        status: data.status || 'draft',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        views: 0,
        likes: 0,
        shares: 0,
      };

      await setDoc(doc(db, this.collectionName, caseStudyId), caseStudy);
      return caseStudyId;
    } catch (error) {
      console.error('Error creating case study:', error);
      throw new Error('Failed to create case study');
    }
  }

  async getCaseStudy(id: string): Promise<CaseStudy | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as CaseStudy;
      }
      return null;
    } catch (error) {
      console.error('Error fetching case study:', error);
      return null;
    }
  }

  async updateCaseStudy(id: string, updates: Partial<CaseStudy>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating case study:', error);
      throw new Error('Failed to update case study');
    }
  }

  async deleteCaseStudy(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
    } catch (error) {
      console.error('Error deleting case study:', error);
      throw new Error('Failed to delete case study');
    }
  }

  // Query operations
  async getCreatorCaseStudies(
    creatorId: string, 
    filters?: {
      status?: 'draft' | 'published' | 'archived';
      category?: string;
      featured?: boolean;
      limit?: number;
    }
  ): Promise<CaseStudy[]> {
    try {
      const queryConstraints = [
        where(SCHEMA_FIELDS.SERVICE.CREATOR_ID, '==', creatorId),
        orderBy(SCHEMA_FIELDS.USER.UPDATED_AT, 'desc')
      ];

      if (filters?.status) {
        queryConstraints.splice(-1, 0, where(SCHEMA_FIELDS.BOOKING.STATUS, '==', filters.status));
      }
      
      if (filters?.category) {
        queryConstraints.splice(-1, 0, where(SCHEMA_FIELDS.SERVICE.CATEGORY, '==', filters.category));
      }
      
      if (filters?.featured !== undefined) {
        queryConstraints.splice(-1, 0, where('isFeatured', '==', filters.featured));
      }

      if (filters?.limit) {
        queryConstraints.push(limit(filters.limit));
      }

      const q = query(collection(db, this.collectionName), ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CaseStudy[];
    } catch (error) {
      console.error('Error fetching creator case studies:', error);
      return [];
    }
  }

  async getPublicCaseStudies(filters?: {
    category?: string;
    featured?: boolean;
    limit?: number;
  }): Promise<CaseStudy[]> {
    try {
      const queryConstraints = [
        where('isPublic', '==', true),
        where(SCHEMA_FIELDS.BOOKING.STATUS, '==', 'published'),
        orderBy('publishedAt', 'desc')
      ];

      if (filters?.category) {
        queryConstraints.splice(-1, 0, where(SCHEMA_FIELDS.SERVICE.CATEGORY, '==', filters.category));
      }
      
      if (filters?.featured !== undefined) {
        queryConstraints.splice(-1, 0, where('isFeatured', '==', filters.featured));
      }

      if (filters?.limit) {
        queryConstraints.push(limit(filters.limit));
      }

      const q = query(collection(db, this.collectionName), ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CaseStudy[];
    } catch (error) {
      console.error('Error fetching public case studies:', error);
      return [];
    }
  }

  // Media management
  async uploadCaseStudyMedia(
    caseStudyId: string, 
    files: File[], 
    type: 'before' | 'after' | 'process'
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => 
        uploadPortfolioMedia(file, `case-studies/${caseStudyId}/${type}`)
      );
      
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading case study media:', error);
      throw new Error('Failed to upload media');
    }
  }

  // Publishing operations
  async publishCaseStudy(id: string): Promise<void> {
    try {
      await this.updateCaseStudy(id, {
        status: 'published',
        publishedAt: serverTimestamp() as Timestamp,
      });
    } catch (error) {
      console.error('Error publishing case study:', error);
      throw new Error('Failed to publish case study');
    }
  }

  async unpublishCaseStudy(id: string): Promise<void> {
    try {
      await this.updateCaseStudy(id, {
        status: 'draft',
        publishedAt: undefined,
      });
    } catch (error) {
      console.error('Error unpublishing case study:', error);
      throw new Error('Failed to unpublish case study');
    }
  }

  async toggleFeatured(id: string, featured: boolean): Promise<void> {
    try {
      await this.updateCaseStudy(id, { isFeatured: featured });
    } catch (error) {
      console.error('Error toggling featured status:', error);
      throw new Error('Failed to update featured status');
    }
  }

  // Analytics operations
  async incrementViews(id: string): Promise<void> {
    try {
      const caseStudy = await this.getCaseStudy(id);
      if (caseStudy) {
        await this.updateCaseStudy(id, { views: caseStudy.views + 1 });
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  async toggleLike(id: string, increment: boolean): Promise<void> {
    try {
      const caseStudy = await this.getCaseStudy(id);
      if (caseStudy) {
        const newLikes = increment ? caseStudy.likes + 1 : Math.max(0, caseStudy.likes - 1);
        await this.updateCaseStudy(id, { likes: newLikes });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }

  // Template operations
  async getCaseStudyTemplates(): Promise<CaseStudyTemplate[]> {
    try {
      const q = query(collection(db, this.templatesCollection), orderBy(SCHEMA_FIELDS.USER.NAME));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CaseStudyTemplate[];
    } catch (error) {
      console.error('Error fetching case study templates:', error);
      return this.getDefaultTemplates();
    }
  }

  private getDefaultTemplates(): CaseStudyTemplate[] {
    return [
      {
        id: 'standard',
        name: 'Standard Case Study',
        description: 'A comprehensive case study template',
        category: 'General',
        sections: [
          { id: 'overview', type: SCHEMA_FIELDS.REVIEW.TEXT, label: 'Project Overview', required: true },
          { id: 'challenge', type: SCHEMA_FIELDS.REVIEW.TEXT, label: 'Challenge', required: true },
          { id: 'solution', type: SCHEMA_FIELDS.REVIEW.TEXT, label: 'Solution', required: true },
          { id: 'before', type: 'image', label: 'Before Images', required: false },
          { id: 'process', type: 'image', label: 'Process Images', required: false },
          { id: 'after', type: 'image', label: 'After Images', required: false },
          { id: 'results', type: SCHEMA_FIELDS.REVIEW.TEXT, label: 'Results', required: true },
          { id: 'metrics', type: 'metrics', label: 'Key Metrics', required: false },
          { id: 'testimonial', type: 'testimonial', label: 'Client Testimonial', required: false },
        ],
      },
      {
        id: 'creative',
        name: 'Creative Portfolio',
        description: 'Perfect for design and visual projects',
        category: 'Creative',
        sections: [
          { id: 'concept', type: SCHEMA_FIELDS.REVIEW.TEXT, label: 'Creative Concept', required: true },
          { id: 'inspiration', type: 'image', label: 'Inspiration Board', required: false },
          { id: 'process', type: 'image', label: 'Design Process', required: true },
          { id: 'final', type: 'image', label: 'Final Results', required: true },
          { id: 'video', type: 'video', label: 'Demo Video', required: false },
          { id: 'feedback', type: 'testimonial', label: 'Client Feedback', required: false },
        ],
      },
      {
        id: 'technical',
        name: 'Technical Implementation',
        description: 'For development and technical projects',
        category: 'Technical',
        sections: [
          { id: 'requirements', type: SCHEMA_FIELDS.REVIEW.TEXT, label: 'Requirements', required: true },
          { id: 'architecture', type: 'image', label: 'System Architecture', required: false },
          { id: 'implementation', type: SCHEMA_FIELDS.REVIEW.TEXT, label: 'Implementation', required: true },
          { id: 'challenges', type: SCHEMA_FIELDS.REVIEW.TEXT, label: 'Technical Challenges', required: false },
          { id: 'results', type: SCHEMA_FIELDS.REVIEW.TEXT, label: 'Results & Impact', required: true },
          { id: 'metrics', type: 'metrics', label: 'Performance Metrics', required: false },
        ],
      },
    ];
  }

  // Analytics for case studies
  async getCaseStudyAnalytics(creatorId: string): Promise<{
    totalCaseStudies: number;
    publishedCaseStudies: number;
    totalViews: number;
    totalLikes: number;
    avgViewsPerCaseStudy: number;
    featuredCaseStudies: number;
    categoryBreakdown: { [category: string]: number };
    performanceMetrics: {
      topPerforming: CaseStudy[];
      recentActivity: CaseStudy[];
    };
  }> {
    try {
      const caseStudies = await this.getCreatorCaseStudies(creatorId);
      const publishedCaseStudies = caseStudies.filter(cs => cs.status === 'published');
      
      const totalViews = caseStudies.reduce((sum, cs) => sum + cs.views, 0);
      const totalLikes = caseStudies.reduce((sum, cs) => sum + cs.likes, 0);
      
      const categoryBreakdown = caseStudies.reduce((acc, cs) => {
        acc[cs.category] = (acc[cs.category] || 0) + 1;
        return acc;
      }, {} as { [category: string]: number });

      const topPerforming = [...caseStudies]
        .sort((a, b) => (b.views + b.likes * 2) - (a.views + a.likes * 2))
        .slice(0, 5);

      const recentActivity = [...caseStudies]
        .sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())
        .slice(0, 5);

      return {
        totalCaseStudies: caseStudies.length,
        publishedCaseStudies: publishedCaseStudies.length,
        totalViews,
        totalLikes,
        avgViewsPerCaseStudy: caseStudies.length > 0 ? totalViews / caseStudies.length : 0,
        featuredCaseStudies: caseStudies.filter(cs => cs.isFeatured).length,
        categoryBreakdown,
        performanceMetrics: {
          topPerforming,
          recentActivity,
        },
      };
    } catch (error) {
      console.error('Error getting case study analytics:', error);
      throw new Error('Failed to get case study analytics');
    }
  }
}

export const caseStudyService = new CaseStudyService();
