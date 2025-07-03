import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SkillBadge {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string; // Icon name or URL
  color: string; // Hex color
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // Verification
  verified: boolean;
  verificationSource?: 'platform' | 'peer' | 'client' | 'certification';
  verificationDate?: Timestamp;
  
  // Evidence
  portfolioItems?: string[]; // Related portfolio item IDs
  testimonials?: string[]; // Related testimonial IDs
  certifications?: {
    name: string;
    issuer: string;
    url?: string;
    date: Timestamp;
  }[];
  
  // Analytics
  endorsements: number;
  projectsCompleted: number;
  averageRating: number;
  
  // Timestamps
  earnedAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ExpertiseBadge {
  id: string;
  creatorId: string;
  badge: SkillBadge;
  customization?: {
    displayName?: string;
    description?: string;
    featured: boolean;
    order: number;
  };
  
  // Peer endorsements
  endorsements: {
    userId: string;
    userName: string;
    userAvatar?: string;
    comment?: string;
    timestamp: Timestamp;
  }[];
  
  // Client validations
  clientValidations: {
    clientId: string;
    clientName: string;
    projectId: string;
    rating: number;
    comment?: string;
    timestamp: Timestamp;
  }[];
  
  // Usage stats
  stats: {
    projectsCompleted: number;
    totalEarnings: number;
    averageRating: number;
    completionRate: number;
  };
}

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  badges: SkillBadge[];
}

export interface CreatorProfile {
  id: string;
  creatorId: string;
  
  // Basic info
  displayName: string;
  tagline: string;
  bio: string;
  avatar?: string;
  coverImage?: string;
  
  // Skills and expertise
  expertiseBadges: string[]; // Badge IDs
  featuredBadges: string[]; // Featured badge IDs (max 6)
  skillsOverview: {
    primary: string[]; // Top 3 skills
    secondary: string[]; // Additional skills
    learning: string[]; // Skills being developed
  };
  
  // Availability
  availability: {
    status: 'available' | 'busy' | 'unavailable';
    nextAvailable?: Timestamp;
    timezone: string;
    workingHours: {
      start: string; // e.g., "09:00"
      end: string; // e.g., "17:00"
      days: string[]; // e.g., ["monday", "tuesday", ...]
    };
    responseTime: string; // e.g., "within 2 hours"
  };
  
  // Pricing
  basePricing: {
    hourlyRate?: number;
    projectMinimum?: number;
    currency: string;
    negotiable: boolean;
  };
  
  // Social proof
  socialProof: {
    totalProjects: number;
    totalEarnings: number;
    averageRating: number;
    totalReviews: number;
    repeatClients: number;
    onTimeDelivery: number; // percentage
  };
  
  // Contact preferences
  contactPreferences: {
    preferredMethod: 'platform' | 'email' | 'phone';
    showEmail: boolean;
    showPhone: boolean;
    autoResponse?: string;
  };
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

class SkillsBadgeService {
  private badgesCollection = 'skillBadges';
  private expertiseCollection = 'creatorExpertise';
  private profilesCollection = 'creatorProfiles';
  private categoriesCollection = 'skillCategories';

  // Badge Management
  async getAvailableBadges(): Promise<SkillCategory[]> {
    try {
      const categoriesSnapshot = await getDocs(collection(db, this.categoriesCollection));
      
      if (categoriesSnapshot.empty) {
        return this.getDefaultCategories();
      }
      
      return categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SkillCategory[];
    } catch (error) {
      console.error('Error fetching skill categories:', error);
      return this.getDefaultCategories();
    }
  }

  async earnBadge(
    creatorId: string, 
    badgeId: string, 
    evidence?: {
      portfolioItems?: string[];
      certifications?: any[];
    }
  ): Promise<void> {
    try {
      const expertiseBadgeId = `${creatorId}_${badgeId}`;
      
      // Get the base badge info
      const badge = await this.getBadgeById(badgeId);
      if (!badge) throw new Error('Badge not found');
      
      const expertiseBadge: ExpertiseBadge = {
        id: expertiseBadgeId,
        creatorId,
        badge,
        customization: {
          featured: false,
          order: 0
        },
        endorsements: [],
        clientValidations: [],
        stats: {
          projectsCompleted: 0,
          totalEarnings: 0,
          averageRating: 0,
          completionRate: 0
        }
      };

      await setDoc(doc(db, this.expertiseCollection, expertiseBadgeId), expertiseBadge);
      
      // Update creator profile
      await this.updateCreatorBadges(creatorId, badgeId, 'add');
    } catch (error) {
      console.error('Error earning badge:', error);
      throw new Error('Failed to earn badge');
    }
  }

