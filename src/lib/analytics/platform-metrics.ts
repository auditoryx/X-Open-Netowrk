/**
 * Platform Analytics Service
 * 
 * Provides comprehensive analytics and reporting for the AuditoryX platform
 */

import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PlatformMetrics {
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  creatorCount: number;
  clientCount: number;
  verifiedCreators: number;
  growthMetrics: {
    userGrowthRate: number;
    revenueGrowthRate: number;
    bookingGrowthRate: number;
  };
}

export interface UserMetrics {
  registrations: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  retention: {
    day1: number;
    day7: number;
    day30: number;
  };
  engagement: {
    averageSessionDuration: number;
    pagesPerSession: number;
    bounceRate: number;
  };
  userTypes: {
    creators: number;
    clients: number;
    admins: number;
  };
}

export interface BookingMetrics {
  totalBookings: number;
  bookingsByStatus: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  bookingsByTier: {
    standard: number;
    verified: number;
    signature: number;
  };
  averageBookingValue: number;
  cancellationRate: number;
  completionRate: number;
  averageTimeToCompletion: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  platformFee: number;
  creatorEarnings: number;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  revenueByService: Array<{
    serviceType: string;
    revenue: number;
    count: number;
  }>;
  topCreators: Array<{
    creatorId: string;
    creatorName: string;
    earnings: number;
    bookingsCount: number;
  }>;
}

export interface AnalyticsTimeRange {
  start: Date;
  end: Date;
}

