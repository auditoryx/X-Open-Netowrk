import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Check, 
  X, 
  ExternalLink, 
  User, 
  Calendar, 
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { VerificationRequest } from '@/lib/firestore/submitVerificationRequest';
import { approveVerification, rejectVerification } from '@/lib/firestore/updateVerificationStatus';

interface VerificationReviewCardProps {
  verification: VerificationRequest;
  onStatusUpdate: (userId: string, newStatus: 'approved' | 'rejected') => void;
  adminUserId: string;
}

const VerificationReviewCard: React.FC<VerificationReviewCardProps> = ({
  verification,
  onStatusUpdate,
  adminUserId
}) => {
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [error, setError] = useState('');

  const handleApprove = async () => {
    setLoading(true);
    setError('');

    try {
      await approveVerification(verification.userId, adminUserId, 'Application approved by admin');
      onStatusUpdate(verification.userId, 'approved');
    } catch (error) {
      setError('Failed to approve verification');
      console.error('Error approving verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await rejectVerification(verification.userId, adminUserId, rejectNotes.trim());
      onStatusUpdate(verification.userId, 'rejected');
      setShowRejectModal(false);
      setRejectNotes('');
    } catch (error) {
      setError('Failed to reject verification');
      console.error('Error rejecting verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (verification.status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (verification.status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{verification.name}</h3>
              <p className="text-sm text-gray-600">{verification.role}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor()}`}>
              {verification.status}
            </span>
          </div>
        </div>

        {/* Application Details */}
        <div className="space-y-4">
          {/* Statement */}
          {verification.statement && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Statement</span>
              </div>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                {verification.statement}
              </p>
            </div>
          )}

          {/* Verification Reason (New Field) */}
          {verification.verificationReason && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Verification Reason</span>
              </div>
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
                {verification.verificationReason}
              </p>
            </div>
          )}

          {/* External Links (New Field) */}
          {verification.externalLinks && verification.externalLinks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">External Links</span>
              </div>
              <div className="space-y-2">
                {verification.externalLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800 hover:underline bg-green-50 p-2 rounded border border-green-200"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Supporting Links (Legacy) */}
          {verification.links && verification.links.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Supporting Links</span>
              </div>
              <div className="space-y-2">
                {verification.links.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {verification.submittedOn 
                    ? `Submitted ${formatDistanceToNow(verification.submittedOn.toDate(), { addSuffix: true })}`
                    : `Applied ${formatDistanceToNow(verification.createdAt.toDate(), { addSuffix: true })}`
                  }
                </span>
                <span>User ID: {verification.userId}</span>
              </div>
              
              {verification.reviewedBy && (
                <span>Reviewed by: {verification.reviewedBy}</span>
              )}
            </div>

            {verification.reviewNotes && (
              <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                <strong>Review Notes:</strong> {verification.reviewNotes}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        {verification.status === 'pending' && (
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Approve
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Verification Request
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this verification request. This will be visible to the user.
            </p>
            
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Reason for rejection (e.g., insufficient evidence, fake links, etc.)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
              disabled={loading}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {rejectNotes.length}/500
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectNotes('');
                  setError('');
                }}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectNotes.trim()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    Reject Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VerificationReviewCard;
