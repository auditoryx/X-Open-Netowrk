/**
 * Verification Status Widget
 * Compact widget for displaying verification status in dashboard
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/Button";
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Shield, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VerificationStatusWidgetProps {
  isVerified?: boolean;
  isEligible?: boolean;
  overallScore?: number;
  applicationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  onViewDetails?: () => void;
  className?: string;
}

export function VerificationStatusWidget({
  isVerified = false,
  isEligible = false,
  overallScore = 0,
  applicationStatus = 'none',
  onViewDetails,
  className
}: VerificationStatusWidgetProps) {
  // Verified state
  if (isVerified) {
    return (
      <Card className={cn('border-green-200 bg-gradient-to-r from-green-50 to-emerald-50', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-green-800">Verified Creator</h3>
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <p className="text-sm text-green-600">
                  You're a verified member of AuditoryX
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pending state
  if (applicationStatus === 'pending') {
    return (
      <Card className={cn('border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-yellow-800">Under Review</h3>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
                <p className="text-sm text-yellow-600">
                  Your verification application is being reviewed
                </p>
              </div>
            </div>
            {onViewDetails && (
              <Button variant="ghost" size="sm" onClick={onViewDetails}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Eligible but not applied
  if (isEligible && applicationStatus === 'none') {
    return (
      <Card className={cn('border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">Ready for Verification</h3>
                <p className="text-sm text-blue-600">
                  You're eligible to become a verified creator
                </p>
              </div>
            </div>
            {onViewDetails && (
              <Button variant="default" size="sm" onClick={onViewDetails}>
                Apply Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Progress toward eligibility
  return (
    <Card className={cn('border-gray-200', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-full">
              <Shield className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Verification Progress</h3>
              <p className="text-sm text-gray-600">
                {overallScore}% complete
              </p>
            </div>
          </div>
          {onViewDetails && (
            <Button variant="ghost" size="sm" onClick={onViewDetails}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progress to Verification</span>
            <span>{overallScore}%</span>
          </div>
          <Progress value={overallScore} className="h-2" />
        </div>
        
        {overallScore >= 80 && (
          <p className="text-xs text-blue-600 mt-2">
            Almost there! Complete a few more requirements.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default VerificationStatusWidget;
