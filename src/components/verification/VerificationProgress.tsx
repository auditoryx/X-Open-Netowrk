/**
 * Verification Progress Component
 * Displays user's progress toward verification with criteria breakdown
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from "@/components/ui/Button";
import { CheckCircle, XCircle, Clock, Star, User, Trophy, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VerificationCriteria {
  xp: { met: boolean; current: number; required: number };
  profileCompleteness: { met: boolean; current: number; required: number };
  completedBookings: { met: boolean; current: number; required: number };
  averageRating: { met: boolean; current: number; required: number };
  violations: { met: boolean; current: number; allowed: number };
}

export interface VerificationProgressProps {
  isVerified?: boolean;
  isEligible?: boolean;
  criteria?: VerificationCriteria;
  overallScore?: number;
  nextSteps?: string[];
  applicationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  onApply?: () => void;
  isLoading?: boolean;
  className?: string;
}

const criteriaIcons = {
  xp: Trophy,
  profileCompleteness: User,
  completedBookings: Star,
  averageRating: Star,
  violations: Shield
};

const criteriaLabels = {
  xp: 'Experience Points',
  profileCompleteness: 'Profile Completion',
  completedBookings: 'Completed Bookings',
  averageRating: 'Average Rating',
  violations: 'Good Standing'
};

export function VerificationProgress({
  isVerified = false,
  isEligible = false,
  criteria,
  overallScore = 0,
  nextSteps = [],
  applicationStatus = 'none',
  onApply,
  isLoading = false,
  className
}: VerificationProgressProps) {
  if (isVerified) {
    return (
      <Card className={cn('border-green-200 bg-green-50', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">Verified Creator</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
            <span className="text-sm text-green-700">
              You have successfully completed the verification process
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getApplicationStatusBadge = () => {
    switch (applicationStatus) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Under Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Needs Improvement
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Progress
          </CardTitle>
          {getApplicationStatusBadge()}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-medium">{overallScore}%</span>
          </div>
          <Progress value={overallScore} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Criteria Breakdown */}
        {criteria && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Requirements</h4>
            {Object.entries(criteria).map(([key, criterion]) => {
              const IconComponent = criteriaIcons[key as keyof typeof criteriaIcons];
              const label = criteriaLabels[key as keyof typeof criteriaLabels];
              
              return (
                <div key={key} className="flex items-center gap-3 p-2 rounded-lg border">
                  <div className={cn(
                    'p-1 rounded-full',
                    criterion.met ? 'bg-green-100' : 'bg-red-100'
                  )}>
                    {criterion.met ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {key === 'violations' ? (
                        criterion.met ? 'No recent violations' : `${criterion.current} violation(s)`
                      ) : key === 'profileCompleteness' ? (
                        `${criterion.current}% complete (need ${criterion.required}%)`
                      ) : key === 'averageRating' ? (
                        `${criterion.current.toFixed(1)} stars (need ${criterion.required})`
                      ) : (
                        `${criterion.current} / ${criterion.required}`
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Next Steps */}
        {nextSteps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Next Steps</h4>
            <ul className="space-y-1">
              {nextSteps.map((step, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary font-medium">•</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Button */}
        {applicationStatus === 'none' && isEligible && onApply && (
          <Button 
            onClick={onApply} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Submitting...' : 'Apply for Verification'}
          </Button>
        )}

        {applicationStatus === 'pending' && (
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-yellow-800 font-medium">Application Under Review</p>
            <p className="text-xs text-yellow-600 mt-1">
              We'll notify you once your application has been reviewed
            </p>
          </div>
        )}

        {applicationStatus === 'rejected' && nextSteps.length > 0 && (
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-red-800 font-medium">Application Needs Improvement</p>
            <p className="text-xs text-red-600 mt-1">
              Complete the requirements above to reapply
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