class PlatformAnalyticsService {
  /**
   * Get comprehensive platform metrics
   */
  async getPlatformMetrics(timeRange?: AnalyticsTimeRange): Promise<PlatformMetrics> {
    try {
      const now = new Date();
      const defaultRange = {
        start: new Date(now.getFullYear(), now.getMonth(), 1), // Start of current month
        end: now,
      };
      
      const range = timeRange || defaultRange;

      // Get user metrics
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const totalUsers = usersSnapshot.size;

      // Calculate active users (simplified - based on last login)
      const dailyActiveQuery = query(
        usersCollection,
        where('lastLoginAt', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000))
      );
      const dailyActiveSnapshot = await getDocs(dailyActiveQuery);
      const dailyActive = dailyActiveSnapshot.size;

      const weeklyActiveQuery = query(
        usersCollection,
        where('lastLoginAt', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      );
      const weeklyActiveSnapshot = await getDocs(weeklyActiveQuery);
      const weeklyActive = weeklyActiveSnapshot.size;

      const monthlyActiveQuery = query(
        usersCollection,
        where('lastLoginAt', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      );
      const monthlyActiveSnapshot = await getDocs(monthlyActiveQuery);
      const monthlyActive = monthlyActiveSnapshot.size;

      // Get booking metrics
      const bookingsCollection = collection(db, 'bookings');
      const bookingsSnapshot = await getDocs(bookingsCollection);
      const totalBookings = bookingsSnapshot.size;

      const completedBookingsQuery = query(
        bookingsCollection,
        where('status', '==', 'completed')
      );
      const completedBookingsSnapshot = await getDocs(completedBookingsQuery);
      const completedBookings = completedBookingsSnapshot.size;

      // Calculate revenue
      let totalRevenue = 0;
      completedBookingsSnapshot.forEach((doc) => {
        const booking = doc.data();
        if (booking.amount) {
          totalRevenue += booking.amount;
        }
      });

      const averageOrderValue = completedBookings > 0 ? totalRevenue / completedBookings : 0;

      // Get creator and client counts
      const creatorsQuery = query(usersCollection, where('roles', 'array-contains', 'creator'));
      const creatorsSnapshot = await getDocs(creatorsQuery);
      const creatorCount = creatorsSnapshot.size;

      const clientsQuery = query(usersCollection, where('roles', 'array-contains', 'client'));
      const clientsSnapshot = await getDocs(clientsQuery);
      const clientCount = clientsSnapshot.size;

      const verifiedCreatorsQuery = query(
        usersCollection,
        where('roles', 'array-contains', 'creator'),
        where('verificationStatus', '==', 'verified')
      );
      const verifiedCreatorsSnapshot = await getDocs(verifiedCreatorsQuery);
      const verifiedCreators = verifiedCreatorsSnapshot.size;

      // Calculate conversion rate (simplified)
      const conversionRate = totalUsers > 0 ? (completedBookings / totalUsers) * 100 : 0;

      // Calculate growth metrics (simplified - would need historical data for accurate calculation)
      const userGrowthRate = 0; // Placeholder
      const revenueGrowthRate = 0; // Placeholder
      const bookingGrowthRate = 0; // Placeholder

      return {
        totalUsers,
        activeUsers: {
          daily: dailyActive,
          weekly: weeklyActive,
          monthly: monthlyActive,
        },
        totalBookings,
        completedBookings,
        totalRevenue,
        averageOrderValue,
        conversionRate,
        creatorCount,
        clientCount,
        verifiedCreators,
        growthMetrics: {
          userGrowthRate,
          revenueGrowthRate,
          bookingGrowthRate,
        },
      };
    } catch (error) {
      console.error('Error fetching platform metrics:', error);
      throw new Error('Failed to fetch platform metrics');
    }
  }

  /**
   * Get detailed user metrics
   */
  async getUserMetrics(timeRange?: AnalyticsTimeRange): Promise<UserMetrics> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const usersCollection = collection(db, 'users');

      // Registration metrics
      const todayRegistrationsQuery = query(
        usersCollection,
        where('createdAt', '>=', today)
      );
      const todayRegistrationsSnapshot = await getDocs(todayRegistrationsQuery);
      const todayRegistrations = todayRegistrationsSnapshot.size;

      const weekRegistrationsQuery = query(
        usersCollection,
        where('createdAt', '>=', weekAgo)
      );
      const weekRegistrationsSnapshot = await getDocs(weekRegistrationsQuery);
      const weekRegistrations = weekRegistrationsSnapshot.size;

      const monthRegistrationsQuery = query(
        usersCollection,
        where('createdAt', '>=', monthAgo)
      );
      const monthRegistrationsSnapshot = await getDocs(monthRegistrationsQuery);
      const monthRegistrations = monthRegistrationsSnapshot.size;

      // User type counts
      const creatorsQuery = query(usersCollection, where('roles', 'array-contains', 'creator'));
      const creatorsSnapshot = await getDocs(creatorsQuery);
      const creators = creatorsSnapshot.size;

      const clientsQuery = query(usersCollection, where('roles', 'array-contains', 'client'));
      const clientsSnapshot = await getDocs(clientsQuery);
      const clients = clientsSnapshot.size;

      const adminsQuery = query(usersCollection, where('roles', 'array-contains', 'admin'));
      const adminsSnapshot = await getDocs(adminsQuery);
      const admins = adminsSnapshot.size;

      // Retention and engagement metrics (simplified)
      // In a real implementation, these would be calculated from session data
      const retention = {
        day1: 75, // Placeholder percentage
        day7: 45, // Placeholder percentage
        day30: 25, // Placeholder percentage
      };

      const engagement = {
        averageSessionDuration: 18, // Placeholder minutes
        pagesPerSession: 5.2, // Placeholder
        bounceRate: 35, // Placeholder percentage
      };

      return {
        registrations: {
          today: todayRegistrations,
          thisWeek: weekRegistrations,
          thisMonth: monthRegistrations,
        },
        retention,
        engagement,
        userTypes: {
          creators,
          clients,
          admins,
        },
      };
    } catch (error) {
      console.error('Error fetching user metrics:', error);
      throw new Error('Failed to fetch user metrics');
    }
  }

  /**
   * Get detailed booking metrics
   */
  async getBookingMetrics(timeRange?: AnalyticsTimeRange): Promise<BookingMetrics> {
    try {
      const bookingsCollection = collection(db, 'bookings');
      const bookingsSnapshot = await getDocs(bookingsCollection);
      
      let totalBookings = 0;
      const statusCounts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
      const tierCounts = { standard: 0, verified: 0, signature: 0 };
      let totalValue = 0;
      let completedValue = 0;
      let completedCount = 0;
      const completionTimes: number[] = [];

      bookingsSnapshot.forEach((doc) => {
        const booking = doc.data();
        totalBookings++;

        // Count by status
        if (booking.status in statusCounts) {
          statusCounts[booking.status as keyof typeof statusCounts]++;
        }

        // Count by tier (if available)
        if (booking.creatorTier && booking.creatorTier in tierCounts) {
          tierCounts[booking.creatorTier as keyof typeof tierCounts]++;
        }

        // Calculate value metrics
        if (booking.amount) {
          totalValue += booking.amount;
          if (booking.status === 'completed') {
            completedValue += booking.amount;
            completedCount++;

            // Calculate completion time if available
            if (booking.createdAt && booking.completedAt) {
              const createdAt = booking.createdAt.toDate?.() || booking.createdAt;
              const completedAt = booking.completedAt.toDate?.() || booking.completedAt;
              const completionTime = (completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24); // days
              completionTimes.push(completionTime);
            }
          }
        }
      });

      const averageBookingValue = totalBookings > 0 ? totalValue / totalBookings : 0;
      const cancellationRate = totalBookings > 0 ? (statusCounts.cancelled / totalBookings) * 100 : 0;
      const completionRate = totalBookings > 0 ? (statusCounts.completed / totalBookings) * 100 : 0;
      const averageTimeToCompletion = completionTimes.length > 0 
        ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
        : 0;

      return {
        totalBookings,
        bookingsByStatus: statusCounts,
        bookingsByTier: tierCounts,
        averageBookingValue,
        cancellationRate,
        completionRate,
        averageTimeToCompletion,
      };
    } catch (error) {
      console.error('Error fetching booking metrics:', error);
      throw new Error('Failed to fetch booking metrics');
    }
  }

  /**
   * Get detailed revenue metrics
   */
  async getRevenueMetrics(timeRange?: AnalyticsTimeRange): Promise<RevenueMetrics> {
    try {
      const bookingsCollection = collection(db, 'bookings');
      const completedBookingsQuery = query(
        bookingsCollection,
        where('status', '==', 'completed')
      );
      const completedBookingsSnapshot = await getDocs(completedBookingsQuery);

      let totalRevenue = 0;
      let platformFee = 0;
      let creatorEarnings = 0;
      const monthlyRevenue = new Map<string, { revenue: number; bookings: number }>();
      const serviceRevenue = new Map<string, { revenue: number; count: number }>();
      const creatorEarningsMap = new Map<string, { earnings: number; bookings: number; name: string }>();

      completedBookingsSnapshot.forEach((doc) => {
        const booking = doc.data();
        const amount = booking.amount || 0;
        const fee = amount * 0.1; // 10% platform fee
        const earnings = amount - fee;

        totalRevenue += amount;
        platformFee += fee;
        creatorEarnings += earnings;

        // Monthly revenue
        if (booking.createdAt) {
          const date = booking.createdAt.toDate?.() || booking.createdAt;
          const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          const existing = monthlyRevenue.get(monthKey) || { revenue: 0, bookings: 0 };
          monthlyRevenue.set(monthKey, {
            revenue: existing.revenue + amount,
            bookings: existing.bookings + 1,
          });
        }

        // Service revenue
        const serviceType = booking.serviceType || 'Unknown';
        const existing = serviceRevenue.get(serviceType) || { revenue: 0, count: 0 };
        serviceRevenue.set(serviceType, {
          revenue: existing.revenue + amount,
          count: existing.count + 1,
        });

        // Creator earnings
        if (booking.providerId) {
          const creatorData = creatorEarningsMap.get(booking.providerId) || { 
            earnings: 0, 
            bookings: 0, 
            name: booking.providerName || 'Unknown' 
          };
          creatorEarningsMap.set(booking.providerId, {
            earnings: creatorData.earnings + earnings,
            bookings: creatorData.bookings + 1,
            name: creatorData.name,
          });
        }
      });

      // Convert maps to arrays and sort
      const revenueByMonth = Array.from(monthlyRevenue.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month));

      const revenueByService = Array.from(serviceRevenue.entries())
        .map(([serviceType, data]) => ({ serviceType, ...data }))
        .sort((a, b) => b.revenue - a.revenue);

      const topCreators = Array.from(creatorEarningsMap.entries())
        .map(([creatorId, data]) => ({ 
          creatorId, 
          creatorName: data.name,
          earnings: data.earnings,
          bookingsCount: data.bookings 
        }))
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 10); // Top 10 creators

      return {
        totalRevenue,
        platformFee,
        creatorEarnings,
        revenueByMonth,
        revenueByService,
        topCreators,
      };
    } catch (error) {
      console.error('Error fetching revenue metrics:', error);
      throw new Error('Failed to fetch revenue metrics');
    }
  }

  /**
   * Export analytics data to CSV
   */
  async exportAnalyticsData(type: 'users' | 'bookings' | 'revenue', timeRange?: AnalyticsTimeRange): Promise<string> {
    try {
      let csvData = '';

      switch (type) {
        case 'users':
          const userMetrics = await this.getUserMetrics(timeRange);
          csvData = this.convertUserMetricsToCSV(userMetrics);
          break;
        case 'bookings':
          const bookingMetrics = await this.getBookingMetrics(timeRange);
          csvData = this.convertBookingMetricsToCSV(bookingMetrics);
          break;
        case 'revenue':
          const revenueMetrics = await this.getRevenueMetrics(timeRange);
          csvData = this.convertRevenueMetricsToCSV(revenueMetrics);
          break;
        default:
          throw new Error('Invalid export type');
      }

      return csvData;
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw new Error('Failed to export analytics data');
    }
  }

  private convertUserMetricsToCSV(metrics: UserMetrics): string {
    const rows = [
      ['Metric', 'Value'],
      ['Registrations Today', metrics.registrations.today.toString()],
      ['Registrations This Week', metrics.registrations.thisWeek.toString()],
      ['Registrations This Month', metrics.registrations.thisMonth.toString()],
      ['Day 1 Retention %', metrics.retention.day1.toString()],
      ['Day 7 Retention %', metrics.retention.day7.toString()],
      ['Day 30 Retention %', metrics.retention.day30.toString()],
      ['Avg Session Duration (min)', metrics.engagement.averageSessionDuration.toString()],
      ['Pages Per Session', metrics.engagement.pagesPerSession.toString()],
      ['Bounce Rate %', metrics.engagement.bounceRate.toString()],
      ['Total Creators', metrics.userTypes.creators.toString()],
      ['Total Clients', metrics.userTypes.clients.toString()],
      ['Total Admins', metrics.userTypes.admins.toString()],
    ];

    return rows.map(row => row.join(',')).join('\n');
  }

  private convertBookingMetricsToCSV(metrics: BookingMetrics): string {
    const rows = [
      ['Metric', 'Value'],
      ['Total Bookings', metrics.totalBookings.toString()],
      ['Pending Bookings', metrics.bookingsByStatus.pending.toString()],
      ['Confirmed Bookings', metrics.bookingsByStatus.confirmed.toString()],
      ['Completed Bookings', metrics.bookingsByStatus.completed.toString()],
      ['Cancelled Bookings', metrics.bookingsByStatus.cancelled.toString()],
      ['Standard Tier Bookings', metrics.bookingsByTier.standard.toString()],
      ['Verified Tier Bookings', metrics.bookingsByTier.verified.toString()],
      ['Signature Tier Bookings', metrics.bookingsByTier.signature.toString()],
      ['Average Booking Value', metrics.averageBookingValue.toFixed(2)],
      ['Cancellation Rate %', metrics.cancellationRate.toFixed(2)],
      ['Completion Rate %', metrics.completionRate.toFixed(2)],
      ['Avg Time to Completion (days)', metrics.averageTimeToCompletion.toFixed(2)],
    ];

    return rows.map(row => row.join(',')).join('\n');
  }

  private convertRevenueMetricsToCSV(metrics: RevenueMetrics): string {
    const rows = [
      ['Metric', 'Value'],
      ['Total Revenue', metrics.totalRevenue.toFixed(2)],
      ['Platform Fee', metrics.platformFee.toFixed(2)],
      ['Creator Earnings', metrics.creatorEarnings.toFixed(2)],
      ...metrics.revenueByMonth.map(item => [`Revenue ${item.month}`, item.revenue.toFixed(2)]),
      ...metrics.topCreators.map(creator => [`${creator.creatorName} Earnings`, creator.earnings.toFixed(2)]),
    ];

    return rows.map(row => row.join(',')).join('\n');
  }
}

export const platformAnalytics = new PlatformAnalyticsService();