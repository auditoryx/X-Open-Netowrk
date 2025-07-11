import { firestore } from '@/lib/firebase/firebaseAdmin';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';

export interface BookingEarning {
  id: string;
  totalCost: number;
  platformCommission: number;
  creatorEarnings: number;
  createdAt: Timestamp;
  scheduledAt: Timestamp;
  role?: string;
  location?: string;
  serviceType?: string;
  clientUid: string;
  creatorUid: string;
}

export interface EarningsData {
  totalRevenue: number;
  platformCommission: number;
  creatorEarnings: number;
  bookingCount: number;
  bookings: BookingEarning[];
  periodData: {
    weekly: { [week: string]: number };
    monthly: { [month: string]: number };
  };
  topRoles: { [role: string]: { count: number; revenue: number } };
  topLocations: { [location: string]: { count: number; revenue: number } };
}

const PLATFORM_COMMISSION_RATE = 0.20; // 20% platform cut

/**
 * Get all paid bookings and calculate earnings data
 */
export async function getEarningsData(
  startDate?: Date,
  endDate?: Date
): Promise<EarningsData> {
  try {
    const bookingsCollection = collection(firestore, 'bookings');
    
    // Build query for paid bookings
    const queryConditions: any[] = [
      where('status', '==', 'completed'),
      orderBy('createdAt', 'desc')
    ];

    // Add date filters if provided
    if (startDate) {
      queryConditions.push(where('createdAt', '>=', Timestamp.fromDate(startDate)));
    }
    if (endDate) {
      queryConditions.push(where('createdAt', '<=', Timestamp.fromDate(endDate)));
    }

    const q = query(bookingsCollection, ...queryConditions);
    const querySnapshot = await getDocs(q);

    const bookings: BookingEarning[] = [];
    let totalRevenue = 0;
    let totalPlatformCommission = 0;
    let totalCreatorEarnings = 0;

    const weeklyData: { [week: string]: number } = {};
    const monthlyData: { [month: string]: number } = {};
    const topRoles: { [role: string]: { count: number; revenue: number } } = {};
    const topLocations: { [location: string]: { count: number; revenue: number } } = {};

    querySnapshot.forEach(doc => {
      const data = doc.data();
      
      // Skip if no payment data
      if (!data.totalCost || data.totalCost <= 0) return;

      const bookingCost = data.totalCost;
      const platformCommission = bookingCost * PLATFORM_COMMISSION_RATE;
      const creatorEarnings = bookingCost - platformCommission;

      const booking: BookingEarning = {
        id: doc.id,
        totalCost: bookingCost,
        platformCommission,
        creatorEarnings,
        createdAt: data.createdAt,
        scheduledAt: data.scheduledAt,
        role: data.role || 'unknown',
        location: data.studioLocation || data.location || 'unknown',
        serviceType: data.serviceType || 'booking',
        clientUid: data.clientUids?.[0] || data.clientUid || 'unknown',
        creatorUid: data.creatorUid || 'unknown'
      };

      bookings.push(booking);

      // Update totals
      totalRevenue += bookingCost;
      totalPlatformCommission += platformCommission;
      totalCreatorEarnings += creatorEarnings;

      // Group by week and month
      const date = data.createdAt.toDate();
      const weekKey = getWeekKey(date);
      const monthKey = getMonthKey(date);

      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + platformCommission;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + platformCommission;

      // Track roles
      const role = booking.role;
      if (!topRoles[role]) {
        topRoles[role] = { count: 0, revenue: 0 };
      }
      topRoles[role].count += 1;
      topRoles[role].revenue += platformCommission;

      // Track locations
      const location = booking.location;
      if (!topLocations[location]) {
        topLocations[location] = { count: 0, revenue: 0 };
      }
      topLocations[location].count += 1;
      topLocations[location].revenue += platformCommission;
    });

    return {
      totalRevenue,
      platformCommission: totalPlatformCommission,
      creatorEarnings: totalCreatorEarnings,
      bookingCount: bookings.length,
      bookings,
      periodData: {
        weekly: weeklyData,
        monthly: monthlyData
      },
      topRoles,
      topLocations
    };

  } catch (error) {
    console.error('Error fetching earnings data:', error);
    throw new Error('Failed to fetch earnings data');
  }
}

/**
 * Get week key in format "2025-W01"
 */
function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Get month key in format "2025-01"
 */
function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get earnings for a specific time period
 */
export async function getEarningsForPeriod(
  period: 'week' | 'month' | 'year',
  offset: number = 0
): Promise<EarningsData> {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000 * (offset + 1)));
      endDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000 * offset));
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth() - (offset + 1), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() - offset, 0);
      break;
    case 'year':
      startDate = new Date(now.getFullYear() - (offset + 1), 0, 1);
      endDate = new Date(now.getFullYear() - offset, 11, 31);
      break;
    default:
      throw new Error('Invalid period specified');
  }

  return getEarningsData(startDate, endDate);
}
