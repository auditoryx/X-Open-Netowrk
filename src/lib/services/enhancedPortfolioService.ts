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
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll 
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

export interface MediaPortfolioItem {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: 'audio' | 'video' | 'image' | 'document';
  subcategory: string; // e.g., 'original-song', 'cover', 'remix', 'live-performance'
  
  // Media files
  primaryMedia: {
    url: string;
    type: string;
    duration?: number; // for audio/video in seconds
    size?: number; // file size in bytes
    metadata?: {
      bitrate?: number;
      sampleRate?: number;
      channels?: number;
      format?: string;
    };
  };
  
  // Additional media
  additionalMedia?: {
    url: string;
    type: 'image' | 'video' | 'audio' | 'document';
    label: string; // e.g., 'Album Cover', 'Music Video', 'Lyrics Sheet'
  }[];
  
  // Before/after examples
  beforeAfter?: {
    before: {
      url: string;
      description: string;
    };
    after: {
      url: string;
      description: string;
    };
    transformationNotes: string;
  };
  
  // Organization
  tags: string[];
  genres?: string[];
  instruments?: string[];
  collaborators?: string[];
  
  // Status and visibility
  isPublic: boolean;
  isFeatured: boolean;
  status: 'draft' | 'published' | 'archived';
  
  // Social proof
  likes: number;
  views: number;
  shares: number;
  comments: Comment[];
  
  // Professional info
  clientInfo?: {
    name: string;
    project: string;
    anonymous: boolean;
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Timestamp;
  likes: number;
  replies?: Comment[];
}

export interface ProjectShowcase {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  
  // Project details
  client: {
    name: string;
    industry?: string;
    website?: string;
    anonymous: boolean;
  };
  
  // Project story
  challenge: string;
  approach: string;
  solution: string;
  results: string;
  
  // Media showcase
  mediaItems: string[]; // Portfolio item IDs
  featuredMedia: string; // Primary showcase item ID
  
  // Success metrics
  metrics: {
    duration: string;
    budget?: string;
    team?: string;
    deliverables: string[];
    successMetrics: {
      metric: string;
      before: string;
      after: string;
      improvement: string;
    }[];
  };
  
  // Testimonial
  testimonial?: {
    quote: string;
    clientName: string;
    clientTitle: string;
    clientPhoto?: string;
    rating: number; // 1-5
    date: Timestamp;
  };
  
  // Organization
  category: string;
  tags: string[];
  skills: string[];
  
  // Status
  isPublic: boolean;
  isFeatured: boolean;
  status: 'draft' | 'published' | 'archived';
  
  // Analytics
  views: number;
  likes: number;
  inquiries: number; // Number of project inquiries generated
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}

export interface PortfolioTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  mediaTypes: string[];
  sections: {
    id: string;
    type: 'media' | 'text' | 'metrics' | 'testimonial' | 'gallery';
    label: string;
    required: boolean;
    settings?: any;
  }[];
  preview?: string; // Preview image URL
}

class EnhancedPortfolioService {
  private portfolioCollection = 'portfolioItems';
  private showcaseCollection = 'projectShowcases';
  private templatesCollection = 'portfolioTemplates';
  private commentsCollection = 'portfolioComments';