  async getCreatorBadges(creatorId: string): Promise<ExpertiseBadge[]> {
    try {
      const q = query(
        collection(db, this.expertiseCollection),
        where('creatorId', '==', creatorId),
        orderBy('badge.earnedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ExpertiseBadge[];
    } catch (error) {
      console.error('Error fetching creator badges:', error);
      return [];
    }
  }

  async endorseSkill(
    creatorId: string, 
    badgeId: string, 
    endorserId: string, 
    endorserName: string,
    comment?: string,
    endorserAvatar?: string
  ): Promise<void> {
    try {
      const expertiseBadgeId = `${creatorId}_${badgeId}`;
      const endorsement = {
        userId: endorserId,
        userName: endorserName,
        userAvatar: endorserAvatar,
        comment,
        timestamp: serverTimestamp() as Timestamp
      };

      await updateDoc(doc(db, this.expertiseCollection, expertiseBadgeId), {
        endorsements: arrayUnion(endorsement),
        'badge.endorsements': arrayUnion(endorserId)
      });
    } catch (error) {
      console.error('Error endorsing skill:', error);
      throw new Error('Failed to endorse skill');
    }
  }

  async validateSkillFromClient(
    creatorId: string,
    badgeId: string,
    clientId: string,
    clientName: string,
    projectId: string,
    rating: number,
    comment?: string
  ): Promise<void> {
    try {
      const expertiseBadgeId = `${creatorId}_${badgeId}`;
      const validation = {
        clientId,
        clientName,
        projectId,
        rating,
        comment,
        timestamp: serverTimestamp() as Timestamp
      };

      await updateDoc(doc(db, this.expertiseCollection, expertiseBadgeId), {
        clientValidations: arrayUnion(validation)
      });

      // Update badge verification status if enough validations
      await this.checkBadgeVerification(expertiseBadgeId);
    } catch (error) {
      console.error('Error validating skill from client:', error);
      throw new Error('Failed to validate skill');
    }
  }

  // Profile Management
  async getCreatorProfile(creatorId: string): Promise<CreatorProfile | null> {
    try {
      const docRef = doc(db, this.profilesCollection, creatorId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as CreatorProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching creator profile:', error);
      return null;
    }
  }

  async updateCreatorProfile(
    creatorId: string, 
    updates: Partial<CreatorProfile>
  ): Promise<void> {
    try {
      const docRef = doc(db, this.profilesCollection, creatorId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating creator profile:', error);
      throw new Error('Failed to update creator profile');
    }
  }

  async createOrUpdateProfile(creatorId: string, profileData: Partial<CreatorProfile>): Promise<void> {
    try {
      const existingProfile = await this.getCreatorProfile(creatorId);
      
      if (existingProfile) {
        await this.updateCreatorProfile(creatorId, profileData);
      } else {
        const newProfile: CreatorProfile = {
          id: creatorId,
          creatorId,
          displayName: profileData.displayName || 'Creator',
          tagline: profileData.tagline || '',
          bio: profileData.bio || '',
          expertiseBadges: [],
          featuredBadges: [],
          skillsOverview: {
            primary: [],
            secondary: [],
            learning: []
          },
          availability: {
            status: 'available',
            timezone: 'UTC',
            workingHours: {
              start: '09:00',
              end: '17:00',
              days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
            },
            responseTime: 'within 24 hours'
          },
          basePricing: {
            currency: 'USD',
            negotiable: true
          },
          socialProof: {
            totalProjects: 0,
            totalEarnings: 0,
            averageRating: 0,
            totalReviews: 0,
            repeatClients: 0,
            onTimeDelivery: 100
          },
          contactPreferences: {
            preferredMethod: 'platform',
            showEmail: false,
            showPhone: false
          },
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
          ...profileData
        };

        await setDoc(doc(db, this.profilesCollection, creatorId), newProfile);
      }
    } catch (error) {
      console.error('Error creating/updating profile:', error);
      throw new Error('Failed to create/update profile');
    }
  }

  async updateFeaturedBadges(creatorId: string, badgeIds: string[]): Promise<void> {
    try {
      // Limit to 6 featured badges
      const featuredBadges = badgeIds.slice(0, 6);
      
      await updateDoc(doc(db, this.profilesCollection, creatorId), {
        featuredBadges,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating featured badges:', error);
      throw new Error('Failed to update featured badges');
    }
  }

  async updateAvailabilityStatus(
    creatorId: string, 
    status: 'available' | 'busy' | 'unavailable',
    nextAvailable?: Date
  ): Promise<void> {
    try {
      const updates: any = {
        'availability.status': status,
        updatedAt: serverTimestamp()
      };

      if (nextAvailable) {
        updates['availability.nextAvailable'] = Timestamp.fromDate(nextAvailable);
      }

      await updateDoc(doc(db, this.profilesCollection, creatorId), updates);
    } catch (error) {
      console.error('Error updating availability status:', error);
      throw new Error('Failed to update availability status');
    }
  }

  // Analytics and Insights
  async getBadgeAnalytics(creatorId: string): Promise<{
    totalBadges: number;
    verifiedBadges: number;
    endorsementCount: number;
    categoryBreakdown: { [category: string]: number };
    topEndorsedSkills: { badgeId: string; badgeName: string; endorsements: number }[];
    skillGrowth: { month: string; badgesEarned: number }[];
  }> {
    try {
      const badges = await this.getCreatorBadges(creatorId);
      
      const totalBadges = badges.length;
      const verifiedBadges = badges.filter(b => b.badge.verified).length;
      const endorsementCount = badges.reduce((sum, b) => sum + b.endorsements.length, 0);
      
      const categoryBreakdown = badges.reduce((acc, badge) => {
        const category = badge.badge.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as { [category: string]: number });

      const topEndorsedSkills = badges
        .map(b => ({
          badgeId: b.badge.id,
          badgeName: b.badge.name,
          endorsements: b.endorsements.length
        }))
        .sort((a, b) => b.endorsements - a.endorsements)
        .slice(0, 5);

      // Simplified skill growth (would use real date aggregation in production)
      const skillGrowth = [
        { month: 'Jan', badgesEarned: 2 },
        { month: 'Feb', badgesEarned: 1 },
        { month: 'Mar', badgesEarned: 3 },
        { month: 'Apr', badgesEarned: 2 },
        { month: 'May', badgesEarned: 1 },
        { month: 'Jun', badgesEarned: 2 }
      ];

      return {
        totalBadges,
        verifiedBadges,
        endorsementCount,
        categoryBreakdown,
        topEndorsedSkills,
        skillGrowth
      };
    } catch (error) {
      console.error('Error getting badge analytics:', error);
      throw new Error('Failed to get badge analytics');
    }
  }

  // Helper Methods
  private async getBadgeById(badgeId: string): Promise<SkillBadge | null> {
    try {
      const docRef = doc(db, this.badgesCollection, badgeId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as SkillBadge;
      }
      
      // If not found in Firestore, check default badges
      const defaultBadges = this.getDefaultBadges();
      return defaultBadges.find(badge => badge.id === badgeId) || null;
    } catch (error) {
      console.error('Error fetching badge:', error);
      return null;
    }
  }

  private async updateCreatorBadges(
    creatorId: string, 
    badgeId: string, 
    action: 'add' | 'remove'
  ): Promise<void> {
    try {
      const profile = await this.getCreatorProfile(creatorId);
      if (!profile) {
        // Create basic profile if it doesn't exist
        await this.createOrUpdateProfile(creatorId, {});
      }

      const updateData: any = {
        updatedAt: serverTimestamp()
      };

      if (action === 'add') {
        updateData.expertiseBadges = arrayUnion(badgeId);
      } else {
        updateData.expertiseBadges = arrayRemove(badgeId);
        updateData.featuredBadges = arrayRemove(badgeId);
      }

      await updateDoc(doc(db, this.profilesCollection, creatorId), updateData);
    } catch (error) {
      console.error('Error updating creator badges:', error);
      throw new Error('Failed to update creator badges');
    }
  }

  private async checkBadgeVerification(expertiseBadgeId: string): Promise<void> {
    try {
      const docRef = doc(db, this.expertiseCollection, expertiseBadgeId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const badge = docSnap.data() as ExpertiseBadge;
        const validationCount = badge.clientValidations.length;
        const averageRating = badge.clientValidations.reduce((sum, v) => sum + v.rating, 0) / validationCount;
        
        // Verify badge if it has 3+ client validations with 4+ average rating
        if (validationCount >= 3 && averageRating >= 4 && !badge.badge.verified) {
          await updateDoc(docRef, {
            'badge.verified': true,
            'badge.verificationSource': 'client',
            'badge.verificationDate': serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('Error checking badge verification:', error);
    }
  }

  private getDefaultCategories(): SkillCategory[] {
    return [
      {
        id: 'music-production',
        name: 'Music Production',
        description: 'Audio creation and production skills',
        icon: '🎵',
        badges: this.getDefaultBadges().filter(b => b.category === 'music-production')
      },
      {
        id: 'audio-engineering',
        name: 'Audio Engineering',
        description: 'Technical audio processing and mastering',
        icon: '🎚️',
        badges: this.getDefaultBadges().filter(b => b.category === 'audio-engineering')
      },
      {
        id: 'creative-arts',
        name: 'Creative Arts',
        description: 'Visual and creative design skills',
        icon: '🎨',
        badges: this.getDefaultBadges().filter(b => b.category === 'creative-arts')
      },
      {
        id: 'business',
        name: 'Business & Strategy',
        description: 'Business development and strategy skills',
        icon: '💼',
        badges: this.getDefaultBadges().filter(b => b.category === 'business')
      }
    ];
  }

  private getDefaultBadges(): SkillBadge[] {
    return [
      // Music Production
      {
        id: 'original-composition',
        name: 'Original Composition',
        category: 'music-production',
        description: 'Creates original musical compositions',
        icon: '🎼',
        color: '#3B82F6',
        level: 'intermediate',
        verified: false,
        endorsements: 0,
        projectsCompleted: 0,
        averageRating: 0,
        earnedAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      },
      {
        id: 'music-arrangement',
        name: 'Music Arrangement',
        category: 'music-production',
        description: 'Arranges music for different instruments and ensembles',
        icon: '🎹',
        color: '#10B981',
        level: 'advanced',
        verified: false,
        endorsements: 0,
        projectsCompleted: 0,
        averageRating: 0,
        earnedAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      },
      {
        id: 'beat-making',
        name: 'Beat Making',
        category: 'music-production',
        description: 'Creates beats and rhythmic foundations',
        icon: '🥁',
        color: '#F59E0B',
        level: 'intermediate',
        verified: false,
        endorsements: 0,
        projectsCompleted: 0,
        averageRating: 0,
        earnedAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      },

      // Audio Engineering
      {
        id: 'mixing-mastering',
        name: 'Mixing & Mastering',
        category: 'audio-engineering',
        description: 'Professional audio mixing and mastering services',
        icon: '🎛️',
        color: '#8B5CF6',
        level: 'expert',
        verified: false,
        endorsements: 0,
        projectsCompleted: 0,
        averageRating: 0,
        earnedAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      },
      {
        id: 'sound-design',
        name: 'Sound Design',
        category: 'audio-engineering',
        description: 'Creates custom sounds and audio effects',
        icon: '🔊',
        color: '#EF4444',
        level: 'advanced',
        verified: false,
        endorsements: 0,
        projectsCompleted: 0,
        averageRating: 0,
        earnedAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      },
      {
        id: 'audio-restoration',
        name: 'Audio Restoration',
        category: 'audio-engineering',
        description: 'Restores and enhances degraded audio recordings',
        icon: '🔧',
        color: '#06B6D4',
        level: 'expert',
        verified: false,
        endorsements: 0,
        projectsCompleted: 0,
        averageRating: 0,
        earnedAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      },

      // Creative Arts
      {
        id: 'album-artwork',
        name: 'Album Artwork',
        category: 'creative-arts',
        description: 'Designs album covers and promotional materials',
        icon: '🎨',
        color: '#EC4899',
        level: 'intermediate',
        verified: false,
        endorsements: 0,
        projectsCompleted: 0,
        averageRating: 0,
        earnedAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      },
      {
        id: 'video-production',
        name: 'Video Production',
        category: 'creative-arts',
        description: 'Creates music videos and visual content',
        icon: '🎬',
        color: '#F97316',
        level: 'advanced',
        verified: false,
        endorsements: 0,
        projectsCompleted: 0,
        averageRating: 0,
        earnedAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      },

      // Business
      {
        id: 'project-management',
        name: 'Project Management',
        category: 'business',
        description: 'Manages creative projects from concept to completion',
        icon: '📋',
        color: '#6366F1',
        level: 'advanced',
        verified: false,
        endorsements: 0,
        projectsCompleted: 0,
        averageRating: 0,
        earnedAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      },
      {
        id: 'music-marketing',
        name: 'Music Marketing',
        category: 'business',
        description: 'Promotes and markets music and artists',
        icon: '📢',
        color: '#84CC16',
        level: 'intermediate',
        verified: false,
        endorsements: 0,
        projectsCompleted: 0,
        averageRating: 0,
        earnedAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      }
    ];
  }
}

export const skillsBadgeService = new SkillsBadgeService();
