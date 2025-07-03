// Creator Analytics Service for AuditoryX
// Provides comprehensive analytics for creator earnings, performance, and insights

import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  Timestamp,
  startAfter,
  limit
} from 'firebase/firestore';
import { app } from '@/lib/firebase';

export interface EarningsData {
  totalEarned: number;
  totalBookings: number;
  averageBookingValue: number;
  monthlyEarnings: { month: string; amount: number }[];
  weeklyEarnings: { week: string; amount: number }[];
  dailyEarnings: { date: string; amount: number }[];
}

export interface PerformanceMetrics {
  averageResponseTime: number; // in hours
  completionRate: number; // percentage
  averageRating: number;
  totalReviews: number;
  repeatClientRate: number; // percentage
  bookingCancellationRate: number; // percentage
}

export interface ClientMetrics {
  totalClients: number;
  newClientsThisMonth: number;
  topClients: Array<{
    clientId: string;
    clientName: string;
    totalSpent: number;
    bookingCount: number;
  }>;
  clientSatisfactionScore: number;
}

export interface RevenueInsights {
  bestPerformingServices: Array<{
    serviceId: string;
    serviceName: string;
    revenue: number;
    bookingCount: number;
  }>;
  peakBookingTimes: Array<{
    dayOfWeek: string;
    hour: number;
    bookingCount: number;
  }>;
  seasonalTrends: Array<{
    month: string;
    revenue: number;
    bookingCount: number;
  }>;
  priceOptimizationSuggestions: Array<{
    serviceId: string;
    currentPrice: number;
    suggestedPrice: number;
    expectedIncrease: number;
  }>;
}

export class CreatorAnalyticsService {
  private db = getFirestore(app);

