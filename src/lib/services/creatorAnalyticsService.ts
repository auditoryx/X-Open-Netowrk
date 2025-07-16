// Creator Analytics Service for AuditoryX
// Provides comprehensive analytics and performance metrics for creators

import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  Timestamp,
  startAfter,
  Query
} from 'firebase/firestore';
import { app } from '@/lib/firebase';

export interface AnalyticsMetrics {
  // Revenue metrics
  totalEarnings: number;
  monthlyEarnings: number;
  averageOrderValue: number;
  earningsGrowth: number;
  
  // Performance metrics
  totalBookings: number;
  completedBookings: number;
  completionRate: number;
  averageRating: number;
  
  // Engagement metrics
  profileViews: number;
  messageResponseTime: number; // in hours
  responseRate: number;
  
  // Time-based metrics
  peakBookingDays: string[];
  busyHours: number[];
  seasonalTrends: { [month: string]: number };
}

export interface BookingAnalytics {
  id: string;
  clientName: string;
  serviceName: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  completedAt?: Timestamp;
  rating?: number;
  clientFeedback?: string;
}

export interface RevenueData {
  date: string;
  earnings: number;
  bookingsCount: number;
  averageValue: number;
}

export interface PerformanceInsight {
  type: 'improvement' | 'achievement' | 'warning';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
}

export class CreatorAnalyticsService {
  private db = getFirestore(app);

  // Get comprehensive analytics for a creator
  async getCreatorMetrics(creatorId: string, timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AnalyticsMetrics> {
    const endDate = new Date();
    const startDate = this.getStartDate(endDate, timeRange);
    
    try {
      const [bookings, previousBookings] = await Promise.all([
        this.getBookingsInRange(creatorId, startDate, endDate),
        this.getBookingsInRange(creatorId, this.getPreviousPeriodStart(startDate, endDate), startDate)
      ]);

      const completedBookings = bookings.filter(b => b.status === 'completed');
      const totalEarnings = completedBookings.reduce((sum, b) => sum + b.amount, 0);
      const previousEarnings = previousBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.amount, 0);
      
      const profileViews = await this.getProfileViews(creatorId, startDate, endDate);
      const messageMetrics = await this.getMessageMetrics(creatorId, startDate, endDate);

      return {
        totalEarnings,
        monthlyEarnings: timeRange === '30d' ? totalEarnings : this.extrapolateMonthly(totalEarnings, timeRange),
        averageOrderValue: completedBookings.length > 0 ? totalEarnings / completedBookings.length : 0,
        earningsGrowth: previousEarnings > 0 ? ((totalEarnings - previousEarnings) / previousEarnings) * 100 : 0,
        
        totalBookings: bookings.length,
        completedBookings: completedBookings.length,
        completionRate: bookings.length > 0 ? (completedBookings.length / bookings.length) * 100 : 0,
        averageRating: this.calculateAverageRating(completedBookings),
        
        profileViews,
        messageResponseTime: messageMetrics.averageResponseTime,
        responseRate: messageMetrics.responseRate,
        
        peakBookingDays: this.calculatePeakDays(bookings),
        busyHours: this.calculateBusyHours(bookings),
        seasonalTrends: this.calculateSeasonalTrends(bookings)
      };
    } catch (error) {
      console.error('Error fetching creator metrics:', error);
      throw error;
    }
  }

  // Get detailed booking analytics
  async getBookingAnalytics(creatorId: string, page: number = 1, pageSize: number = 20): Promise<{
    bookings: BookingAnalytics[];
    hasMore: boolean;
    totalCount: number;
  }> {
    try {
      const bookingsRef = collection(this.db, 'bookings');
      const q = query(
        bookingsRef,
        where(SCHEMA_FIELDS.SERVICE.CREATOR_ID, '==', creatorId),
        orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc'),
        limit(pageSize + 1) // Get one extra to check if there are more
      );

      const snapshot = await getDocs(q);
      const bookings: BookingAnalytics[] = [];
      
      snapshot.forEach((doc, index) => {
        if (index < pageSize) {
          const data = doc.data();
          bookings.push({
            id: doc.id,
            clientName: data.clientName || 'Unknown Client',
            serviceName: data.serviceName || 'Service',
            amount: data.amount || 0,
            status: data.status,
            createdAt: data.createdAt,
            completedAt: data.completedAt,
            rating: data.rating,
            clientFeedback: data.clientFeedback
          });
        }
      });

      return {
        bookings,
        hasMore: snapshot.docs.length > pageSize,
        totalCount: bookings.length // This is approximate, for exact count you'd need a separate query
      };
    } catch (error) {
      console.error('Error fetching booking analytics:', error);
      throw error;
    }
  }

