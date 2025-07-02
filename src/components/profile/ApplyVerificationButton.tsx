import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, Clock, XCircle, AlertCircle } from 'lucide-react';
import { canApplyForVerification, getVerificationStatus, VerificationRequest } from '@/lib/firestore/submitVerificationRequest';
import VerificationFormModal from './VerificationFormModal';

interface ApplyVerificationButtonProps {
  userId: string;
  userData: {
    name: string;
    role: string;
    isVerified?: boolean;
  };
  className?: string;
  variant?: 'button' | 'card';
}

const ApplyVerificationButton: React.FC<ApplyVerificationButtonProps> = ({
  userId,
  userData,
  className = '',
  variant = 'button'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationRequest | null>(null);
  const [canApply, setCanApply] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  // Check verification status
  const checkVerificationStatus = async () => {
    setLoading(true);
    try {
      const [status, eligibility] = await Promise.all([
        getVerificationStatus(userId),
        canApplyForVerification(userId)
      ]);

      setVerificationStatus(status);
      setCanApply(eligibility.canApply);
      setStatusMessage(eligibility.reason || '');
    } catch (error) {
      console.error('Error checking verification status:', error);
      setCanApply(false);
      setStatusMessage('Error checking verification status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      checkVerificationStatus();
    }
  }, [userId]);

  const handleSuccess = () => {
    // Refresh status after successful submission
    checkVerificationStatus();
  };

  const getStatusIcon = () => {
    if (userData.isVerified) {
      return <ShieldCheck className="h-5 w-5 text-green-500" />;
    }

    if (!verificationStatus) {
      return <Shield className="h-5 w-5 text-blue-500" />;
    }

    switch (verificationStatus.status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <ShieldCheck className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Shield className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusText = () => {
    if (userData.isVerified) {
      return 'Verified';
    }

    if (!verificationStatus) {
      return 'Apply for Verification';
    }

    switch (verificationStatus.status) {
      case 'pending':
        return 'Verification Pending';
      case 'approved':
        return 'Verified';
      case 'rejected':
        return 'Apply Again';
      default:
        return 'Apply for Verification';
    }
  };

  const getStatusDescription = () => {
    if (userData.isVerified) {
      return 'Your account is verified';
    }

    if (!verificationStatus) {
      return 'Get verified to build trust with clients';
    }

    switch (verificationStatus.status) {
      case 'pending':
        return 'Your verification application is under review';
      case 'approved':
        return 'Your account is verified';
      case 'rejected':
        return 'Previous application was rejected. You can apply again.';
      default:
        return 'Get verified to build trust with clients';
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        <span className="text-sm text-gray-600">Checking status...</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <>
        <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {getStatusIcon()}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{getStatusText()}</h3>
              <p className="text-sm text-gray-600 mt-1">{getStatusDescription()}</p>
              
              {verificationStatus?.status === 'pending' && (
                <div className="mt-2 text-xs text-gray-500">
                  Applied on {verificationStatus.createdAt.toDate().toLocaleDateString()}
                </div>
              )}

              {verificationStatus?.status === 'rejected' && verificationStatus.reviewNotes && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                  <strong>Reason:</strong> {verificationStatus.reviewNotes}
                </div>
              )}

              {canApply && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {verificationStatus?.status === 'rejected' ? 'Apply Again' : 'Apply Now'}
                </button>
              )}
            </div>
          </div>

          {!canApply && statusMessage && (
            <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        <VerificationFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userId={userId}
          userData={userData}
          onSuccess={handleSuccess}
        />
      </>
    );
  }

  // Button variant
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={!canApply}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          canApply
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        } ${className}`}
        title={!canApply ? statusMessage : ''}
      >
        {getStatusIcon()}
        <span className="font-medium">{getStatusText()}</span>
      </button>

      <VerificationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        userData={userData}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default ApplyVerificationButton;
