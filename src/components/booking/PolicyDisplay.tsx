'use client';

import React, { useState, useEffect } from 'react';
import { Info, Clock, DollarSign, Shield } from 'lucide-react';

interface CancellationPolicy {
  id: string;
  name: string;
  description: string;
  rules: Array<{
    hoursBeforeBooking: number;
    refundPercentage: number;
    description: string;
  }>;
}

interface PolicyDisplayProps {
  tier?: 'standard' | 'verified' | 'signature';
  showAllTiers?: boolean;
  className?: string;
}

export default function PolicyDisplay({
  tier = 'standard',
  showAllTiers = false,
  className = ''
}: PolicyDisplayProps) {
  const [policies, setPolicies] = useState<Record<string, CancellationPolicy> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bookings/policies');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load policies');
      }

      setPolicies(data.allPolicies);
    } catch (error) {
      console.error('Error loading policies:', error);
      setError(error instanceof Error ? error.message : 'Failed to load policies');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimespan = (hours: number) => {
    if (hours >= 168) return `${hours / 168} week${hours / 168 > 1 ? 's' : ''}`;
    if (hours >= 24) return `${hours / 24} day${hours / 24 > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'standard': return 'blue';
      case 'verified': return 'green';
      case 'signature': return 'purple';
      default: return 'gray';
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'standard': return <Shield className="w-5 h-5" />;
      case 'verified': return <Shield className="w-5 h-5" />;
      case 'signature': return <Shield className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Loading cancellation policies...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`border border-red-200 bg-red-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center text-red-700">
          <Info className="w-5 h-5 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!policies) {
    return null;
  }

  const renderPolicy = (policy: CancellationPolicy, tierName: string) => {
    const color = getTierColor(tierName);
    const icon = getTierIcon(tierName);

    return (
      <div key={tierName} className="border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center mb-3">
          <div className={`text-${color}-600 mr-2`}>
            {icon}
          </div>
          <div>
            <h3 className={`font-medium text-${color}-900`}>
              {policy.name}
            </h3>
            <p className="text-sm text-gray-600">{policy.description}</p>
          </div>
        </div>

        <div className="space-y-3">
          {policy.rules
            .sort((a, b) => b.hoursBeforeBooking - a.hoursBeforeBooking)
            .map((rule, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {rule.hoursBeforeBooking > 0 
                        ? `${formatTimespan(rule.hoursBeforeBooking)}+ before booking`
                        : 'Less than 24 hours before booking'
                      }
                    </p>
                    <p className="text-xs text-gray-600">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className={`w-4 h-4 mr-1 ${
                    rule.refundPercentage > 75 ? 'text-green-600' :
                    rule.refundPercentage > 25 ? 'text-yellow-600' :
                    rule.refundPercentage > 0 ? 'text-orange-600' :
                    'text-red-600'
                  }`} />
                  <span className={`font-medium ${
                    rule.refundPercentage > 75 ? 'text-green-600' :
                    rule.refundPercentage > 25 ? 'text-yellow-600' :
                    rule.refundPercentage > 0 ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {rule.refundPercentage}% refund
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Cancellation Policies
        </h2>
        <p className="text-sm text-gray-600">
          Refund amounts depend on the creator's tier and how far in advance you cancel.
        </p>
      </div>

      {showAllTiers ? (
        <div>
          {['standard', 'verified', 'signature'].map(tierName => (
            policies[tierName] && renderPolicy(policies[tierName], tierName)
          ))}
        </div>
      ) : (
        policies[tier] && renderPolicy(policies[tier], tier)
      )}

      {/* Additional Information */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">
              Important Notes
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Refunds are processed within 3-5 business days</li>
              <li>• Processing fees may apply to partial refunds</li>
              <li>• Emergency cancellations may qualify for full refunds</li>
              <li>• Creators can set custom policies for specific services</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}