  // Media Portfolio Management
  async createPortfolioItem(
    creatorId: string, 
    itemData: Partial<MediaPortfolioItem>,
    primaryFile: File,
    additionalFiles?: File[]
  ): Promise<string> {
    try {
      const itemId = doc(collection(db, this.portfolioCollection)).id;
      
      // Upload primary media
      const primaryMediaUrl = await this.uploadMediaFile(primaryFile, `portfolio/${creatorId}/${itemId}/primary`);
      const primaryMediaMetadata = await this.extractMediaMetadata(primaryFile);
      
      // Upload additional media
      const additionalMedia = [];
      if (additionalFiles && additionalFiles.length > 0) {
        for (let i = 0; i < additionalFiles.length; i++) {
          const file = additionalFiles[i];
          const url = await this.uploadMediaFile(file, `portfolio/${creatorId}/${itemId}/additional/${i}`);
          additionalMedia.push({
            url,
            type: this.getFileType(file),
            label: `Additional ${i + 1}`
          });
        }
      }
      
      const portfolioItem: MediaPortfolioItem = {
        id: itemId,
        creatorId,
        title: itemData.title || 'Untitled Work',
        description: itemData.description || '',
        category: itemData.category || this.detectCategory(primaryFile),
        subcategory: itemData.subcategory || 'original',
        primaryMedia: {
          url: primaryMediaUrl,
          type: this.getFileType(primaryFile),
          duration: primaryMediaMetadata.duration,
          size: primaryFile.size,
          metadata: primaryMediaMetadata
        },
        additionalMedia,
        tags: itemData.tags || [],
        genres: itemData.genres || [],
        instruments: itemData.instruments || [],
        collaborators: itemData.collaborators || [],
        isPublic: itemData.isPublic ?? true,
        isFeatured: itemData.isFeatured ?? false,
        status: itemData.status || 'draft',
        likes: 0,
        views: 0,
        shares: 0,
        comments: [],
        clientInfo: itemData.clientInfo,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      await setDoc(doc(db, this.portfolioCollection, itemId), portfolioItem);
      return itemId;
    } catch (error) {
      console.error('Error creating portfolio item:', error);
      throw new Error('Failed to create portfolio item');
    }
  }

  async getPortfolioItem(id: string): Promise<MediaPortfolioItem | null> {
    try {
      const docRef = doc(db, this.portfolioCollection, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as MediaPortfolioItem;
      }
      return null;
    } catch (error) {
      console.error('Error fetching portfolio item:', error);
      return null;
    }
  }

  async getCreatorPortfolio(
    creatorId: string,
    filters?: {
      category?: string;
      status?: string;
      featured?: boolean;
      limit?: number;
    }
  ): Promise<MediaPortfolioItem[]> {
    try {
      const queryConstraints = [
        where(SCHEMA_FIELDS.SERVICE.CREATOR_ID, '==', creatorId),
        orderBy(SCHEMA_FIELDS.USER.UPDATED_AT, 'desc')
      ];

      if (filters?.category) {
        queryConstraints.splice(-1, 0, where(SCHEMA_FIELDS.SERVICE.CATEGORY, '==', filters.category));
      }
      
      if (filters?.status) {
        queryConstraints.splice(-1, 0, where(SCHEMA_FIELDS.BOOKING.STATUS, '==', filters.status));
      }
      
      if (filters?.featured !== undefined) {
        queryConstraints.splice(-1, 0, where('isFeatured', '==', filters.featured));
      }

      if (filters?.limit) {
        queryConstraints.push(limit(filters.limit));
      }

      const q = query(collection(db, this.portfolioCollection), ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MediaPortfolioItem[];
    } catch (error) {
      console.error('Error fetching creator portfolio:', error);
      return [];
    }
  }

  // Project Showcase Management
  async createProjectShowcase(
    creatorId: string,
    showcaseData: Partial<ProjectShowcase>
  ): Promise<string> {
    try {
      const showcaseId = doc(collection(db, this.showcaseCollection)).id;
      
      const showcase: ProjectShowcase = {
        id: showcaseId,
        creatorId,
        title: showcaseData.title || 'Untitled Project',
        description: showcaseData.description || '',
        client: showcaseData.client || { name: 'Anonymous Client', anonymous: true },
        challenge: showcaseData.challenge || '',
        approach: showcaseData.approach || '',
        solution: showcaseData.solution || '',
        results: showcaseData.results || '',
        mediaItems: showcaseData.mediaItems || [],
        featuredMedia: showcaseData.featuredMedia || '',
        metrics: showcaseData.metrics || {
          duration: '',
          deliverables: [],
          successMetrics: []
        },
        testimonial: showcaseData.testimonial,
        category: showcaseData.category || 'General',
        tags: showcaseData.tags || [],
        skills: showcaseData.skills || [],
        isPublic: showcaseData.isPublic ?? true,
        isFeatured: showcaseData.isFeatured ?? false,
        status: showcaseData.status || 'draft',
        views: 0,
        likes: 0,
        inquiries: 0,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      await setDoc(doc(db, this.showcaseCollection, showcaseId), showcase);
      return showcaseId;
    } catch (error) {
      console.error('Error creating project showcase:', error);
      throw new Error('Failed to create project showcase');
    }
  }

  async getCreatorShowcases(creatorId: string): Promise<ProjectShowcase[]> {
    try {
      const q = query(
        collection(db, this.showcaseCollection),
        where(SCHEMA_FIELDS.SERVICE.CREATOR_ID, '==', creatorId),
        orderBy(SCHEMA_FIELDS.USER.UPDATED_AT, 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProjectShowcase[];
    } catch (error) {
      console.error('Error fetching creator showcases:', error);
      return [];
    }
  }

  // Before/After Management
  async addBeforeAfterExample(
    itemId: string,
    beforeFile: File,
    afterFile: File,
    transformationNotes: string
  ): Promise<void> {
    try {
      const item = await this.getPortfolioItem(itemId);
      if (!item) throw new Error('Portfolio item not found');

      const beforeUrl = await this.uploadMediaFile(beforeFile, `portfolio/${item.creatorId}/${itemId}/before`);
      const afterUrl = await this.uploadMediaFile(afterFile, `portfolio/${item.creatorId}/${itemId}/after`);

      const beforeAfter = {
        before: {
          url: beforeUrl,
          description: 'Before'
        },
        after: {
          url: afterUrl,
          description: 'After'
        },
        transformationNotes
      };

      await updateDoc(doc(db, this.portfolioCollection, itemId), {
        beforeAfter,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding before/after example:', error);
      throw new Error('Failed to add before/after example');
    }
  }

  // Social Features
  async toggleLike(itemId: string, userId: string): Promise<void> {
    try {
      const item = await this.getPortfolioItem(itemId);
      if (!item) throw new Error('Portfolio item not found');

      // In a real implementation, you'd track user likes separately
      // For now, just increment/decrement the count
      const newLikes = item.likes + 1; // Simplified - would check if user already liked

      await updateDoc(doc(db, this.portfolioCollection, itemId), {
        likes: newLikes,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      throw new Error('Failed to toggle like');
    }
  }

  async addComment(
    itemId: string,
    userId: string,
    userName: string,
    content: string,
    userAvatar?: string
  ): Promise<void> {
    try {
      const commentId = doc(collection(db, this.commentsCollection)).id;
      
      const comment: Comment = {
        id: commentId,
        userId,
        userName,
        userAvatar,
        content,
        timestamp: serverTimestamp() as Timestamp,
        likes: 0,
        replies: []
      };

      await updateDoc(doc(db, this.portfolioCollection, itemId), {
        comments: arrayUnion(comment),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  }

  async incrementViews(itemId: string): Promise<void> {
    try {
      const item = await this.getPortfolioItem(itemId);
      if (item) {
        await updateDoc(doc(db, this.portfolioCollection, itemId), {
          views: item.views + 1
        });
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  // Template Management
  async getPortfolioTemplates(): Promise<PortfolioTemplate[]> {
    try {
      const q = query(collection(db, this.templatesCollection), orderBy(SCHEMA_FIELDS.USER.NAME));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PortfolioTemplate[];
    } catch (error) {
      console.error('Error fetching portfolio templates:', error);
      return this.getDefaultTemplates();
    }
  }

  private getDefaultTemplates(): PortfolioTemplate[] {
    return [
      {
        id: 'music-showcase',
        name: 'Music Showcase',
        description: 'Perfect for musicians and audio creators',
        category: 'Music',
        mediaTypes: ['audio', 'video', 'image'],
        sections: [
          { id: 'featured', type: 'media', label: 'Featured Track', required: true },
          { id: 'gallery', type: 'gallery', label: 'Music Gallery', required: true },
          { id: 'story', type: SCHEMA_FIELDS.REVIEW.TEXT, label: 'Artist Story', required: false },
          { id: 'testimonials', type: 'testimonial', label: 'Reviews', required: false },
        ]
      },
      {
        id: 'visual-portfolio',
        name: 'Visual Portfolio',
        description: 'For visual artists and designers',
        category: 'Visual',
        mediaTypes: ['image', 'video'],
        sections: [
          { id: 'gallery', type: 'gallery', label: 'Visual Gallery', required: true },
          { id: 'process', type: 'media', label: 'Process Documentation', required: false },
          { id: 'client-work', type: 'testimonial', label: 'Client Projects', required: false },
        ]
      },
      {
        id: 'project-case-study',
        name: 'Project Case Study',
        description: 'Detailed project documentation',
        category: 'Professional',
        mediaTypes: ['image', 'video', 'audio', 'document'],
        sections: [
          { id: 'overview', type: SCHEMA_FIELDS.REVIEW.TEXT, label: 'Project Overview', required: true },
          { id: 'challenge', type: SCHEMA_FIELDS.REVIEW.TEXT, label: 'Challenge', required: true },
          { id: 'solution', type: 'media', label: 'Solution', required: true },
          { id: 'results', type: 'metrics', label: 'Results', required: true },
          { id: 'testimonial', type: 'testimonial', label: 'Client Feedback', required: false },
        ]
      }
    ];
  }

  // Helper Methods
  private async uploadMediaFile(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  private getFileType(file: File): 'audio' | 'video' | 'image' | 'document' {
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('image/')) return 'image';
    return 'document';
  }

  private detectCategory(file: File): 'audio' | 'video' | 'image' | 'document' {
    return this.getFileType(file);
  }

  private async extractMediaMetadata(file: File): Promise<any> {
    // In a real implementation, you'd use a library like ffprobe or similar
    // For now, return basic metadata
    return {
      duration: file.type.startsWith('audio/') || file.type.startsWith('video/') ? 180 : undefined, // 3 minutes default
      bitrate: 128000, // Default bitrate
      sampleRate: 44100, // Default sample rate
      channels: 2, // Stereo
      format: file.type
    };
  }

  // Analytics
  async getPortfolioAnalytics(creatorId: string): Promise<{
    totalItems: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    categoryBreakdown: { [category: string]: number };
    topPerforming: MediaPortfolioItem[];
    engagementRate: number;
  }> {
    try {
      const portfolio = await this.getCreatorPortfolio(creatorId);
      
      const totalViews = portfolio.reduce((sum, item) => sum + item.views, 0);
      const totalLikes = portfolio.reduce((sum, item) => sum + item.likes, 0);
      const totalComments = portfolio.reduce((sum, item) => sum + item.comments.length, 0);
      
      const categoryBreakdown = portfolio.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as { [category: string]: number });

      const topPerforming = [...portfolio]
        .sort((a, b) => (b.views + b.likes * 2) - (a.views + a.likes * 2))
        .slice(0, 5);

      const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

      return {
        totalItems: portfolio.length,
        totalViews,
        totalLikes,
        totalComments,
        categoryBreakdown,
        topPerforming,
        engagementRate
      };
    } catch (error) {
      console.error('Error getting portfolio analytics:', error);
      throw new Error('Failed to get portfolio analytics');
    }
  }
}

export const enhancedPortfolioService = new EnhancedPortfolioService();

/**
 * Upload portfolio media files to Firebase Storage
 * @param creatorId - The creator's ID
 * @param file - The file to upload
 * @param metadata - Optional metadata for the file
 * @returns Promise<string> - The download URL
 */
export async function uploadPortfolioMedia(
  creatorId: string,
  file: File,
  metadata?: { category?: string; subcategory?: string }
): Promise<string> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = ref(storage, `portfolio/${creatorId}/${fileName}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file, {
      customMetadata: {
        category: metadata?.category || 'general',
        subcategory: metadata?.subcategory || 'other',
        uploadedBy: creatorId,
        uploadedAt: new Date().toISOString()
      }
    });
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading portfolio media:', error);
    throw new Error('Failed to upload portfolio media');
  }
}
