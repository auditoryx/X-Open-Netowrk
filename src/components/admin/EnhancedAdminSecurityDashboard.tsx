/**
 * Phase 2B Week 2: Enhanced Admin Security Dashboard
 * 
 * This component provides enterprise-grade admin security management:
 * - Role-based access control interface
 * - Audit log monitoring
 * - Permission management
 * - Security analytics
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
  Users, 
  Activity, 
  AlertTriangle, 
  Eye, 
  Settings,
  Clock,
  TrendingUp,
  UserCheck,
  Lock
} from 'lucide-react';
import { 
  ADMIN_ROLES, 
  AdminRole, 
  hasAdminPermission,
  getAdminPermissions 
} from '@/lib/auth/adminPermissions';

interface AuditLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  timestamp: Date;
  success: boolean;
  ip?: string;
  details: Record<string, any>;
}

interface SecurityMetrics {
  totalAdminUsers: number;
  activeAdminSessions: number;
  failedLoginAttempts: number;
  criticalActionsToday: number;
  permissionViolations: number;
  auditLogEntries: number;
}

export function EnhancedAdminSecurityDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalAdminUsers: 0,
    activeAdminSessions: 0,
    failedLoginAttempts: 0,
    criticalActionsToday: 0,
    permissionViolations: 0,
    auditLogEntries: 0
  });
  const [loading, setLoading] = useState(true);

  const userRole = session?.user?.role || 'user';
  const adminRole = session?.user?.adminRole;
  const userPermissions = getAdminPermissions(userRole, adminRole);

  // Check if user can access different sections
  const canViewAuditLogs = hasAdminPermission(userRole, adminRole, 'system:logs');
  const canManageRoles = hasAdminPermission(userRole, adminRole, 'roles:manage');
  const canViewAnalytics = hasAdminPermission(userRole, adminRole, 'analytics:view');
  const canManageUsers = hasAdminPermission(userRole, adminRole, 'users:write');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Load security metrics
      const metricsResponse = await fetch('/api/admin/security/metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      // Load recent audit logs if user has permission
      if (canViewAuditLogs) {
        const auditResponse = await fetch('/api/admin/security/audit-logs?limit=20');
        if (auditResponse.ok) {
          const auditData = await auditResponse.json();
          setAuditLogs(auditData.logs || []);
        }
      }

    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPermissionColor = (permissionId: string): string => {
    if (permissionId.includes('delete') || permissionId.includes('manage')) {
      return 'destructive';
    }
    if (permissionId.includes('write') || permissionId.includes('assign')) {
      return 'default';
    }
    return 'secondary';
  };

  const getAuditActionColor = (action: string, success: boolean): string => {
    if (!success) return 'destructive';
    if (action.includes('delete') || action.includes('impersonate')) return 'destructive';
    if (action.includes('create') || action.includes('assign')) return 'default';
    return 'secondary';
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
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Enterprise-grade admin security management and monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {adminRole ? ADMIN_ROLES[adminRole]?.name || adminRole : 'Legacy Admin'}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            {userPermissions.length} Permissions
          </Badge>
        </div>
      </div>

      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAdminUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active admin accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeAdminSessions}</div>
            <p className="text-xs text-muted-foreground">
              Current admin sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.criticalActionsToday}</div>
            <p className="text-xs text-muted-foreground">
              Critical actions today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.failedLoginAttempts}</div>
            <p className="text-xs text-muted-foreground">
              Failed attempts today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permission Violations</CardTitle>
            <Lock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.permissionViolations}</div>
            <p className="text-xs text-muted-foreground">
              Access attempts blocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Entries</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.auditLogEntries}</div>
            <p className="text-xs text-muted-foreground">
              Total logged actions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="permissions" disabled={!canViewAnalytics}>
            Permissions
          </TabsTrigger>
          <TabsTrigger value="audit" disabled={!canViewAuditLogs}>
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="roles" disabled={!canManageRoles}>
            Role Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current User Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Your Permissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userPermissions.slice(0, 8).map((permission) => (
                    <Badge
                      key={permission.id}
                      variant={getPermissionColor(permission.id) as any}
                      className="mr-2 mb-2"
                    >
                      {permission.id}
                    </Badge>
                  ))}
                  {userPermissions.length > 8 && (
                    <p className="text-sm text-muted-foreground">
                      +{userPermissions.length - 8} more permissions
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getAuditActionColor(log.action, log.success) as any}
                          className="text-xs"
                        >
                          {log.action}
                        </Badge>
                        <span className="text-sm">{log.resource}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No recent activity to display
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <p className="text-sm text-muted-foreground">
                View all available admin permissions and their descriptions
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(ADMIN_ROLES).map((role) => (
                  <Card key={role.id} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <Badge variant="outline">
                          Level {role.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {role.permissions.slice(0, 5).map((permission) => (
                          <Badge
                            key={permission.id}
                            variant="secondary"
                            className="text-xs mr-1 mb-1"
                          >
                            {permission.action}
                          </Badge>
                        ))}
                        {role.permissions.length > 5 && (
                          <p className="text-xs text-muted-foreground">
                            +{role.permissions.length - 5} more
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <p className="text-sm text-muted-foreground">
                Recent admin actions and security events
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getAuditActionColor(log.action, log.success) as any}
                        >
                          {log.action}
                        </Badge>
                        <span className="font-medium">{log.resource}</span>
                        {!log.success && (
                          <Badge variant="destructive" className="text-xs">
                            Failed
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">User:</span> {log.userEmail}
                      {log.ip && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="font-medium">IP:</span> {log.ip}
                        </>
                      )}
                    </div>
                    {Object.keys(log.details).length > 0 && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No audit logs to display
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Assign and manage admin roles for users
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Manage User Roles
                </Button>
                <div className="text-sm text-muted-foreground">
                  Role management interface will be implemented here
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}