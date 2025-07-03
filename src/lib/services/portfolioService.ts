// Portfolio Management Service for AuditoryX
// Handles creator portfolio, media uploads, and showcase features

import {
  getFirestore,
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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { app } from '@/lib/firebase';

export interface PortfolioItem {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: 'audio' | 'video' | 'image' | 'document';
  mediaUrl: string;
  thumbnailUrl?: string;
  tags: string[];
  isFeatured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: {
    duration?: number; // for audio/video
    fileSize?: number;
    mimeType?: string;
    dimensions?: { width: number; height: number };
  };
}

export interface ProjectCaseStudy {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  clientName?: string;
  projectType: string;
  beforeMediaUrl?: string;
  afterMediaUrl: string;
  testimonial?: {
    text: string;
    clientName: string;
    rating: number;
  };
  tags: string[];
  isPublic: boolean;
  createdAt: Timestamp;
  metrics?: {
    viewCount: number;
    likeCount: number;
    shareCount: number;
  };
}

export interface CreatorShowcase {
  id: string;
  creatorId: string;
  bio: string;
  skills: string[];
  expertise: string[];
  featuredWorkIds: string[];
  caseStudyIds: string[];
  socialLinks: {
    website?: string;
    instagram?: string;
    youtube?: string;
    soundcloud?: string;
    spotify?: string;
  };
  achievements: Array<{
    title: string;
    description: string;
    date: string;
    icon?: string;
  }>;
  availability: {
    isAvailable: boolean;
    nextAvailableDate?: Timestamp;
    responseTime: string;
  };
  updatedAt: Timestamp;
}

export class PortfolioService {
  private db = getFirestore(app);
  private storage = getStorage(app);

  // Portfolio Item Management
  async createPortfolioItem(
    creatorId: string, 
    file: File, 
    metadata: Omit<PortfolioItem, 'id' | 'creatorId' | 'mediaUrl' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      // Upload file to Firebase Storage
      const fileRef = ref(this.storage, `portfolio/${creatorId}/${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(fileRef, file);
      const mediaUrl = await getDownloadURL(uploadResult.ref);

      // Generate thumbnail for videos/images if needed
      let thumbnailUrl;
      if (metadata.category === 'video' || metadata.category === 'image') {
        thumbnailUrl = await this.generateThumbnail(file, creatorId);
      }

      // Create portfolio item document
      const portfolioRef = doc(collection(this.db, 'portfolio'));
      const portfolioItem: PortfolioItem = {
        id: portfolioRef.id,
        creatorId,
        ...metadata,
        mediaUrl,
        thumbnailUrl,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        metadata: {
          ...metadata.metadata,
          fileSize: file.size,
          mimeType: file.type
        }
      };

      await setDoc(portfolioRef, portfolioItem);
      return portfolioRef.id;
    } catch (error) {
      console.error('Error creating portfolio item:', error);
      throw new Error('Failed to create portfolio item');
    }
  }

  async updatePortfolioItem(itemId: string, updates: Partial<PortfolioItem>): Promise<void> {
    const itemRef = doc(this.db, 'portfolio', itemId);
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  async deletePortfolioItem(itemId: string): Promise<void> {
    const itemRef = doc(this.db, 'portfolio', itemId);
    const itemDoc = await getDoc(itemRef);
    
    if (itemDoc.exists()) {
      const item = itemDoc.data() as PortfolioItem;
      
      // Delete file from storage
      try {
        const fileRef = ref(this.storage, item.mediaUrl);
        await deleteObject(fileRef);
        
        if (item.thumbnailUrl) {
          const thumbRef = ref(this.storage, item.thumbnailUrl);
          await deleteObject(thumbRef);
        }
      } catch (error) {
        console.warn('Failed to delete storage files:', error);
      }
      
      // Delete document
      await deleteDoc(itemRef);
    }
  }

  async getPortfolioItems(creatorId: string, category?: string): Promise<PortfolioItem[]> {
    let portfolioQuery = query(
      collection(this.db, 'portfolio'),
      where('creatorId', '==', creatorId),
      orderBy('isFeatured', 'desc'),
      orderBy('createdAt', 'desc')
    );

    if (category) {
      portfolioQuery = query(
        collection(this.db, 'portfolio'),
        where('creatorId', '==', creatorId),
        where('category', '==', category),
        orderBy('isFeatured', 'desc'),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(portfolioQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem));
  }

  async toggleFeaturedItem(itemId: string, isFeatured: boolean): Promise<void> {
    await this.updatePortfolioItem(itemId, { isFeatured });
  }

  // Case Study Management
  async createCaseStudy(
    creatorId: string,
    caseStudyData: Omit<ProjectCaseStudy, 'id' | 'creatorId' | 'createdAt' | 'metrics'>
  ): Promise<string> {
    const caseStudyRef = doc(collection(this.db, 'caseStudies'));
    const caseStudy: ProjectCaseStudy = {
      id: caseStudyRef.id,
      creatorId,
      ...caseStudyData,
      createdAt: serverTimestamp() as Timestamp,
      metrics: {
        viewCount: 0,
        likeCount: 0,
        shareCount: 0
      }
    };

    await setDoc(caseStudyRef, caseStudy);
    return caseStudyRef.id;
  }

  async getCaseStudies(creatorId: string, isPublic?: boolean): Promise<ProjectCaseStudy[]> {
    let caseStudyQuery = query(
      collection(this.db, 'caseStudies'),
      where('creatorId', '==', creatorId),
      orderBy('createdAt', 'desc')
    );

    if (isPublic !== undefined) {
      caseStudyQuery = query(
        collection(this.db, 'caseStudies'),
        where('creatorId', '==', creatorId),
        where('isPublic', '==', isPublic),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(caseStudyQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectCaseStudy));
  }

  async updateCaseStudy(caseStudyId: string, updates: Partial<ProjectCaseStudy>): Promise<void> {
    const caseStudyRef = doc(this.db, 'caseStudies', caseStudyId);
    await updateDoc(caseStudyRef, updates);
  }

  async incrementCaseStudyMetric(caseStudyId: string, metric: 'viewCount' | 'likeCount' | 'shareCount'): Promise<void> {
    const caseStudyRef = doc(this.db, 'caseStudies', caseStudyId);
    const caseStudyDoc = await getDoc(caseStudyRef);
    
    if (caseStudyDoc.exists()) {
      const caseStudy = caseStudyDoc.data() as ProjectCaseStudy;
      const currentMetrics = caseStudy.metrics || { viewCount: 0, likeCount: 0, shareCount: 0 };
      
      await updateDoc(caseStudyRef, {
        [`metrics.${metric}`]: currentMetrics[metric] + 1
      });
    }
  }

  // Creator Showcase Management
  async updateCreatorShowcase(creatorId: string, showcaseData: Partial<CreatorShowcase>): Promise<void> {
    const showcaseRef = doc(this.db, 'creatorShowcases', creatorId);
    const showcase: Partial<CreatorShowcase> = {
      ...showcaseData,
      id: creatorId,
      creatorId,
      updatedAt: serverTimestamp() as Timestamp
    };

    await setDoc(showcaseRef, showcase, { merge: true });
  }

  async getCreatorShowcase(creatorId: string): Promise<CreatorShowcase | null> {
    const showcaseRef = doc(this.db, 'creatorShowcases', creatorId);
    const showcaseDoc = await getDoc(showcaseRef);
    
    if (showcaseDoc.exists()) {
      return { id: showcaseDoc.id, ...showcaseDoc.data() } as CreatorShowcase;
    }
    return null;
  }

  async updateFeaturedWork(creatorId: string, featuredWorkIds: string[]): Promise<void> {
    await this.updateCreatorShowcase(creatorId, { featuredWorkIds });
  }

  async addAchievement(
    creatorId: string, 
    achievement: CreatorShowcase['achievements'][0]
  ): Promise<void> {
    const showcase = await this.getCreatorShowcase(creatorId);
    const achievements = showcase?.achievements || [];
    achievements.unshift(achievement);
    
    await this.updateCreatorShowcase(creatorId, { achievements });
  }

  // Search and Discovery
  async searchPortfolioItems(
    searchTerm: string, 
    category?: string, 
    tags?: string[]
  ): Promise<PortfolioItem[]> {
    // Basic search implementation - in production, you'd use a proper search service
    let portfolioQuery = query(
      collection(this.db, 'portfolio'),
      orderBy('createdAt', 'desc')
    );

    if (category) {
      portfolioQuery = query(
        collection(this.db, 'portfolio'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(portfolioQuery);
    let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem));

    // Filter by search term and tags (client-side for now)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    if (tags && tags.length > 0) {
      items = items.filter(item => 
        tags.some(tag => item.tags.includes(tag))
      );
    }

    return items;
  }

  async getFeaturedPortfolioItems(limit: number = 12): Promise<PortfolioItem[]> {
    const featuredQuery = query(
      collection(this.db, 'portfolio'),
      where('isFeatured', '==', true),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(featuredQuery);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem))
      .slice(0, limit);
  }

  // Analytics for Portfolio
  async getPortfolioAnalytics(creatorId: string): Promise<{
    totalItems: number;
    itemsByCategory: { [category: string]: number };
    featuredItems: number;
    totalViews: number;
    topPerformingItems: Array<{
      itemId: string;
      title: string;
      views: number;
    }>;
  }> {
    const items = await this.getPortfolioItems(creatorId);
    const caseStudies = await this.getCaseStudies(creatorId);

    const analytics = {
      totalItems: items.length,
      itemsByCategory: items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as { [category: string]: number }),
      featuredItems: items.filter(item => item.isFeatured).length,
      totalViews: caseStudies.reduce((sum, cs) => sum + (cs.metrics?.viewCount || 0), 0),
      topPerformingItems: caseStudies
        .sort((a, b) => (b.metrics?.viewCount || 0) - (a.metrics?.viewCount || 0))
        .slice(0, 5)
        .map(cs => ({
          itemId: cs.id,
          title: cs.title,
          views: cs.metrics?.viewCount || 0
        }))
    };

    return analytics;
  }

  // Helper Methods
  private async generateThumbnail(file: File, creatorId: string): Promise<string | undefined> {
    // This is a placeholder for thumbnail generation
    // In production, you'd use a service like Cloudinary or implement server-side thumbnail generation
    try {
      if (file.type.startsWith('image/')) {
        // For images, we can use the same file as thumbnail (or create a smaller version)
        const thumbnailRef = ref(this.storage, `thumbnails/${creatorId}/${Date.now()}_thumb_${file.name}`);
        const uploadResult = await uploadBytes(thumbnailRef, file);
        return await getDownloadURL(uploadResult.ref);
      }
      
      // For videos, you'd extract a frame and upload it
      // For now, return undefined and handle on the frontend
      return undefined;
    } catch (error) {
      console.warn('Failed to generate thumbnail:', error);
      return undefined;
    }
  }

  // Export portfolio data
  async exportPortfolioData(creatorId: string): Promise<{
    portfolioItems: PortfolioItem[];
    caseStudies: ProjectCaseStudy[];
    showcase: CreatorShowcase | null;
    analytics: any;
  }> {
    const [portfolioItems, caseStudies, showcase, analytics] = await Promise.all([
      this.getPortfolioItems(creatorId),
      this.getCaseStudies(creatorId),
      this.getCreatorShowcase(creatorId),
      this.getPortfolioAnalytics(creatorId)
    ]);

    return {
      portfolioItems,
      caseStudies,
      showcase,
      analytics
    };
  }
}

// Singleton instance
export const portfolioService = new PortfolioService();
