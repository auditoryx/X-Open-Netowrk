import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';

export interface Testimonial {
  id: string;
  creatorId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAvatar?: string;
  projectId?: string;
  caseStudyId?: string;
  rating: number;
  title: string;
  content: string;
  projectType?: string;
  serviceType?: string;
  projectDuration?: string;
  projectValue?: number;
  beforeMedia?: string[];
  afterMedia?: string[];
  tags: string[];
  isPublic: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  verificationMethod?: 'email' | 'platform' | 'manual';
  verificationDate?: Date;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  views: number;
  likes: number;
  shares: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    source?: 'direct' | 'email_request' | 'imported' | 'platform';
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  };
}

export interface TestimonialRequest {
  id: string;
  creatorId: string;
  clientId: string;
  clientEmail: string;
  projectId?: string;
  caseStudyId?: string;
  message: string;
  requestedFields: string[];
  customQuestions?: { question: string; required: boolean }[];
  status: 'sent' | 'completed' | 'declined' | 'expired';
  sentAt: Date;
  completedAt?: Date;
  expiresAt: Date;
  remindersSent: number;
  token: string;
}

export interface TestimonialTemplate {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  subject: string;
  message: string;
  requestedFields: string[];
  customQuestions: { question: string; required: boolean }[];
  isDefault: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestimonialAnalytics {
  totalTestimonials: number;
  averageRating: number;
  responseRate: number;
  publicTestimonials: number;
  featuredTestimonials: number;
  verifiedTestimonials: number;
  ratingDistribution: { [key: number]: number };
  monthlyTrends: {
    month: string;
    testimonials: number;
    averageRating: number;
    responseRate: number;
  }[];
  topKeywords: { keyword: string; count: number }[];
  serviceTypeBreakdown: { service: string; count: number; averageRating: number }[];
}

class TestimonialService {
  private testimonialsCollection = collection(db, 'testimonials');
  private requestsCollection = collection(db, 'testimonialRequests');
  private templatesCollection = collection(db, 'testimonialTemplates');

  // Testimonial Management
  async createTestimonial(testimonialData: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(this.testimonialsCollection, {
        ...testimonialData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        likes: 0,
        shares: 0
      });

      // Update creator's testimonial count
      await this.updateCreatorTestimonialStats(testimonialData.creatorId);

      return docRef.id;
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  }

  async getTestimonial(testimonialId: string): Promise<Testimonial | null> {
    try {
      const docRef = doc(this.testimonialsCollection, testimonialId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          verificationDate: data.verificationDate?.toDate()
        } as Testimonial;
      }

      return null;
    } catch (error) {
      console.error('Error getting testimonial:', error);
      throw error;
    }
  }

