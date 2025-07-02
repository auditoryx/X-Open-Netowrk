import React from 'react';
import { SplitBooking } from '@/src/lib/types/Booking';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Music, 
  Headphones, 
  Mic, 
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';

interface SplitBookingCardProps {
  booking: SplitBooking;
  onViewDetails?: (bookingId: string) => void;
  onPayNow?: (bookingId: string) => void;
  onCancelBooking?: (bookingId: string) => void;
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Confirmation',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: AlertCircle
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    icon: CheckCircle
  },
  in_session: {
    label: 'In Session',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    icon: AlertCircle
  },
  completed: {
    label: 'Completed',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    icon: CheckCircle
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    icon: XCircle
  }
};

const TALENT_ICONS = {
  artist: Music,
  producer: Headphones,
  engineer: Mic
};

export function SplitBookingCard({ booking, onViewDetails, onPayNow, onCancelBooking }: SplitBookingCardProps) {
  const { user } = useAuth();
  
  if (!user) return null;

  const isClientA = booking.clientAUid === user.uid;
  const isClientB = booking.clientBUid === user.uid;
  const userRole = isClientA ? 'Client A' : isClientB ? 'Client B' : 'Unknown';
  const userShare = isClientA ? booking.clientAShare : booking.clientBShare;
  const userPaymentStatus = isClientA ? booking.clientAPaymentStatus : booking.clientBPaymentStatus;
  const otherClientShare = isClientA ? booking.clientBShare : booking.clientAShare;
  
  const statusConfig = STATUS_CONFIG[booking.status];
  const StatusIcon = statusConfig.icon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return 'TBD';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM d, yyyy \'at\' h:mm a');
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const getTalentStatusIcon = (status?: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'refunded':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-500 dark:text-gray-500';
    }
  };

  const needsPayment = booking.status === 'confirmed' && userPaymentStatus === 'pending';
  const canCancel = booking.status === 'pending' && booking.createdBy === user.uid;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {booking.sessionTitle || 'Split Studio Session'}
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {userRole} • Split: {Math.round((isClientA ? booking.splitRatio : 1 - booking.splitRatio) * 100)}%
          </p>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} flex items-center space-x-1`}>
          <StatusIcon className="w-3 h-3" />
          <span>{statusConfig.label}</span>
        </div>
      </div>

      {/* Session Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-900 dark:text-white">
              {formatDateTime(booking.scheduledAt)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-900 dark:text-white">
              {formatDuration(booking.durationMinutes)}
            </span>
          </div>

          {booking.studioName && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <div>
                <span className="text-gray-900 dark:text-white">{booking.studioName}</span>
                {booking.studioLocation && (
                  <span className="text-gray-500 text-xs ml-1">• {booking.studioLocation}</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-gray-900 dark:text-white font-medium">
                Your share: {formatCurrency(userShare)}
              </span>
              <div className="text-xs text-gray-500">
                Total: {formatCurrency(booking.totalCost)}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <span className={`capitalize ${getPaymentStatusColor(userPaymentStatus)}`}>
              Payment: {userPaymentStatus || 'pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Talent Section */}
      {booking.requestedTalent && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Requested Talent
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(booking.requestedTalent).map(([role, talentId]) => {
              if (!talentId) return null;
              const roleKey = role.replace('Id', '') as keyof typeof TALENT_ICONS;
              const TalentIcon = TALENT_ICONS[roleKey];
              const status = booking.talentStatus?.[roleKey];
              const talentDetails = booking.talentDetails?.[roleKey];

              return (
                <div 
                  key={role}
                  className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg text-xs"
                >
                  <TalentIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white capitalize">
                    {talentDetails?.name || roleKey}
                  </span>
                  {getTalentStatusIcon(status)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Description */}
      {booking.sessionDescription && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {booking.sessionDescription}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onViewDetails?.(booking.id!)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          View Details
        </button>

        {needsPayment && (
          <button
            onClick={() => onPayNow?.(booking.id!)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Pay Now
          </button>
        )}

        {canCancel && (
          <button
            onClick={() => onCancelBooking?.(booking.id!)}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
