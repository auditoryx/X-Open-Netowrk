/**
 * Tests for Platform Analytics Service
 */

import { platformAnalytics } from '../platform-metrics';

// Mock Firebase Firestore
const mockFirestore = {
  collection: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
};

// Mock the firebase module
jest.mock('@/lib/firebase', () => ({
  db: mockFirestore,
}));

describe('Platform Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock responses
    mockFirestore.collection.mockReturnValue({ id: 'mock-collection' });
    mockFirestore.getDocs.mockResolvedValue({
      size: 100,
      forEach: jest.fn((callback) => {
        // Mock some documents
        for (let i = 0; i < 10; i++) {
          callback({
            data: () => ({
              amount: 1000 + i * 100,
              status: i % 4 === 0 ? 'completed' : i % 4 === 1 ? 'pending' : i % 4 === 2 ? 'confirmed' : 'cancelled',
              createdAt: {
                toDate: () => new Date(),
              },
              serviceType: 'audio-production',
              providerId: `provider-${i}`,
              providerName: `Provider ${i}`,
              role: i % 2 === 0 ? 'creator' : 'client',
              verificationStatus: i % 3 === 0 ? 'verified' : 'unverified',
              lastLoginAt: new Date(),
            }),
          });
        }
      }),
    });
    mockFirestore.query.mockReturnValue({ id: 'mock-query' });
    mockFirestore.where.mockReturnValue({ id: 'mock-where' });
    mockFirestore.orderBy.mockReturnValue({ id: 'mock-orderBy' });
    mockFirestore.limit.mockReturnValue({ id: 'mock-limit' });
  });

  describe('getPlatformMetrics', () => {
    it('should return comprehensive platform metrics', async () => {
      const metrics = await platformAnalytics.getPlatformMetrics();

      expect(metrics).toHaveProperty('totalUsers');
      expect(metrics).toHaveProperty('activeUsers');
      expect(metrics).toHaveProperty('totalBookings');
      expect(metrics).toHaveProperty('completedBookings');
      expect(metrics).toHaveProperty('totalRevenue');
      expect(metrics).toHaveProperty('averageOrderValue');
      expect(metrics).toHaveProperty('conversionRate');
      expect(metrics).toHaveProperty('creatorCount');
      expect(metrics).toHaveProperty('clientCount');
      expect(metrics).toHaveProperty('verifiedCreators');
      expect(metrics).toHaveProperty('growthMetrics');

      expect(typeof metrics.totalUsers).toBe('number');
      expect(typeof metrics.totalRevenue).toBe('number');
      expect(typeof metrics.conversionRate).toBe('number');
    });

    it('should handle date range filtering', async () => {
      const timeRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31'),
      };

      const metrics = await platformAnalytics.getPlatformMetrics(timeRange);

      expect(metrics).toBeDefined();
      expect(mockFirestore.collection).toHaveBeenCalled();
    });

    it('should calculate correct active user metrics', async () => {
      const metrics = await platformAnalytics.getPlatformMetrics();

      expect(metrics.activeUsers).toHaveProperty('daily');
      expect(metrics.activeUsers).toHaveProperty('weekly');
      expect(metrics.activeUsers).toHaveProperty('monthly');
      expect(metrics.activeUsers.daily).toBeLessThanOrEqual(metrics.activeUsers.weekly);
      expect(metrics.activeUsers.weekly).toBeLessThanOrEqual(metrics.activeUsers.monthly);
    });
  });

  describe('getUserMetrics', () => {
    it('should return detailed user metrics', async () => {
      const metrics = await platformAnalytics.getUserMetrics();

      expect(metrics).toHaveProperty('registrations');
      expect(metrics).toHaveProperty('retention');
      expect(metrics).toHaveProperty('engagement');
      expect(metrics).toHaveProperty('userTypes');

      expect(metrics.registrations).toHaveProperty('today');
      expect(metrics.registrations).toHaveProperty('thisWeek');
      expect(metrics.registrations).toHaveProperty('thisMonth');

      expect(metrics.retention).toHaveProperty('day1');
      expect(metrics.retention).toHaveProperty('day7');
      expect(metrics.retention).toHaveProperty('day30');

      expect(metrics.userTypes).toHaveProperty('creators');
      expect(metrics.userTypes).toHaveProperty('clients');
      expect(metrics.userTypes).toHaveProperty('admins');
    });

    it('should provide realistic retention rates', async () => {
      const metrics = await platformAnalytics.getUserMetrics();

      // Day 1 retention should be higher than Day 7, which should be higher than Day 30
      expect(metrics.retention.day1).toBeGreaterThanOrEqual(metrics.retention.day7);
      expect(metrics.retention.day7).toBeGreaterThanOrEqual(metrics.retention.day30);

      // All retention rates should be percentages (0-100)
      expect(metrics.retention.day1).toBeGreaterThanOrEqual(0);
      expect(metrics.retention.day1).toBeLessThanOrEqual(100);
    });
  });

  describe('getBookingMetrics', () => {
    it('should return comprehensive booking analytics', async () => {
      const metrics = await platformAnalytics.getBookingMetrics();

      expect(metrics).toHaveProperty('totalBookings');
      expect(metrics).toHaveProperty('bookingsByStatus');
      expect(metrics).toHaveProperty('bookingsByTier');
      expect(metrics).toHaveProperty('averageBookingValue');
      expect(metrics).toHaveProperty('cancellationRate');
      expect(metrics).toHaveProperty('completionRate');
      expect(metrics).toHaveProperty('averageTimeToCompletion');

      expect(metrics.bookingsByStatus).toHaveProperty('pending');
      expect(metrics.bookingsByStatus).toHaveProperty('confirmed');
      expect(metrics.bookingsByStatus).toHaveProperty('completed');
      expect(metrics.bookingsByStatus).toHaveProperty('cancelled');

      expect(typeof metrics.averageBookingValue).toBe('number');
      expect(typeof metrics.cancellationRate).toBe('number');
      expect(typeof metrics.completionRate).toBe('number');
    });

    it('should calculate correct booking percentages', async () => {
      const metrics = await platformAnalytics.getBookingMetrics();

      // Rates should be valid percentages
      expect(metrics.cancellationRate).toBeGreaterThanOrEqual(0);
      expect(metrics.cancellationRate).toBeLessThanOrEqual(100);
      expect(metrics.completionRate).toBeGreaterThanOrEqual(0);
      expect(metrics.completionRate).toBeLessThanOrEqual(100);
    });
  });

  describe('getRevenueMetrics', () => {
    it('should return detailed revenue analytics', async () => {
      const metrics = await platformAnalytics.getRevenueMetrics();

      expect(metrics).toHaveProperty('totalRevenue');
      expect(metrics).toHaveProperty('platformFee');
      expect(metrics).toHaveProperty('creatorEarnings');
      expect(metrics).toHaveProperty('revenueByMonth');
      expect(metrics).toHaveProperty('revenueByService');
      expect(metrics).toHaveProperty('topCreators');

      expect(Array.isArray(metrics.revenueByMonth)).toBe(true);
      expect(Array.isArray(metrics.revenueByService)).toBe(true);
      expect(Array.isArray(metrics.topCreators)).toBe(true);

      expect(typeof metrics.totalRevenue).toBe('number');
      expect(typeof metrics.platformFee).toBe('number');
      expect(typeof metrics.creatorEarnings).toBe('number');
    });

    it('should calculate correct revenue splits', async () => {
      const metrics = await platformAnalytics.getRevenueMetrics();

      // Platform fee + creator earnings should approximately equal total revenue
      const calculatedTotal = metrics.platformFee + metrics.creatorEarnings;
      const tolerance = 0.01; // Allow for small rounding differences
      
      expect(Math.abs(calculatedTotal - metrics.totalRevenue)).toBeLessThan(tolerance);
    });

    it('should sort top creators by earnings', async () => {
      const metrics = await platformAnalytics.getRevenueMetrics();

      if (metrics.topCreators.length > 1) {
        for (let i = 0; i < metrics.topCreators.length - 1; i++) {
          expect(metrics.topCreators[i].earnings).toBeGreaterThanOrEqual(
            metrics.topCreators[i + 1].earnings
          );
        }
      }
    });
  });

  describe('exportAnalyticsData', () => {
    it('should export user data as CSV', async () => {
      const csvData = await platformAnalytics.exportAnalyticsData('users');

      expect(typeof csvData).toBe('string');
      expect(csvData).toContain('Metric,Value');
      expect(csvData).toContain('Registrations Today');
      expect(csvData).toContain('Total Creators');
    });

    it('should export booking data as CSV', async () => {
      const csvData = await platformAnalytics.exportAnalyticsData('bookings');

      expect(typeof csvData).toBe('string');
      expect(csvData).toContain('Metric,Value');
      expect(csvData).toContain('Total Bookings');
      expect(csvData).toContain('Completion Rate');
    });

    it('should export revenue data as CSV', async () => {
      const csvData = await platformAnalytics.exportAnalyticsData('revenue');

      expect(typeof csvData).toBe('string');
      expect(csvData).toContain('Metric,Value');
      expect(csvData).toContain('Total Revenue');
      expect(csvData).toContain('Platform Fee');
    });

    it('should handle invalid export type', async () => {
      await expect(
        platformAnalytics.exportAnalyticsData('invalid' as any)
      ).rejects.toThrow('Invalid export type');
    });
  });

  describe('error handling', () => {
    it('should handle Firestore errors gracefully', async () => {
      mockFirestore.getDocs.mockRejectedValue(new Error('Database connection failed'));

      await expect(platformAnalytics.getPlatformMetrics()).rejects.toThrow(
        'Failed to fetch platform metrics'
      );
    });

    it('should handle empty data sets', async () => {
      mockFirestore.getDocs.mockResolvedValue({
        size: 0,
        forEach: jest.fn(),
      });

      const metrics = await platformAnalytics.getPlatformMetrics();

      expect(metrics.totalUsers).toBe(0);
      expect(metrics.totalRevenue).toBe(0);
      expect(metrics.averageOrderValue).toBe(0);
    });
  });
});