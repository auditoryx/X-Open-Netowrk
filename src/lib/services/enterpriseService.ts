import { PrismaClient, Organization, User, UserRole, OrganizationType, SubscriptionPlan } from '@prisma/client';
import { z } from 'zod';

// DTO Schemas
export const CreateOrganizationSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  type: z.nativeEnum(OrganizationType),
  plan: z.nativeEnum(SubscriptionPlan).optional().default('FREE'),
  customDomain: z.string().optional(),
  branding: z.object({
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    logo: z.string().optional(),
    favicon: z.string().optional(),
  }).optional(),
  settings: z.object({
    timezone: z.string().optional(),
    currency: z.string().optional(),
    language: z.string().optional(),
    features: z.array(z.string()).optional(),
  }).optional(),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.nativeEnum(UserRole).optional().default('CREATOR'),
  phone: z.string().optional(),
  timezone: z.string().optional(),
});

export const BulkCreateUsersSchema = z.array(CreateUserSchema).max(100);

export type CreateOrganizationDto = z.infer<typeof CreateOrganizationSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type BulkCreateUsersDto = z.infer<typeof BulkCreateUsersSchema>;

export interface WhiteLabelConfig {
  domain: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo: string;
    favicon: string;
    companyName: string;
  };
  features: string[];
  customizations: Record<string, any>;
}

export interface AnalyticsFilters {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate?: Date;
  endDate?: Date;
  type?: 'revenue' | 'bookings' | 'artists' | 'projects' | 'performance';
  artistIds?: string[];
  projectIds?: string[];
}

/**
 * Enterprise Service for multi-tenant operations
 */
