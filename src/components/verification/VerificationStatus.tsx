/**
 * Verification Status Component
 * 
 * Displays current verification status with visual indicators
 */

'use client';

import { CheckCircle, Clock, XCircle, AlertTriangle, Shield } from 'lucide-react';

interface VerificationStatusProps {
  status: 'unverified' | 'pending' | 'processing' | 'verified' | 'rejected' | 'canceled';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function VerificationStatus({
  status,
  size = 'md',
  showText = true,
  className = '',
}: VerificationStatusProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: 'Verified',
          description: 'Identity verified successfully',
        };
      case 'processing':
        return {
          icon: Clock,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          text: 'Processing',
          description: 'Verification in progress',
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          text: 'Pending',
          description: 'Waiting for verification',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          text: 'Rejected',
          description: 'Verification not approved',
        };
      case 'canceled':
        return {
          icon: AlertTriangle,
          color: 'text-orange-500',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          text: 'Canceled',
          description: 'Verification canceled',
        };
      default: // unverified
        return {
          icon: Shield,
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: 'Not Verified',
          description: 'Identity not verified',
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          icon: 'h-4 w-4',
          text: 'text-xs',
          padding: 'px-2 py-1',
        };
      case 'lg':
        return {
          icon: 'h-6 w-6',
          text: 'text-base',
          padding: 'px-4 py-2',
        };
      default: // md
        return {
          icon: 'h-5 w-5',
          text: 'text-sm',
          padding: 'px-3 py-1.5',
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);
  const Icon = config.icon;

  if (!showText) {
    return (
      <div className={`inline-flex items-center ${className}`} title={config.description}>
        <Icon className={`${sizeClasses.icon} ${config.color}`} />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center ${sizeClasses.padding} ${config.bgColor} ${config.borderColor} border rounded-full ${sizeClasses.text} font-medium ${className}`}
    >
      <Icon className={`${sizeClasses.icon} ${config.color} mr-1.5`} />
      <span className={config.color}>{config.text}</span>
    </div>
  );
}

// Verification Badge Component - for use in profile cards, etc.
interface VerificationBadgeProps {
  status: 'verified' | 'unverified';
  tier?: 'verified' | 'signature';
  size?: 'sm' | 'md' | 'lg';
  showTier?: boolean;
}

export function VerificationBadge({
  status,
  tier = 'verified',
  size = 'md',
  showTier = false,
}: VerificationBadgeProps) {
  if (status !== 'verified') {
    return null;
  }

  const isSignature = tier === 'signature';
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="inline-flex items-center" title={`${tier} tier verified`}>
      <div className={`${isSignature ? 'text-purple-500' : 'text-blue-500'} mr-1`}>
        <Shield className={`${sizeClasses[size]} fill-current`} />
      </div>
      {showTier && (
        <span className={`text-xs font-medium ${isSignature ? 'text-purple-700' : 'text-blue-700'}`}>
          {tier === 'signature' ? 'Signature' : 'Verified'}
        </span>
      )}
    </div>
  );
}

// Verification Progress Component
interface VerificationProgressProps {
  currentStep: 'start' | 'upload' | 'review' | 'complete';
  className?: string;
}

export function VerificationProgress({ currentStep, className = '' }: VerificationProgressProps) {
  const steps = [
    { key: 'start', label: 'Start', description: 'Begin verification' },
    { key: 'upload', label: 'Upload', description: 'Provide documents' },
    { key: 'review', label: 'Review', description: 'Under review' },
    { key: 'complete', label: 'Complete', description: 'Verified' },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div className="flex items-center justify-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 w-full ml-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>

              {/* Step Label */}
              <div className="text-center mt-2">
                <div
                  className={`text-xs font-medium ${
                    isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { VerificationStatus as default };