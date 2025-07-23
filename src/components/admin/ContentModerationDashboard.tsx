/**
 * Phase 2B Week 2: Content Moderation Dashboard
 * 
 * This component provides comprehensive content moderation management:
 * - Content review and approval workflows
 * - Anti-gaming monitoring and controls
 * - Community reporting management
 * - Moderation analytics and insights
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Flag, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingUp,
  Eye,
  Users,
  Zap,
  BarChart3,
  Target,
  Award
} from 'lucide-react';
import { 
  ContentModerationResult,
  ContentFlag,
  ContentReport 
} from '@/lib/moderation/contentModeration';
import { 
  GameActionValidation,
  LeaderboardEntry,
  UserGameBehavior 
} from '@/lib/moderation/antiGaming';

interface ModerationMetrics {
  pendingReviews: number;
  approvedToday: number;
  rejectedToday: number;
  flaggedContent: number;
  activeReports: number;
  suspiciousGameActivity: number;
  leaderboardFlags: number;
  moderationQueue: number;
}

interface ContentItem {
  id: string;
  type: 'beat' | 'image' | 'video' | 'profile';
  userId: string;
  userEmail: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderationResult?: ContentModerationResult;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

interface GameViolation {
  id: string;
  userId: string;
  userEmail: string;
  violationType: 'suspicious_pattern' | 'rate_limit' | 'score_manipulation' | 'challenge_cheat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  resolved: boolean;
  action?: string;
}

export function ContentModerationDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<ModerationMetrics>({
    pendingReviews: 0,
    approvedToday: 0,
    rejectedToday: 0,
    flaggedContent: 0,
    activeReports: 0,
    suspiciousGameActivity: 0,
    leaderboardFlags: 0,
    moderationQueue: 0
  });
  const [contentQueue, setContentQueue] = useState<ContentItem[]>([]);
  const [gameViolations, setGameViolations] = useState<GameViolation[]>([]);
  const [contentReports, setContentReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModerationData();
  }, []);

  const loadModerationData = async () => {
    try {
      setLoading(true);
      
      // Load moderation metrics
      const metricsResponse = await fetch('/api/admin/moderation/metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      // Load content queue
      const queueResponse = await fetch('/api/admin/moderation/queue');
      if (queueResponse.ok) {
        const queueData = await queueResponse.json();
        setContentQueue(queueData.items || []);
      }

      // Load game violations
      const violationsResponse = await fetch('/api/admin/moderation/game-violations');
      if (violationsResponse.ok) {
        const violationsData = await violationsResponse.json();
        setGameViolations(violationsData.violations || []);
      }

      // Load content reports
      const reportsResponse = await fetch('/api/admin/moderation/reports');
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setContentReports(reportsData.reports || []);
      }

    } catch (error) {
      console.error('Failed to load moderation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentAction = async (
    contentId: string, 
    action: 'approve' | 'reject' | 'flag',
    reason?: string
  ) => {
    try {
      const response = await fetch(`/api/admin/moderation/content/${contentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      });

      if (response.ok) {
        // Refresh content queue
        await loadModerationData();
      }
    } catch (error) {
      console.error('Failed to moderate content:', error);
    }
  };

  const handleGameViolationAction = async (
    violationId: string,
    action: 'warn' | 'temp_ban' | 'permanent_ban' | 'dismiss',
    notes?: string
  ) => {
    try {
      const response = await fetch(`/api/admin/moderation/game-violations/${violationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes })
      });

      if (response.ok) {
        // Refresh violations
        await loadModerationData();
      }
    } catch (error) {
      console.error('Failed to handle game violation:', error);
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'flagged': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Moderation</h1>
          <p className="text-muted-foreground">
            Enterprise-grade content moderation and anti-gaming management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {metrics.pendingReviews} Pending
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Flag className="h-3 w-3" />
            {metrics.activeReports} Reports
          </Badge>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">Awaiting moderation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.approvedToday}</div>
            <p className="text-xs text-muted-foreground">Content approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
            <Flag className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.flaggedContent}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Game Violations</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.suspiciousGameActivity}</div>
            <p className="text-xs text-muted-foreground">Anti-gaming alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content Queue</TabsTrigger>
          <TabsTrigger value="gaming">Anti-Gaming</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Moderation Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Content Approved</span>
                    <Badge variant="default">{metrics.approvedToday}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Content Rejected</span>
                    <Badge variant="destructive">{metrics.rejectedToday}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Game Violations</span>
                    <Badge variant="secondary">{metrics.suspiciousGameActivity}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Community Reports</span>
                    <Badge variant="outline">{metrics.activeReports}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Priority Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Priority Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.pendingReviews > 10 && (
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                      <div>
                        <p className="text-sm font-medium">High Queue Volume</p>
                        <p className="text-xs text-muted-foreground">
                          {metrics.pendingReviews} items pending review
                        </p>
                      </div>
                      <Button size="sm" variant="outline">Review</Button>
                    </div>
                  )}
                  
                  {metrics.suspiciousGameActivity > 5 && (
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                      <div>
                        <p className="text-sm font-medium">Gaming Violations</p>
                        <p className="text-xs text-muted-foreground">
                          {metrics.suspiciousGameActivity} suspicious activities detected
                        </p>
                      </div>
                      <Button size="sm" variant="outline">Investigate</Button>
                    </div>
                  )}

                  {metrics.activeReports > 3 && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                      <div>
                        <p className="text-sm font-medium">Community Reports</p>
                        <p className="text-xs text-muted-foreground">
                          {metrics.activeReports} reports awaiting resolution
                        </p>
                      </div>
                      <Button size="sm" variant="outline">Review</Button>
                    </div>
                  )}

                  {metrics.pendingReviews <= 10 && metrics.suspiciousGameActivity <= 5 && metrics.activeReports <= 3 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      All systems operating normally
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation Queue</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and moderate user-submitted content
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentQueue.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{item.type}</Badge>
                        <span className="font-medium">{item.title}</span>
                        <Badge variant={getStatusColor(item.status) as any}>
                          {item.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">User:</span> {item.userEmail}
                    </div>

                    {item.moderationResult && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Flags:</span>
                          {item.moderationResult.flags.map((flag, index) => (
                            <Badge 
                              key={index}
                              variant={getSeverityColor(flag.severity) as any}
                              className="text-xs"
                            >
                              {flag.type}: {flag.description}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Confidence:</span> {(item.moderationResult.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    )}

                    {item.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleContentAction(item.id, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleContentAction(item.id, 'reject', 'Content policy violation')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleContentAction(item.id, 'flag', 'Requires further review')}
                        >
                          <Flag className="h-4 w-4 mr-1" />
                          Flag
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {contentQueue.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No content pending moderation
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anti-Gaming Violations</CardTitle>
              <p className="text-sm text-muted-foreground">
                Monitor and address gaming system abuse
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gameViolations.map((violation) => (
                  <div key={violation.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={getSeverityColor(violation.severity) as any}>
                          {violation.severity}
                        </Badge>
                        <span className="font-medium">{violation.violationType.replace('_', ' ')}</span>
                        {violation.resolved && (
                          <Badge variant="default">Resolved</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(violation.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">User:</span> {violation.userEmail}
                    </div>
                    
                    <p className="text-sm">{violation.description}</p>

                    {!violation.resolved && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleGameViolationAction(violation.id, 'warn')}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Warn
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleGameViolationAction(violation.id, 'temp_ban')}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Temp Ban
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleGameViolationAction(violation.id, 'permanent_ban')}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Permanent Ban
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleGameViolationAction(violation.id, 'dismiss')}
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {gameViolations.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No gaming violations detected
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Reports</CardTitle>
              <p className="text-sm text-muted-foreground">
                Handle community-submitted content reports
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{report.reason}</Badge>
                        <span className="font-medium">{report.contentType}</span>
                        <Badge variant={report.status === 'resolved' ? 'default' : 'secondary'}>
                          {report.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(report.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-sm">{report.description}</p>
                    
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Content ID:</span> {report.contentId}
                    </div>

                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Review Content
                        </Button>
                        <Button size="sm" variant="outline">
                          Resolve Report
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {contentReports.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No community reports to review
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}