import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin access
    const userRole = session.user.role;
    if (userRole !== 'admin' && userRole !== 'moderator') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Mock earnings data for now - replace with actual database queries
    const earningsData = {
      totalEarnings: 45750.00,
      monthlyEarnings: 8920.00,
      weeklyEarnings: 2140.00,
      dailyEarnings: 425.00,
      pendingPayouts: 1250.00,
      completedBookings: 342,
      chartData: [
        { date: '2024-01-01', earnings: 3200, bookings: 15 },
        { date: '2024-01-08', earnings: 3850, bookings: 18 },
        { date: '2024-01-15', earnings: 4200, bookings: 22 },
        { date: '2024-01-22', earnings: 3900, bookings: 19 },
        { date: '2024-01-29', earnings: 4650, bookings: 24 },
        { date: '2024-02-05', earnings: 5100, bookings: 27 },
        { date: '2024-02-12', earnings: 4800, bookings: 25 },
        { date: '2024-02-19', earnings: 5200, bookings: 28 },
        { date: '2024-02-26', earnings: 5500, bookings: 31 },
        { date: '2024-03-05', earnings: 5800, bookings: 33 },
        { date: '2024-03-12', earnings: 6100, bookings: 35 },
        { date: '2024-03-19', earnings: 6400, bookings: 37 },
      ],
    };

    return NextResponse.json(earningsData);
  } catch (error) {
    console.error('Error fetching earnings data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings data' },
      { status: 500 }
    );
  }
}
