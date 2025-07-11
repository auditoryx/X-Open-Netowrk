/**
 * Admin Verification Dashboard
 * Dashboard for admins to review verification applications
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/Button";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Trophy, 
  Star,
  Search,
  Filter,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { verificationService } from '@/lib/services/verificationService';
import { useAuth } from '@/lib/hooks/useAuth';

interface VerificationApplication {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: { toMillis: () => number };
  reviewedAt?: { toMillis: () => number };
  reviewedBy?: string;
  reviewNotes?: string;
  eligibilitySnapshot: {
    totalXP: number;
    profileCompleteness: number;
    completedBookings: number;
    averageRating: number;
    hasViolations: boolean;
    meetsAllCriteria: boolean;
  };
  metadata?: Record<string, any>;
  // User data (would be joined in real implementation)
  userData?: {
    name: string;
    email: string;
    profilePicture?: string;
    tier: string;
  };
}

interface VerificationStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  approvalRate: number;
  recentApplications: VerificationApplication[];
}

export function AdminVerificationDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<VerificationApplication[]>([]);
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<VerificationApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [pendingApps, verificationStats] = await Promise.all([
        verificationService.getPendingApplications(100),
        verificationService.getVerificationStatistics()
      ]);

      setApplications(pendingApps);
      setStats(verificationStats);
    } catch (error) {
      console.error('Error loading verification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewApplication = async (applicationId: string, decision: 'approve' | 'reject') => {
    if (!user?.uid) return;

    try {
      setIsReviewing(true);
      
      // First try to get the application to find the user ID
      const application = applications.find(app => app.id === applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      // Call our new verification API
      const response = await fetch(`/api/verify/${application.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verified: decision === 'approve',
          reviewNotes: reviewNotes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update verification status');
      }

      if (result.success) {
        // Refresh data
        await loadData();
        setSelectedApplication(null);
        setReviewNotes('');
        
        // Show success notification
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('verification-review-completed', {
            detail: { applicationId, decision, success: true, message: result.message }
          }));
        }
      }
    } catch (error) {
      console.error('Error reviewing application:', error);
      // Show error notification
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('verification-review-error', {
          detail: { applicationId, decision, error: error.message }
        }));
      }
    } finally {
      setIsReviewing(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.userData?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.userData?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (timestamp: { toMillis: () => number }) => {
    return new Date(timestamp.toMillis()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
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
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold">{stats.totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{stats.pendingApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{stats.approvedApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approval Rate</p>
                  <p className="text-2xl font-bold">{stats.approvalRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="pending" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pending">Pending ({stats?.pendingApplications || 0})</TabsTrigger>
            <TabsTrigger value="all">All Applications</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </div>
        </div>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredApplications.filter(app => app.status === 'pending').map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onSelect={setSelectedApplication}
                    onReview={handleReviewApplication}
                    isReviewing={isReviewing}
                  />
                ))}
                
                {filteredApplications.filter(app => app.status === 'pending').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending applications found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onSelect={setSelectedApplication}
                    onReview={handleReviewApplication}
                    isReviewing={isReviewing}
                    showActions={application.status === 'pending'}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Verification Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Detailed statistics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onReview={handleReviewApplication}
          reviewNotes={reviewNotes}
          onNotesChange={setReviewNotes}
          isReviewing={isReviewing}
        />
      )}
    </div>
  );
}

// Application Card Component
function ApplicationCard({ 
  application, 
  onSelect, 
  onReview, 
  isReviewing, 
  showActions = true 
}: {
  application: VerificationApplication;
  onSelect: (app: VerificationApplication) => void;
  onReview: (id: string, decision: 'approve' | 'reject') => void;
  isReviewing: boolean;
  showActions?: boolean;
}) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src={application.userData?.profilePicture} />
            <AvatarFallback>
              {application.userData?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{application.userData?.name || 'Unknown User'}</h3>
              {getStatusBadge(application.status)}
            </div>
            <p className="text-sm text-muted-foreground">{application.userData?.email}</p>
            <p className="text-xs text-muted-foreground">
              Applied {formatDate(application.appliedAt)}
            </p>
            
            {/* Quick metrics */}
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                {application.eligibilitySnapshot.totalXP} XP
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {application.eligibilitySnapshot.profileCompleteness}% Profile
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {application.eligibilitySnapshot.completedBookings} Bookings
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onSelect(application)}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          
          {showActions && application.status === 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReview(application.id, 'approve')}
                disabled={isReviewing}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReview(application.id, 'reject')}
                disabled={isReviewing}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Application Detail Modal (placeholder)
function ApplicationDetailModal({ 
  application, 
  onClose, 
  onReview, 
  reviewNotes, 
  onNotesChange, 
  isReviewing 
}: {
  application: VerificationApplication;
  onClose: () => void;
  onReview: (id: string, decision: 'approve' | 'reject') => void;
  reviewNotes: string;
  onNotesChange: (notes: string) => void;
  isReviewing: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Application Details</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Detailed application review interface would go here...</p>
          
          {application.status === 'pending' && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <label className="text-sm font-medium">Review Notes</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  placeholder="Add notes for your review decision..."
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => onReview(application.id, 'approve')}
                  disabled={isReviewing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve Application
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onReview(application.id, 'reject')}
                  disabled={isReviewing}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Reject Application
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminVerificationDashboard;
