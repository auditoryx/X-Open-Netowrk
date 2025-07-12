/**
 * Verification Dashboard Page
 * Full verification status and progress page for users
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { VerificationProgress } from '@/components/verification/VerificationProgress';
import { VerificationStatusWidget } from '@/components/verification/VerificationStatusWidget';
import { useVerificationData } from '@/lib/hooks/useVerificationData';
import { useAuth } from '@/lib/hooks/useAuth';
import { ArrowLeft, Shield, Trophy, Star, User, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function VerificationPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const { 
    data, 
    isLoading, 
    error, 
    submitApplication, 
    canApply, 
    isAwaitingReview 
  } = useVerificationData();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitApplication = async () => {
    try {
      setIsSubmitting(true);
      await submitApplication();
      
      // Show success notification
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('verification-application-submitted'));
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Verification Center
          </h1>
          <p className="text-muted-foreground">
            Manage your verification status and track progress toward verified creator status
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Widget */}
          <VerificationStatusWidget
            isVerified={data.isVerified}
            isEligible={data.isEligible}
            overallScore={data.overallScore}
            applicationStatus={data.applicationStatus}
          />

          {/* Detailed Progress */}
          <VerificationProgress
            isVerified={data.isVerified}
            isEligible={data.isEligible}
            criteria={data.criteria}
            overallScore={data.overallScore}
            nextSteps={data.nextSteps}
            applicationStatus={data.applicationStatus}
            onApply={handleSubmitApplication}
            isLoading={isSubmitting}
          />

          {/* Benefits of Verification */}
          {!data.isVerified && (
            <Card>
              <CardHeader>
                <CardTitle>Benefits of Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Verified Badge</h4>
                      <p className="text-sm text-muted-foreground">
                        Display a verification badge on your profile
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Star className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Higher Visibility</h4>
                      <p className="text-sm text-muted-foreground">
                        Appear higher in search results
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Trophy className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Premium Features</h4>
                      <p className="text-sm text-muted-foreground">
                        Access to exclusive creator tools
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <User className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Increased Trust</h4>
                      <p className="text-sm text-muted-foreground">
                        Build credibility with potential clients
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.criteria && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">XP Earned</span>
                    <div className="text-right">
                      <div className="font-semibold">{data.criteria.xp.current}</div>
                      <div className="text-xs text-muted-foreground">
                        Need {data.criteria.xp.required}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Profile</span>
                    <div className="text-right">
                      <div className="font-semibold">{data.criteria.profileCompleteness.current}%</div>
                      <div className="text-xs text-muted-foreground">
                        Need {data.criteria.profileCompleteness.required}%
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Bookings</span>
                    <div className="text-right">
                      <div className="font-semibold">{data.criteria.completedBookings.current}</div>
                      <div className="text-xs text-muted-foreground">
                        Need {data.criteria.completedBookings.required}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Rating</span>
                    <div className="text-right">
                      <div className="font-semibold">{data.criteria.averageRating.current.toFixed(1)} ★</div>
                      <div className="text-xs text-muted-foreground">
                        Need {data.criteria.averageRating.required.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Action Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Improve Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link 
                href="/dashboard/profile"
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium">Complete Profile</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link 
                href="/services/create"
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium">Create Services</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link 
                href="/dashboard/portfolio"
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium">Add Portfolio</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>

          {/* Current Application */}
          {data.currentApplication && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={
                    data.applicationStatus === 'approved' ? 'default' :
                    data.applicationStatus === 'rejected' ? 'destructive' :
                    'secondary'
                  }>
                    {data.applicationStatus}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Applied</span>
                  <span className="text-sm">
                    {data.currentApplication.appliedAt ? 
                      new Date(data.currentApplication.appliedAt.toMillis()).toLocaleDateString() :
                      'Unknown'
                    }
                  </span>
                </div>

                {data.currentApplication.reviewNotes && (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Review Notes</span>
                    <p className="text-sm bg-gray-50 p-2 rounded">
                      {data.currentApplication.reviewNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
