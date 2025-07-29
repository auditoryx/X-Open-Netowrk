import { Booking } from '@/lib/types/Booking';
import { useAuth } from '@/lib/hooks/useAuth';
import RevenueSplitViewer from '@/components/booking/RevenueSplitViewer';

interface BookingCardProps {
  booking: Booking;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const { user } = useAuth();
  const userRole = user ? getUserRoleInBooking(booking, user.uid) : 'Unknown';

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="font-bold text-lg">{booking.sessionTitle || 'Untitled Session'}</h3>
      <p className="text-sm text-gray-600">Status: <span className="font-semibold">{booking.status}</span></p>
      <p className="text-sm">Role: {userRole}</p>
      <p className="text-sm">Scheduled for: {new Date(booking.scheduledAt.toMillis()).toLocaleString()}</p>
      
      {/* Display the revenue split viewer if a contract is available */}
      {booking.revenueSplit && booking.contractUrl && (
        <div className="mt-4">
          <RevenueSplitViewer booking={booking} />
        </div>
      )}
      
      {/* Fallback for bookings with contract but no revenue split */}
      {!booking.revenueSplit && booking.contractUrl && (
        <a 
          href={booking.contractUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Download Contract
        </a>
      )}
    </div>
  );
}

function getUserRoleInBooking(booking: Booking, uid: string): string {
  if (booking.creatorUid === uid) return 'Creator';
  if (booking.clientUids.includes(uid)) return 'Client';
  return 'Participant';
}