  async getCreatorTestimonials(
    creatorId: string,
    options: {
      status?: 'pending' | 'approved' | 'rejected' | 'draft';
      isPublic?: boolean;
      isFeatured?: boolean;
      limit?: number;
      lastDoc?: DocumentSnapshot;
    } = {}
  ): Promise<{ testimonials: Testimonial[]; lastDoc: DocumentSnapshot | null }> {
    try {
      let q = query(
        this.testimonialsCollection,
        where('creatorId', '==', creatorId),
        orderBy('createdAt', 'desc')
      );

      if (options.status) {
        q = query(q, where('status', '==', options.status));
      }

      if (options.isPublic !== undefined) {
        q = query(q, where('isPublic', '==', options.isPublic));
      }

      if (options.isFeatured !== undefined) {
        q = query(q, where('isFeatured', '==', options.isFeatured));
      }

      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      if (options.lastDoc) {
        q = query(q, startAfter(options.lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const testimonials: Testimonial[] = [];
      let lastDoc: DocumentSnapshot | null = null;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        testimonials.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          verificationDate: data.verificationDate?.toDate()
        } as Testimonial);
        lastDoc = doc;
      });

      return { testimonials, lastDoc };
    } catch (error) {
      console.error('Error getting creator testimonials:', error);
      throw error;
    }
  }

  async updateTestimonial(testimonialId: string, updates: Partial<Testimonial>): Promise<void> {
    try {
      const docRef = doc(this.testimonialsCollection, testimonialId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
  }

  async deleteTestimonial(testimonialId: string): Promise<void> {
    try {
      const testimonial = await this.getTestimonial(testimonialId);
      if (!testimonial) throw new Error('Testimonial not found');

      await deleteDoc(doc(this.testimonialsCollection, testimonialId));
      
      // Update creator's testimonial count
      await this.updateCreatorTestimonialStats(testimonial.creatorId);
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  }

  // Testimonial Requests
  async createTestimonialRequest(requestData: Omit<TestimonialRequest, 'id' | 'token' | 'sentAt'>): Promise<string> {
    try {
      const token = this.generateRequestToken();
      const docRef = await addDoc(this.requestsCollection, {
        ...requestData,
        token,
        sentAt: serverTimestamp(),
        remindersSent: 0
      });

      // Send email request to client
      await this.sendTestimonialRequestEmail(requestData.clientEmail, token);

      return docRef.id;
    } catch (error) {
      console.error('Error creating testimonial request:', error);
      throw error;
    }
  }

  async getTestimonialRequestByToken(token: string): Promise<TestimonialRequest | null> {
    try {
      const q = query(this.requestsCollection, where('token', '==', token), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          sentAt: data.sentAt?.toDate(),
          completedAt: data.completedAt?.toDate(),
          expiresAt: data.expiresAt?.toDate()
        } as TestimonialRequest;
      }

      return null;
    } catch (error) {
      console.error('Error getting testimonial request by token:', error);
      throw error;
    }
  }

  async completeTestimonialRequest(token: string, testimonialData: Partial<Testimonial>): Promise<string> {
    try {
      const request = await this.getTestimonialRequestByToken(token);
      if (!request) throw new Error('Request not found');
      if (request.status !== 'sent') throw new Error('Request already completed or expired');

      // Create testimonial
      const testimonialId = await this.createTestimonial({
        ...testimonialData as Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>,
        creatorId: request.creatorId,
        clientId: request.clientId,
        projectId: request.projectId,
        caseStudyId: request.caseStudyId,
        status: 'pending', // Requires creator approval
        isPublic: false, // Default to private
        isFeatured: false,
        isVerified: true,
        verificationMethod: 'email',
        verificationDate: new Date(),
        tags: testimonialData.tags || []
      });

      // Update request status
      await updateDoc(doc(this.requestsCollection, request.id), {
        status: 'completed',
        completedAt: serverTimestamp()
      });

      return testimonialId;
    } catch (error) {
      console.error('Error completing testimonial request:', error);
      throw error;
    }
  }

  // Templates
  async createTemplate(templateData: Omit<TestimonialTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(this.templatesCollection, {
        ...templateData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        usageCount: 0
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  async getCreatorTemplates(creatorId: string): Promise<TestimonialTemplate[]> {
    try {
      const q = query(
        this.templatesCollection,
        where('creatorId', '==', creatorId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const templates: TestimonialTemplate[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        templates.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as TestimonialTemplate);
      });

      return templates;
    } catch (error) {
      console.error('Error getting creator templates:', error);
      throw error;
    }
  }

  // Analytics
  async getTestimonialAnalytics(creatorId: string): Promise<TestimonialAnalytics> {
    try {
      const { testimonials } = await this.getCreatorTestimonials(creatorId, { limit: 1000 });
      
      const totalTestimonials = testimonials.length;
      const publicTestimonials = testimonials.filter(t => t.isPublic).length;
      const featuredTestimonials = testimonials.filter(t => t.isFeatured).length;
      const verifiedTestimonials = testimonials.filter(t => t.isVerified).length;

      const averageRating = testimonials.length > 0 
        ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length 
        : 0;

      const ratingDistribution = testimonials.reduce((acc, t) => {
        acc[t.rating] = (acc[t.rating] || 0) + 1;
        return acc;
      }, {} as { [key: number]: number });

      // Calculate monthly trends (simplified)
      const monthlyTrends = this.calculateMonthlyTrends(testimonials);
      
      // Extract keywords from testimonial content
      const topKeywords = this.extractTopKeywords(testimonials);
      
      // Service type breakdown
      const serviceTypeBreakdown = this.calculateServiceBreakdown(testimonials);

      // Calculate response rate (requires request data)
      const responseRate = await this.calculateResponseRate(creatorId);

      return {
        totalTestimonials,
        averageRating,
        responseRate,
        publicTestimonials,
        featuredTestimonials,
        verifiedTestimonials,
        ratingDistribution,
        monthlyTrends,
        topKeywords,
        serviceTypeBreakdown
      };
    } catch (error) {
      console.error('Error getting testimonial analytics:', error);
      throw error;
    }
  }

  // Social Proof & Display
  async getFeaturedTestimonials(creatorId: string, limit: number = 6): Promise<Testimonial[]> {
    try {
      const { testimonials } = await this.getCreatorTestimonials(creatorId, {
        isFeatured: true,
        isPublic: true,
        status: 'approved',
        limit
      });
      return testimonials;
    } catch (error) {
      console.error('Error getting featured testimonials:', error);
      throw error;
    }
  }

  async getTestimonialsByRating(creatorId: string, minRating: number = 4): Promise<Testimonial[]> {
    try {
      const { testimonials } = await this.getCreatorTestimonials(creatorId, {
        isPublic: true,
        status: 'approved'
      });
      return testimonials.filter(t => t.rating >= minRating);
    } catch (error) {
      console.error('Error getting testimonials by rating:', error);
      throw error;
    }
  }

  // Utility Methods
  private generateRequestToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private async sendTestimonialRequestEmail(email: string, token: string): Promise<void> {
    // Implementation would integrate with email service
    console.log(`Sending testimonial request to ${email} with token ${token}`);
  }

  private async updateCreatorTestimonialStats(creatorId: string): Promise<void> {
    // Update creator profile with testimonial stats
    // This would integrate with the user/creator profile service
  }

  private async calculateResponseRate(creatorId: string): Promise<number> {
    try {
      const sentQuery = query(
        this.requestsCollection,
        where('creatorId', '==', creatorId),
        where('status', '==', 'sent')
      );
      const completedQuery = query(
        this.requestsCollection,
        where('creatorId', '==', creatorId),
        where('status', '==', 'completed')
      );

      const [sentSnapshot, completedSnapshot] = await Promise.all([
        getDocs(sentQuery),
        getDocs(completedQuery)
      ]);

      const totalSent = sentSnapshot.size + completedSnapshot.size;
      const totalCompleted = completedSnapshot.size;

      return totalSent > 0 ? (totalCompleted / totalSent) * 100 : 0;
    } catch (error) {
      console.error('Error calculating response rate:', error);
      return 0;
    }
  }

  private calculateMonthlyTrends(testimonials: Testimonial[]): any[] {
    // Simplified monthly trends calculation
    const monthlyData = testimonials.reduce((acc, testimonial) => {
      const month = testimonial.createdAt.toISOString().substring(0, 7);
      if (!acc[month]) {
        acc[month] = { testimonials: 0, totalRating: 0 };
      }
      acc[month].testimonials++;
      acc[month].totalRating += testimonial.rating;
      return acc;
    }, {} as any);

    return Object.entries(monthlyData).map(([month, data]: [string, any]) => ({
      month,
      testimonials: data.testimonials,
      averageRating: data.totalRating / data.testimonials,
      responseRate: 0 // Would need request data
    }));
  }

  private extractTopKeywords(testimonials: Testimonial[]): { keyword: string; count: number }[] {
    const words = testimonials
      .map(t => t.content.toLowerCase())
      .join(' ')
      .split(/\W+/)
      .filter(word => word.length > 3);

    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));
  }

  private calculateServiceBreakdown(testimonials: Testimonial[]): { service: string; count: number; averageRating: number }[] {
    const serviceData = testimonials.reduce((acc, testimonial) => {
      const service = testimonial.serviceType || 'General';
      if (!acc[service]) {
        acc[service] = { count: 0, totalRating: 0 };
      }
      acc[service].count++;
      acc[service].totalRating += testimonial.rating;
      return acc;
    }, {} as any);

    return Object.entries(serviceData).map(([service, data]: [string, any]) => ({
      service,
      count: data.count,
      averageRating: data.totalRating / data.count
    }));
  }
}

export const testimonialService = new TestimonialService();
