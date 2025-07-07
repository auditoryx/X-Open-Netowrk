/**
 * Verification Components Test Page
 * Page for testing and developing verification UI components
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { VerificationProgress } from '@/components/verification/VerificationProgress';
import { VerificationStatusWidget } from '@/components/verification/VerificationStatusWidget';
import { 
  VerificationNotification,
  VerificationEligibleNotification,
  VerificationAppliedNotification,
  VerificationApprovedNotification,
  VerificationRejectedNotification,
  VerificationReminderNotification
} from '@/components/verification/VerificationNotification';

export default function VerificationTestPage() {
  const [selectedScenario, setSelectedScenario] = useState('eligible');
  const [notifications, setNotifications] = useState<string[]>([]);

  // Mock data for different scenarios
  const scenarios = {
    verified: {
      isVerified: true,
      isEligible: true,
      overallScore: 100,
      applicationStatus: 'approved' as const,
      criteria: {
        xp: { met: true, current: 1500, required: 1000 },
        profileCompleteness: { met: true, current: 100, required: 90 },
        completedBookings: { met: true, current: 10, required: 3 },
        averageRating: { met: true, current: 4.9, required: 4.0 },
        violations: { met: true, current: 0, allowed: 0 }
      }
    },
    eligible: {
      isVerified: false,
      isEligible: true,
      overallScore: 100,
      applicationStatus: 'none' as const,
      criteria: {
        xp: { met: true, current: 1200, required: 1000 },
        profileCompleteness: { met: true, current: 95, required: 90 },
        completedBookings: { met: true, current: 5, required: 3 },
        averageRating: { met: true, current: 4.8, required: 4.0 },
        violations: { met: true, current: 0, allowed: 0 }
      }
    },
    pending: {
      isVerified: false,
      isEligible: true,
      overallScore: 100,
      applicationStatus: 'pending' as const,
      criteria: {
        xp: { met: true, current: 1200, required: 1000 },
        profileCompleteness: { met: true, current: 95, required: 90 },
        completedBookings: { met: true, current: 5, required: 3 },
        averageRating: { met: true, current: 4.8, required: 4.0 },
        violations: { met: true, current: 0, allowed: 0 }
      }
    },
    ineligible: {
      isVerified: false,
      isEligible: false,
      overallScore: 60,
      applicationStatus: 'none' as const,
      criteria: {
        xp: { met: false, current: 500, required: 1000 },
        profileCompleteness: { met: false, current: 75, required: 90 },
        completedBookings: { met: true, current: 5, required: 3 },
        averageRating: { met: true, current: 4.8, required: 4.0 },
        violations: { met: true, current: 0, allowed: 0 }
      },
      nextSteps: [
        'Earn 500 more XP (complete 5 more bookings)',
        'Complete your profile (add bio, skills, portfolio)'
      ]
    },
    rejected: {
      isVerified: false,
      isEligible: false,
      overallScore: 80,
      applicationStatus: 'rejected' as const,
      criteria: {
        xp: { met: true, current: 1200, required: 1000 },
        profileCompleteness: { met: false, current: 85, required: 90 },
        completedBookings: { met: true, current: 5, required: 3 },
        averageRating: { met: true, current: 4.8, required: 4.0 },
        violations: { met: true, current: 0, allowed: 0 }
      },
      nextSteps: [
        'Complete your profile (add bio, skills, portfolio)'
      ]
    }
  };

  const currentData = scenarios[selectedScenario as keyof typeof scenarios];

  const handleApply = () => {
    alert('Application submitted! (Demo)');
  };

  const handleViewDetails = () => {
    alert('View details clicked! (Demo)');
  };

  const addNotification = (type: string) => {
    const id = `${type}-${Date.now()}`;
    setNotifications(prev => [...prev, id]);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== id));
    }, 5000);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Verification Components Test</h1>
        <p className="text-muted-foreground">
          Test and preview verification UI components in different states
        </p>
      </div>

      {/* Scenario Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Test Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.keys(scenarios).map((scenario) => (
              <Button
                key={scenario}
                variant={selectedScenario === scenario ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedScenario(scenario)}
                className="capitalize"
              >
                {scenario}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress">Progress Component</TabsTrigger>
          <TabsTrigger value="widget">Status Widget</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="combined">Combined View</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Progress Component</CardTitle>
              <div className="flex items-center gap-2">
                <Badge>{selectedScenario}</Badge>
                <Badge variant="secondary">Score: {currentData.overallScore}%</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <VerificationProgress
                isVerified={currentData.isVerified}
                isEligible={currentData.isEligible}
                criteria={currentData.criteria}
                overallScore={currentData.overallScore}
                nextSteps={currentData.nextSteps}
                applicationStatus={currentData.applicationStatus}
                onApply={handleApply}
                className="max-w-2xl"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="widget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Status Widget</CardTitle>
              <div className="flex items-center gap-2">
                <Badge>{selectedScenario}</Badge>
                <Badge variant="secondary">Score: {currentData.overallScore}%</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 max-w-md">
                <VerificationStatusWidget
                  isVerified={currentData.isVerified}
                  isEligible={currentData.isEligible}
                  overallScore={currentData.overallScore}
                  applicationStatus={currentData.applicationStatus}
                  onViewDetails={handleViewDetails}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Notifications</CardTitle>
              <p className="text-sm text-muted-foreground">
                Click buttons to trigger different notification types
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addNotification('eligible')}
                >
                  Eligible
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addNotification('applied')}
                >
                  Applied
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addNotification('approved')}
                >
                  Approved
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addNotification('rejected')}
                >
                  Rejected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addNotification('reminder')}
                >
                  Reminder
                </Button>
              </div>

              {/* Notification Examples */}
              <div className="space-y-4">
                <h4 className="font-medium">Static Examples:</h4>
                
                <VerificationEligibleNotification
                  actionLabel="Apply Now"
                  onAction={() => alert('Apply clicked!')}
                  onDismiss={() => alert('Dismissed!')}
                />

                <VerificationAppliedNotification
                  onDismiss={() => alert('Dismissed!')}
                />

                <VerificationApprovedNotification
                  actionLabel="View Profile"
                  onAction={() => alert('View profile clicked!')}
                  onDismiss={() => alert('Dismissed!')}
                />
              </div>

              {/* Dynamic Notifications */}
              <div className="space-y-2">
                <h4 className="font-medium">Dynamic Notifications:</h4>
                {notifications.map((id) => {
                  const type = id.split('-')[0] as any;
                  return (
                    <VerificationNotification
                      key={id}
                      type={type}
                      title={`${type.charAt(0).toUpperCase() + type.slice(1)} Notification`}
                      message={`This is a dynamic ${type} notification.`}
                      onDismiss={() => setNotifications(prev => prev.filter(n => n !== id))}
                      autoHide={true}
                      autoHideDelay={5000}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="combined" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Status Widget</h3>
              <VerificationStatusWidget
                isVerified={currentData.isVerified}
                isEligible={currentData.isEligible}
                overallScore={currentData.overallScore}
                applicationStatus={currentData.applicationStatus}
                onViewDetails={handleViewDetails}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Progress Detail</h3>
              <VerificationProgress
                isVerified={currentData.isVerified}
                isEligible={currentData.isEligible}
                criteria={currentData.criteria}
                overallScore={currentData.overallScore}
                nextSteps={currentData.nextSteps}
                applicationStatus={currentData.applicationStatus}
                onApply={handleApply}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Data State</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(currentData, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