export class EnterpriseService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new organization with default settings
   */
  async createOrganization(data: CreateOrganizationDto): Promise<Organization> {
    const validated = CreateOrganizationSchema.parse(data);

    // Check if slug is available
    const existingOrg = await this.prisma.organization.findUnique({
      where: { slug: validated.slug }
    });

    if (existingOrg) {
      throw new Error(`Organization slug '${validated.slug}' is already taken`);
    }

    // Create organization with default settings
    const organization = await this.prisma.organization.create({
      data: {
        ...validated,
        settings: {
          timezone: 'UTC',
          currency: 'USD',
          language: 'en',
          features: this.getDefaultFeatures(validated.plan),
          ...validated.settings,
        },
        branding: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          ...validated.branding,
        },
      },
    });

    // Create default subscription
    await this.prisma.subscription.create({
      data: {
        organizationId: organization.id,
        plan: validated.plan,
        status: 'TRIALING',
        billingCycle: 'MONTHLY',
        amount: this.getPlanAmount(validated.plan),
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return organization;
  }

  /**
   * Setup white-label configuration for an organization
   */
  async setupWhiteLabel(orgId: string, config: WhiteLabelConfig): Promise<Organization> {
    // Validate organization exists and has white-label plan
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { subscriptions: true },
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    const hasWhiteLabelPlan = org.subscriptions.some(
      sub => sub.plan === 'WHITE_LABEL' && sub.status === 'ACTIVE'
    );

    if (!hasWhiteLabelPlan) {
      throw new Error('Organization does not have an active white-label subscription');
    }

    // Update organization with white-label config
    return await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        customDomain: config.domain,
        branding: config.branding,
        settings: {
          ...org.settings as any,
          features: config.features,
          customizations: config.customizations,
        },
      },
    });
  }

  /**
   * Bulk create users for an organization
   */
  async bulkCreateUsers(orgId: string, users: BulkCreateUsersDto): Promise<User[]> {
    const validated = BulkCreateUsersSchema.parse(users);

    // Validate organization exists
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    // Check for duplicate emails
    const emails = validated.map(user => user.email);
    const existingUsers = await this.prisma.user.findMany({
      where: { email: { in: emails } },
    });

    if (existingUsers.length > 0) {
      const duplicateEmails = existingUsers.map(user => user.email);
      throw new Error(`Users with emails already exist: ${duplicateEmails.join(', ')}`);
    }

    // Create users in transaction
    const createdUsers = await this.prisma.$transaction(
      validated.map(userData => 
        this.prisma.user.create({
          data: {
            ...userData,
            organizationId: orgId,
          },
        })
      )
    );

    return createdUsers;
  }

  /**
   * Generate analytics for an organization
   */
  async generateAnalytics(orgId: string, filters: AnalyticsFilters): Promise<any> {
    const { period, startDate, endDate, type, artistIds, projectIds } = filters;

    // Base query filters
    const whereClause: any = {
      organizationId: orgId,
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    let analyticsData: any = {};

    switch (type) {
      case 'revenue':
        analyticsData = await this.generateRevenueAnalytics(whereClause, period);
        break;
      case 'bookings':
        analyticsData = await this.generateBookingAnalytics(whereClause, period);
        break;
      case 'artists':
        analyticsData = await this.generateArtistAnalytics(whereClause, period, artistIds);
        break;
      case 'projects':
        analyticsData = await this.generateProjectAnalytics(whereClause, period, projectIds);
        break;
      case 'performance':
        analyticsData = await this.generatePerformanceAnalytics(whereClause, period);
        break;
      default:
        analyticsData = await this.generateOverviewAnalytics(whereClause, period);
    }

    // Store analytics for caching
    await this.prisma.analytics.create({
      data: {
        organizationId: orgId,
        type: type?.toUpperCase() as any || 'PERFORMANCE',
        period: period.toUpperCase() as any,
        data: analyticsData,
      },
    });

    return analyticsData;
  }

  /**
   * Get organization dashboard data
   */
  async getOrganizationDashboard(orgId: string): Promise<any> {
    const [
      org,
      totalUsers,
      totalArtists,
      totalBookings,
      totalProjects,
      recentBookings,
      topArtists,
      revenueThisMonth,
    ] = await Promise.all([
      this.prisma.organization.findUnique({
        where: { id: orgId },
        include: { subscriptions: { where: { status: 'ACTIVE' } } },
      }),
      this.prisma.user.count({ where: { organizationId: orgId, isActive: true } }),
      this.prisma.artist.count({ where: { organizationId: orgId, isActive: true } }),
      this.prisma.booking.count({ where: { organizationId: orgId } }),
      this.prisma.project.count({ where: { organizationId: orgId } }),
      this.prisma.booking.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { artist: true, project: true },
      }),
      this.prisma.artist.findMany({
        where: { organizationId: orgId },
        orderBy: { totalEarnings: 'desc' },
        take: 5,
        select: { id: true, name: true, totalEarnings: true, totalBookings: true, rating: true },
      }),
      this.getMonthlyRevenue(orgId),
    ]);

    return {
      organization: org,
      stats: {
        totalUsers,
        totalArtists,
        totalBookings,
        totalProjects,
        revenueThisMonth,
      },
      recentBookings,
      topArtists,
    };
  }

  /**
   * Get roster of artists for an organization
   */
  async getArtistRoster(orgId: string, filters?: {
    search?: string;
    genres?: string[];
    skills?: string[];
    verificationStatus?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const whereClause: any = { organizationId: orgId };

    if (filters?.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { stageName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.genres && filters.genres.length > 0) {
      whereClause.genres = { hasSome: filters.genres };
    }

    if (filters?.skills && filters.skills.length > 0) {
      whereClause.skills = { hasSome: filters.skills };
    }

    if (filters?.verificationStatus) {
      whereClause.verificationStatus = filters.verificationStatus;
    }

    if (filters?.isActive !== undefined) {
      whereClause.isActive = filters.isActive;
    }

    const [artists, total] = await Promise.all([
      this.prisma.artist.findMany({
        where: whereClause,
        include: {
          analytics: {
            orderBy: { generatedAt: 'desc' },
            take: 1,
          },
          _count: {
            select: { bookings: true, contracts: true },
          },
        },
        orderBy: { totalEarnings: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      this.prisma.artist.count({ where: whereClause }),
    ]);

    return { artists, total };
  }

  // Private helper methods
  private getDefaultFeatures(plan: SubscriptionPlan): string[] {
    const features: Record<SubscriptionPlan, string[]> = {
      FREE: ['basic_booking', 'basic_analytics'],
      STUDIO_PRO: ['basic_booking', 'basic_analytics', 'artist_management', 'project_tracking'],
      LABEL_ENTERPRISE: ['all_features', 'bulk_booking', 'advanced_analytics', 'white_label_partial'],
      WHITE_LABEL: ['all_features', 'full_customization', 'dedicated_support'],
      CUSTOM: ['all_features'],
    };

    return features[plan] || features.FREE;
  }

  private getPlanAmount(plan: SubscriptionPlan): number {
    const amounts: Record<SubscriptionPlan, number> = {
      FREE: 0,
      STUDIO_PRO: 299,
      LABEL_ENTERPRISE: 799,
      WHITE_LABEL: 1999,
      CUSTOM: 0, // Custom pricing
    };

    return amounts[plan] || 0;
  }

  private async generateRevenueAnalytics(whereClause: any, period: string): Promise<any> {
    // Implementation for revenue analytics
    const revenue = await this.prisma.booking.aggregate({
      where: { ...whereClause, paymentStatus: 'PAID' },
      _sum: { finalPrice: true },
      _count: true,
    });

    return {
      totalRevenue: revenue._sum.finalPrice || 0,
      totalPaidBookings: revenue._count,
      period,
    };
  }

  private async generateBookingAnalytics(whereClause: any, period: string): Promise<any> {
    // Implementation for booking analytics
    const bookings = await this.prisma.booking.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true,
    });

    return {
      bookingsByStatus: bookings.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      period,
    };
  }

  private async generateArtistAnalytics(whereClause: any, period: string, artistIds?: string[]): Promise<any> {
    const artistWhere = { ...whereClause };
    if (artistIds && artistIds.length > 0) {
      artistWhere.artistId = { in: artistIds };
    }

    const artistStats = await this.prisma.booking.groupBy({
      by: ['artistId'],
      where: artistWhere,
      _count: true,
      _sum: { finalPrice: true },
    });

    return {
      artistPerformance: artistStats,
      period,
    };
  }

  private async generateProjectAnalytics(whereClause: any, period: string, projectIds?: string[]): Promise<any> {
    const projectWhere = { organizationId: whereClause.organizationId };
    if (projectIds && projectIds.length > 0) {
      projectWhere.id = { in: projectIds };
    }

    const projects = await this.prisma.project.groupBy({
      by: ['status'],
      where: projectWhere,
      _count: true,
    });

    return {
      projectsByStatus: projects.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      period,
    };
  }

  private async generatePerformanceAnalytics(whereClause: any, period: string): Promise<any> {
    // Comprehensive performance analytics
    const [bookingStats, revenueStats, artistStats] = await Promise.all([
      this.generateBookingAnalytics(whereClause, period),
      this.generateRevenueAnalytics(whereClause, period),
      this.generateArtistAnalytics(whereClause, period),
    ]);

    return {
      bookingPerformance: bookingStats,
      revenuePerformance: revenueStats,
      artistPerformance: artistStats,
      period,
    };
  }

  private async generateOverviewAnalytics(whereClause: any, period: string): Promise<any> {
    // General overview analytics
    return await this.generatePerformanceAnalytics(whereClause, period);
  }

  private async getMonthlyRevenue(orgId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const result = await this.prisma.booking.aggregate({
      where: {
        organizationId: orgId,
        paymentStatus: 'PAID',
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      _sum: { finalPrice: true },
    });

    return Number(result._sum.finalPrice) || 0;
  }
}