  // Get revenue data for charts
  async getRevenueData(creatorId: string, timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<RevenueData[]> {
    const endDate = new Date();
    const startDate = this.getStartDate(endDate, timeRange);
    
    try {
      const bookings = await this.getBookingsInRange(creatorId, startDate, endDate);
      const completedBookings = bookings.filter(b => b.status === 'completed');
      
      // Group by date
      const revenueByDate: { [date: string]: { earnings: number; count: number } } = {};
      
      completedBookings.forEach(booking => {
        const date = booking.completedAt?.toDate().toISOString().split('T')[0] || 
                     booking.createdAt.toDate().toISOString().split('T')[0];
        
        if (!revenueByDate[date]) {
          revenueByDate[date] = { earnings: 0, count: 0 };
        }
        
        revenueByDate[date].earnings += booking.amount;
        revenueByDate[date].count += 1;
      });

      // Convert to array and sort
      return Object.entries(revenueByDate)
        .map(([date, data]) => ({
          date,
          earnings: data.earnings,
          bookingsCount: data.count,
          averageValue: data.earnings / data.count
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      throw error;
    }
  }

  // Get performance insights and recommendations
  async getPerformanceInsights(creatorId: string): Promise<PerformanceInsight[]> {
    try {
      const metrics = await this.getCreatorMetrics(creatorId, '30d');
      const insights: PerformanceInsight[] = [];

      // Revenue insights
      if (metrics.earningsGrowth > 20) {
        insights.push({
          type: 'achievement',
          title: 'Strong Revenue Growth',
          description: `Your earnings have grown by ${metrics.earningsGrowth.toFixed(1)}% this month!`,
          actionable: false,
          priority: 'low'
        });
      } else if (metrics.earningsGrowth < -10) {
        insights.push({
          type: 'warning',
          title: 'Revenue Decline',
          description: `Your earnings have decreased by ${Math.abs(metrics.earningsGrowth).toFixed(1)}%. Consider updating your services or pricing.`,
          actionable: true,
          priority: 'high'
        });
      }

      // Response time insights
      if (metrics.messageResponseTime > 24) {
        insights.push({
          type: 'improvement',
          title: 'Improve Response Time',
          description: `Your average response time is ${metrics.messageResponseTime.toFixed(1)} hours. Faster responses can increase bookings.`,
          actionable: true,
          priority: 'medium'
        });
      }

      // Completion rate insights
      if (metrics.completionRate < 80) {
        insights.push({
          type: 'warning',
          title: 'Low Completion Rate',
          description: `Your completion rate is ${metrics.completionRate.toFixed(1)}%. Focus on project management and client communication.`,
          actionable: true,
          priority: 'high'
        });
      }

      // Rating insights
      if (metrics.averageRating < 4.0 && metrics.averageRating > 0) {
        insights.push({
          type: 'improvement',
          title: 'Improve Service Quality',
          description: `Your average rating is ${metrics.averageRating.toFixed(1)}. Focus on exceeding client expectations.`,
          actionable: true,
          priority: 'medium'
        });
      }

      return insights.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } catch (error) {
      console.error('Error generating performance insights:', error);
      return [];
    }
  }

  // Export analytics data
  async exportAnalyticsData(creatorId: string, format: 'csv' | 'json' = 'csv'): Promise<string> {
    try {
      const [metrics, bookings, revenueData] = await Promise.all([
        this.getCreatorMetrics(creatorId, '1y'),
        this.getBookingAnalytics(creatorId, 1, 1000),
        this.getRevenueData(creatorId, '1y')
      ]);

      if (format === 'json') {
        return JSON.stringify({
          exportDate: new Date().toISOString(),
          creatorId,
          metrics,
          bookings: bookings.bookings,
          revenueData
        }, null, 2);
      }

      // CSV format
      const csvLines = [
        'Export Date,Creator ID,Total Earnings,Monthly Earnings,Total Bookings,Completion Rate,Average Rating',
        `${new Date().toISOString()},${creatorId},${metrics.totalEarnings},${metrics.monthlyEarnings},${metrics.totalBookings},${metrics.completionRate},${metrics.averageRating}`,
        '',
        'Booking Details:',
        'Date,Client,Service,Amount,Status,Rating',
        ...bookings.bookings.map(b => 
          `${b.createdAt.toDate().toISOString()},${b.clientName},${b.serviceName},${b.amount},${b.status},${b.rating || ''}`
        )
      ];

      return csvLines.join('\n');
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw error;
    }
  }

  // Helper methods
  private getStartDate(endDate: Date, timeRange: string): Date {
    const start = new Date(endDate);
    switch (timeRange) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }
    return start;
  }

  private getPreviousPeriodStart(startDate: Date, endDate: Date): Date {
    const periodLength = endDate.getTime() - startDate.getTime();
    return new Date(startDate.getTime() - periodLength);
  }

  private async getBookingsInRange(creatorId: string, startDate: Date, endDate: Date): Promise<BookingAnalytics[]> {
    const bookingsRef = collection(this.db, 'bookings');
    const q = query(
      bookingsRef,
      where(SCHEMA_FIELDS.SERVICE.CREATOR_ID, '==', creatorId),
      where(SCHEMA_FIELDS.USER.CREATED_AT, '>=', Timestamp.fromDate(startDate)),
      where(SCHEMA_FIELDS.USER.CREATED_AT, '<=', Timestamp.fromDate(endDate)),
      orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc')
    );

    const snapshot = await getDocs(q);
    const bookings: BookingAnalytics[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      bookings.push({
        id: doc.id,
        clientName: data.clientName || 'Unknown Client',
        serviceName: data.serviceName || 'Service',
        amount: data.amount || 0,
        status: data.status,
        createdAt: data.createdAt,
        completedAt: data.completedAt,
        rating: data.rating,
        clientFeedback: data.clientFeedback
      });
    });

    return bookings;
  }

  private async getProfileViews(creatorId: string, startDate: Date, endDate: Date): Promise<number> {
    // This would integrate with your analytics tracking system
    // For now, return a mock value
    return Math.floor(Math.random() * 1000) + 100;
  }

  private async getMessageMetrics(creatorId: string, startDate: Date, endDate: Date): Promise<{
    averageResponseTime: number;
    responseRate: number;
  }> {
    // This would analyze message response times from the messaging system
    // For now, return mock values
    return {
      averageResponseTime: Math.random() * 24 + 1, // 1-25 hours
      responseRate: Math.random() * 20 + 80 // 80-100%
    };
  }

  private calculateAverageRating(bookings: BookingAnalytics[]): number {
    const ratedBookings = bookings.filter(b => b.rating && b.rating > 0);
    if (ratedBookings.length === 0) return 0;
    
    const sum = ratedBookings.reduce((total, b) => total + (b.rating || 0), 0);
    return sum / ratedBookings.length;
  }

  private calculatePeakDays(bookings: BookingAnalytics[]): string[] {
    const dayCount: { [day: string]: number } = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    bookings.forEach(booking => {
      const day = days[booking.createdAt.toDate().getDay()];
      dayCount[day] = (dayCount[day] || 0) + 1;
    });

    return Object.entries(dayCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);
  }

  private calculateBusyHours(bookings: BookingAnalytics[]): number[] {
    const hourCount: { [hour: number]: number } = {};
    
    bookings.forEach(booking => {
      const hour = booking.createdAt.toDate().getHours();
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });

    return Object.entries(hourCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([hour]) => parseInt(hour));
  }

  private calculateSeasonalTrends(bookings: BookingAnalytics[]): { [month: string]: number } {
    const monthCount: { [month: string]: number } = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    bookings.forEach(booking => {
      const month = months[booking.createdAt.toDate().getMonth()];
      monthCount[month] = (monthCount[month] || 0) + 1;
    });

    return monthCount;
  }

  private extrapolateMonthly(earnings: number, timeRange: string): number {
    switch (timeRange) {
      case '7d':
        return earnings * 4.33; // Approximate weeks in a month
      case '90d':
        return earnings / 3;
      case '1y':
        return earnings / 12;
      default:
        return earnings;
    }
  }
}

// Singleton instance
export const creatorAnalyticsService = new CreatorAnalyticsService();