  // Get comprehensive earnings data for a creator
  async getEarningsData(creatorId: string, timeRange: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<EarningsData> {
    const now = new Date();
    const startDate = this.getStartDate(now, timeRange);

    // Get bookings for the creator
    const bookingsRef = collection(this.db, 'bookings');
    const bookingsQuery = query(
      bookingsRef,
      where('providerId', '==', creatorId),
      where('status', '==', 'completed'),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('createdAt', 'desc')
    );

    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate total earnings
    const totalEarned = bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
    const totalBookings = bookings.length;
    const averageBookingValue = totalBookings > 0 ? totalEarned / totalBookings : 0;

    // Group earnings by time periods
    const monthlyEarnings = this.groupEarningsByMonth(bookings);
    const weeklyEarnings = this.groupEarningsByWeek(bookings);
    const dailyEarnings = this.groupEarningsByDay(bookings, timeRange);

    return {
      totalEarned,
      totalBookings,
      averageBookingValue,
      monthlyEarnings,
      weeklyEarnings,
      dailyEarnings
    };
  }

  // Get performance metrics for a creator
  async getPerformanceMetrics(creatorId: string): Promise<PerformanceMetrics> {
    // Get completed bookings
    const completedBookingsQuery = query(
      collection(this.db, 'bookings'),
      where('providerId', '==', creatorId),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc'),
      limit(100) // Last 100 bookings for performance calculation
    );

    const completedSnapshot = await getDocs(completedBookingsQuery);
    const completedBookings = completedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get all bookings (including cancelled)
    const allBookingsQuery = query(
      collection(this.db, 'bookings'),
      where('providerId', '==', creatorId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const allSnapshot = await getDocs(allBookingsQuery);
    const allBookings = allSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get reviews
    const reviewsQuery = query(
      collection(this.db, 'reviews'),
      where('providerId', '==', creatorId),
      orderBy('createdAt', 'desc')
    );

    const reviewsSnapshot = await getDocs(reviewsQuery);
    const reviews = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate metrics
    const averageResponseTime = this.calculateAverageResponseTime(completedBookings);
    const completionRate = allBookings.length > 0 ? (completedBookings.length / allBookings.length) * 100 : 0;
    const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0;
    const totalReviews = reviews.length;
    const repeatClientRate = this.calculateRepeatClientRate(completedBookings);
    const bookingCancellationRate = this.calculateCancellationRate(allBookings);

    return {
      averageResponseTime,
      completionRate,
      averageRating,
      totalReviews,
      repeatClientRate,
      bookingCancellationRate
    };
  }

  // Get client metrics for a creator
  async getClientMetrics(creatorId: string): Promise<ClientMetrics> {
    const bookingsQuery = query(
      collection(this.db, 'bookings'),
      where('providerId', '==', creatorId),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc')
    );

    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Group by client
    const clientData = new Map();
    bookings.forEach(booking => {
      const clientId = booking.clientId;
      if (!clientData.has(clientId)) {
        clientData.set(clientId, {
          clientId,
          clientName: booking.clientName || 'Unknown Client',
          totalSpent: 0,
          bookingCount: 0,
          firstBookingDate: booking.createdAt
        });
      }
      const client = clientData.get(clientId);
      client.totalSpent += booking.amount || 0;
      client.bookingCount += 1;
    });

    const clients = Array.from(clientData.values());
    const totalClients = clients.length;

    // New clients this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const newClientsThisMonth = clients.filter(client => 
      client.firstBookingDate.toDate() >= thisMonth
    ).length;

    // Top clients by spending
    const topClients = clients
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
      .map(({ clientId, clientName, totalSpent, bookingCount }) => ({
        clientId,
        clientName,
        totalSpent,
        bookingCount
      }));

    // Calculate satisfaction score from reviews
    const reviewsQuery = query(
      collection(this.db, 'reviews'),
      where('providerId', '==', creatorId)
    );
    const reviewsSnapshot = await getDocs(reviewsQuery);
    const reviews = reviewsSnapshot.docs.map(doc => doc.data());
    const clientSatisfactionScore = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length) * 20 // Convert to 0-100 scale
      : 0;

    return {
      totalClients,
      newClientsThisMonth,
      topClients,
      clientSatisfactionScore
    };
  }

  // Get revenue insights and optimization suggestions
  async getRevenueInsights(creatorId: string): Promise<RevenueInsights> {
    // Get completed bookings with service details
    const bookingsQuery = query(
      collection(this.db, 'bookings'),
      where('providerId', '==', creatorId),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc'),
      limit(200) // Analyze recent bookings
    );

    const bookingsSnapshot = await getDocs(bookingsQuery);
    const bookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Analyze service performance
    const servicePerformance = new Map();
    bookings.forEach(booking => {
      const serviceId = booking.serviceId || 'general';
      const serviceName = booking.serviceName || 'General Service';
      
      if (!servicePerformance.has(serviceId)) {
        servicePerformance.set(serviceId, {
          serviceId,
          serviceName,
          revenue: 0,
          bookingCount: 0,
          prices: []
        });
      }
      
      const service = servicePerformance.get(serviceId);
      service.revenue += booking.amount || 0;
      service.bookingCount += 1;
      service.prices.push(booking.amount || 0);
    });

    const bestPerformingServices = Array.from(servicePerformance.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(({ serviceId, serviceName, revenue, bookingCount }) => ({
        serviceId,
        serviceName,
        revenue,
        bookingCount
      }));

    // Analyze booking patterns
    const peakBookingTimes = this.analyzePeakBookingTimes(bookings);
    const seasonalTrends = this.analyzeSeasonalTrends(bookings);
    const priceOptimizationSuggestions = this.generatePriceOptimizationSuggestions(servicePerformance);

    return {
      bestPerformingServices,
      peakBookingTimes,
      seasonalTrends,
      priceOptimizationSuggestions
    };
  }

  // Helper methods
  private getStartDate(now: Date, timeRange: string): Date {
    const date = new Date(now);
    switch (timeRange) {
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'quarter':
        date.setMonth(date.getMonth() - 3);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() - 1);
        break;
    }
    return date;
  }

  private groupEarningsByMonth(bookings: any[]): { month: string; amount: number }[] {
    const monthlyData = new Map();
    
    bookings.forEach(booking => {
      const date = booking.createdAt.toDate();
      const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData.has(month)) {
        monthlyData.set(month, 0);
      }
      monthlyData.set(month, monthlyData.get(month) + (booking.amount || 0));
    });

    return Array.from(monthlyData.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }

  private groupEarningsByWeek(bookings: any[]): { week: string; amount: number }[] {
    const weeklyData = new Map();
    
    bookings.forEach(booking => {
      const date = booking.createdAt.toDate();
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const week = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!weeklyData.has(week)) {
        weeklyData.set(week, 0);
      }
      weeklyData.set(week, weeklyData.get(week) + (booking.amount || 0));
    });

    return Array.from(weeklyData.entries())
      .map(([week, amount]) => ({ week, amount }))
      .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());
  }

  private groupEarningsByDay(bookings: any[], timeRange: string): { date: string; amount: number }[] {
    if (timeRange !== 'week' && timeRange !== 'month') return [];
    
    const dailyData = new Map();
    
    bookings.forEach(booking => {
      const date = booking.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!dailyData.has(date)) {
        dailyData.set(date, 0);
      }
      dailyData.set(date, dailyData.get(date) + (booking.amount || 0));
    });

    return Array.from(dailyData.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private calculateAverageResponseTime(bookings: any[]): number {
    // Mock calculation - in reality, you'd track response times
    return Math.random() * 12 + 1; // 1-13 hours
  }

  private calculateRepeatClientRate(bookings: any[]): number {
    const clientCounts = new Map();
    bookings.forEach(booking => {
      const clientId = booking.clientId;
      clientCounts.set(clientId, (clientCounts.get(clientId) || 0) + 1);
    });

    const repeatClients = Array.from(clientCounts.values()).filter(count => count > 1).length;
    const totalClients = clientCounts.size;
    
    return totalClients > 0 ? (repeatClients / totalClients) * 100 : 0;
  }

  private calculateCancellationRate(bookings: any[]): number {
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    return bookings.length > 0 ? (cancelledBookings / bookings.length) * 100 : 0;
  }

  private analyzePeakBookingTimes(bookings: any[]) {
    const timeData = new Map();
    
    bookings.forEach(booking => {
      const date = booking.createdAt.toDate();
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();
      const key = `${dayOfWeek}-${hour}`;
      
      if (!timeData.has(key)) {
        timeData.set(key, { dayOfWeek, hour, bookingCount: 0 });
      }
      timeData.get(key).bookingCount += 1;
    });

    return Array.from(timeData.values())
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 5);
  }

  private analyzeSeasonalTrends(bookings: any[]) {
    const monthlyData = new Map();
    
    bookings.forEach(booking => {
      const month = booking.createdAt.toDate().toLocaleDateString('en-US', { month: 'long' });
      
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { month, revenue: 0, bookingCount: 0 });
      }
      const data = monthlyData.get(month);
      data.revenue += booking.amount || 0;
      data.bookingCount += 1;
    });

    return Array.from(monthlyData.values())
      .sort((a, b) => b.revenue - a.revenue);
  }

  private generatePriceOptimizationSuggestions(servicePerformance: Map<string, any>) {
    return Array.from(servicePerformance.values())
      .filter(service => service.prices.length >= 3)
      .map(service => {
        const averagePrice = service.prices.reduce((sum: number, price: number) => sum + price, 0) / service.prices.length;
        const demandScore = service.bookingCount / service.prices.length;
        
        // Simple optimization logic - increase price if high demand
        const suggestedMultiplier = demandScore > 2 ? 1.15 : demandScore > 1 ? 1.08 : 0.95;
        const suggestedPrice = Math.round(averagePrice * suggestedMultiplier);
        const expectedIncrease = ((suggestedPrice - averagePrice) / averagePrice) * 100;

        return {
          serviceId: service.serviceId,
          currentPrice: Math.round(averagePrice),
          suggestedPrice,
          expectedIncrease: Math.round(expectedIncrease)
        };
      })
      .filter(suggestion => Math.abs(suggestion.expectedIncrease) > 5); // Only significant suggestions
  }
}

// Singleton instance
export const creatorAnalyticsService = new CreatorAnalyticsService();
