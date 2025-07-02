import React from 'react';
import { CollabBooking, CollabPackage, formatPackageDuration, formatPackagePrice } from '@/src/lib/types/CollabPackage';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Music, 
  Headphones, 
  Mic, 
  Video, 
  Building,
  CheckCircle,
  AlertCircle,
  XCircle,
  MessageSquare,
  User
} from 'lucide-react';
import { format } from 'date-fns';

interface CollabBookingSummaryProps {
  booking: CollabBooking;
  package?: CollabPackage;
  showActions?: boolean;
  onUpdateStatus?: (status: CollabBooking['status']) => void;
  onAddNotes?: (notes: string) => void;
  currentUserUid?: string;
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
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    icon: Clock
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

const PAYMENT_STATUS_CONFIG = {
  pending: {
    label: 'Payment Pending',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
  },
  paid: {
    label: 'Paid',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  refunded: {
    label: 'Refunded',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20'
  }
};

const ROLE_ICONS = {
  artist: Music,
  producer: Headphones,
  engineer: Mic,
  videographer: Video,
  studio: Building
};

export function CollabBookingSummary({ 
  booking, 
  package: pkg, 
  showActions = false, 
  onUpdateStatus, 
  onAddNotes,
  currentUserUid
}: CollabBookingSummaryProps) {
  const statusConfig = STATUS_CONFIG[booking.status];
  const paymentConfig = PAYMENT_STATUS_CONFIG[booking.paymentStatus];
  const StatusIcon = statusConfig.icon;

  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return 'TBD';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'EEEE, MMMM do, yyyy \'at\' h:mm a');
  };

  const formatTimeOnly = (timestamp: any) => {
    if (!timestamp) return 'TBD';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'h:mm a');
  };

  const isClient = currentUserUid === booking.clientUid;
  const isMember = currentUserUid && booking.memberUids.includes(currentUserUid);
  const userRole = currentUserUid ? booking.memberRoles[currentUserUid] : null;
  const userRevenue = currentUserUid && booking.revenueSplit ? booking.revenueSplit[currentUserUid] : 0;

  const canUpdateStatus = currentUserUid && (isClient || isMember) && booking.status !== 'cancelled' && booking.status !== 'completed';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {booking.packageTitle}
          </h2>
          <div className="flex items-center space-x-4">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
              <StatusIcon className="w-4 h-4 mr-2" />
              {statusConfig.label}
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${paymentConfig.bgColor} ${paymentConfig.color}`}>
              <DollarSign className="w-4 h-4 mr-2" />
              {paymentConfig.label}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPackagePrice(booking.totalPrice)}
          </div>
          {userRevenue > 0 && (
            <div className="text-sm text-green-600 dark:text-green-400">
              Your share: {formatPackagePrice(userRevenue)}
            </div>
          )}
        </div>
      </div>

      {/* Session Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Session Details
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDateTime(booking.scheduledAt)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Start time
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatTimeOnly(booking.scheduledAt)} - {formatTimeOnly(booking.endTime)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Duration: {formatPackageDuration(Math.round((booking.endTime.seconds - booking.scheduledAt.seconds) / 60))}
                </p>
              </div>
            </div>

            {(booking.location || booking.venue || booking.address) && (
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  {booking.venue && (
                    <p className="font-medium text-gray-900 dark:text-white">{booking.venue}</p>
                  )}
                  {booking.location && (
                    <p className="text-gray-700 dark:text-gray-300">{booking.location}</p>
                  )}
                  {booking.address && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{booking.address}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Team Members
          </h3>
          
          <div className="space-y-2">
            {booking.memberUids.map((memberUid) => {
              const role = booking.memberRoles[memberUid];
              const revenue = booking.revenueSplit?.[memberUid] || 0;
              const Icon = ROLE_ICONS[role as keyof typeof ROLE_ICONS] || User;
              const isCurrentUser = memberUid === currentUserUid;

              return (
                <div 
                  key={memberUid}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {role} {isCurrentUser && '(You)'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        UID: {memberUid.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                  
                  {revenue > 0 && (
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatPackagePrice(revenue)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Revenue share
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Client */}
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              isClient ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Client {isClient && '(You)'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    UID: {booking.clientUid.substring(0, 8)}...
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatPackagePrice(booking.totalPrice)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total payment
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Requirements */}
      {(booking.clientNotes || booking.teamNotes || booking.requirements) && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Notes & Requirements
          </h3>
          
          <div className="space-y-3">
            {booking.requirements && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                  Requirements
                </h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  {booking.requirements}
                </p>
              </div>
            )}

            {booking.clientNotes && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Client Notes
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {booking.clientNotes}
                </p>
              </div>
            )}

            {booking.teamNotes && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">
                  Team Notes
                </h4>
                <p className="text-green-800 dark:text-green-200 text-sm">
                  {booking.teamNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && canUpdateStatus && (
        <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          {booking.status === 'pending' && (
            <>
              <button
                onClick={() => onUpdateStatus?.('confirmed')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Confirm Booking
              </button>
              <button
                onClick={() => onUpdateStatus?.('cancelled')}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel Booking
              </button>
            </>
          )}

          {booking.status === 'confirmed' && (
            <button
              onClick={() => onUpdateStatus?.('in_progress')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Start Session
            </button>
          )}

          {booking.status === 'in_progress' && (
            <button
              onClick={() => onUpdateStatus?.('completed')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Mark Complete
            </button>
          )}

          <button
            onClick={() => {
              const notes = prompt('Add notes for this booking:');
              if (notes) onAddNotes?.(notes);
            }}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Add Notes</span>
          </button>
        </div>
      )}

      {/* Booking Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between">
          <span>
            Booking ID: {booking.id?.substring(0, 8)}...
          </span>
          <span>
            Created: {booking.createdAt ? formatDateTime(booking.createdAt) : 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
}
