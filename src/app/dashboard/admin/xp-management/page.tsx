'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { adminXPService, AdminXPOperation } from '@/lib/services/adminXPService';
import { XPDisplay } from '@/components/gamification/XPDisplay';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Minus, 
  Edit, 
  History, 
  Users, 
  TrendingUp,
  Activity,
  Award,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface User {
  uid: string;
  email: string;
  name: string;
  role?: string;
}

interface XPStatistics {
  totalActiveUsers: number;
  totalXPAwarded: number;
  averageXP: number;
  topUsers: any[];
  recentOperations: AdminXPOperation[];
}

export default function AdminXPManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and user management
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserXP, setSelectedUserXP] = useState<any>(null);
  
  // XP operation form
  const [operationType, setOperationType] = useState<'award' | 'deduct' | 'set'>('award');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  
  // Statistics and history
  const [statistics, setStatistics] = useState<XPStatistics | null>(null);
  const [operationHistory, setOperationHistory] = useState<AdminXPOperation[]>([]);

  // Validation and performance monitoring
  const [validationAlerts, setValidationAlerts] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [validationAlertsLoading, setValidationAlertsLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadStatistics();
      loadOperationHistory();
    }
  }, [user]);

  // Load validation alerts and performance data
  useEffect(() => {
    if (user && activeTab === 'monitoring') {
      loadValidationAlerts();
      loadPerformanceMetrics();
    }
  }, [user, activeTab]);

  const loadStatistics = async () => {
    try {
      const stats = await adminXPService.getXPStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
      toast.error('Failed to load XP statistics');
    }
  };

  const loadOperationHistory = async () => {
    try {
      const { operations } = await adminXPService.getAdminOperationHistory();
      setOperationHistory(operations);
    } catch (error) {
      console.error('Error loading operation history:', error);
      toast.error('Failed to load operation history');
    }
  };

  const loadValidationAlerts = async () => {
    setValidationAlertsLoading(true);
    try {
      const { EnhancedXPService } = await import('@/lib/services/enhancedXPService');
      const enhancedXPService = EnhancedXPService.getInstance();
      const alerts = await enhancedXPService.getValidationAlerts();
      setValidationAlerts(alerts);
    } catch (error) {
      console.error('Error loading validation alerts:', error);
      toast.error('Failed to load validation alerts');
    } finally {
      setValidationAlertsLoading(false);
    }
  };

  const loadPerformanceMetrics = async () => {
    try {
      const { EnhancedXPService } = await import('@/lib/services/enhancedXPService');
      const enhancedXPService = EnhancedXPService.getInstance();
      const [slowOps, healthCheck] = await Promise.all([
        enhancedXPService.getSlowOperations(10),
        enhancedXPService.performHealthCheck()
      ]);
      setPerformanceMetrics({
        slowOperations: slowOps,
        healthCheck: healthCheck
      });
    } catch (error) {
      console.error('Error loading performance metrics:', error);
      toast.error('Failed to load performance metrics');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await adminXPService.searchUsers(searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setLoading(true);
    try {
      const xpData = await adminXPService.getUserXPData(selectedUser.uid);
      setSelectedUserXP(xpData);
    } catch (error) {
      console.error('Error loading user XP data:', error);
      toast.error('Failed to load user XP data');
    } finally {
      setLoading(false);
    }
  };

  const handleXPOperation = async () => {
    if (!selectedUser || !amount || !reason.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid positive number');
      return;
    }

    if (!user) {
      toast.error('Admin authentication required');
      return;
    }

    setLoading(true);
    try {
      switch (operationType) {
        case 'award':
          await adminXPService.awardXP(selectedUser.uid, numAmount, reason, user.uid, user.email || '');
          break;
        case 'deduct':
          await adminXPService.deductXP(selectedUser.uid, numAmount, reason, user.uid, user.email || '');
          break;
        case 'set':
          await adminXPService.setXP(selectedUser.uid, numAmount, reason, user.uid, user.email || '');
          break;
      }

      toast.success(`XP ${operationType} successful`);
      
      // Refresh user data
      await handleSelectUser(selectedUser);
      
      // Reset form
      setAmount('');
      setReason('');
      
      // Refresh statistics and history
      await loadStatistics();
      await loadOperationHistory();
    } catch (error) {
      console.error('Error performing XP operation:', error);
      toast.error('Failed to perform XP operation');
    } finally {
      setLoading(false);
    }
  };

  const getOperationIcon = (operationType: string) => {
    switch (operationType) {
      case 'award':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'deduct':
        return <Minus className="h-4 w-4 text-red-500" />;
      case 'set':
        return <Edit className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getOperationColor = (operationType: string) => {
    switch (operationType) {
      case 'award':
        return 'bg-green-100 text-green-800';
      case 'deduct':
        return 'bg-red-100 text-red-800';
      case 'set':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">XP Management</h1>
          <p className="text-gray-600">Manage user XP awards, deductions, and track history</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Award className="h-4 w-4 mr-1" />
          Admin Panel
        </Badge>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'manage', label: 'Manage XP', icon: Edit },
              { id: 'history', label: 'History', icon: History },
              { id: 'monitoring', label: 'Monitoring', icon: AlertTriangle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.totalActiveUsers || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total XP Awarded</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.totalXPAwarded.toLocaleString() || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average XP</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(statistics?.averageXP || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Operations</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{operationHistory.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Top Users */}
          <Card>
            <CardHeader>
              <CardTitle>Top Users by XP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statistics?.topUsers.slice(0, 5).map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{user.name || user.email}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{user.totalXP?.toLocaleString() || 0} XP</p>
                      <p className="text-sm text-gray-600">{user.currentTier || 'Standard'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Operations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Admin Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statistics?.recentOperations.slice(0, 5).map((operation) => (
                  <div key={operation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getOperationIcon(operation.operationType)}
                      <div>
                        <p className="font-medium">{operation.reason}</p>
                        <p className="text-sm text-gray-600">
                          {operation.targetUserEmail} • {operation.adminEmail}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOperationColor(operation.operationType)}`}>
                        {operation.operationType} {operation.amount} XP
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {operation.timestamp ? formatDistanceToNow(operation.timestamp.toDate(), { addSuffix: true }) : 'Recently'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Search */}
            <Card>
              <CardHeader>
                <CardTitle>Search Users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button onClick={handleSearch} disabled={loading}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {searchResults.map((user) => (
                      <div
                        key={user.uid}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedUser?.uid === user.uid 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSelectUser(user)}
                      >
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected User Info */}
            {selectedUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected User</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium">{selectedUser.name}</h3>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    <p className="text-xs text-gray-500">ID: {selectedUser.uid}</p>
                  </div>
                  
                  {selectedUserXP && (
                    <div className="space-y-3">
                      <XPDisplay
                        totalXP={selectedUserXP.totalXP}
                        dailyXP={selectedUserXP.dailyXP}
                        tier={selectedUserXP.tier}
                        showDetails={true}
                      />
                      
                      <div className="text-sm text-gray-600">
                        <p>Last updated: {selectedUserXP.lastUpdated ? formatDistanceToNow(selectedUserXP.lastUpdated.toDate(), { addSuffix: true }) : 'Never'}</p>
                        <p>Admin operations: {selectedUserXP.operations.length}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* XP Operation Form */}
          {selectedUser && (
            <Card>
              <CardHeader>
                <CardTitle>XP Operation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Operation Type</label>
                    <select
                      value={operationType}
                      onChange={(e) => setOperationType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="award">Award XP</option>
                      <option value="deduct">Deduct XP</option>
                      <option value="set">Set XP</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      placeholder="Enter XP amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <input
                      type="text"
                      placeholder="Reason for XP change"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    onClick={handleXPOperation}
                    disabled={loading || !selectedUser || !amount || !reason.trim()}
                  >
                    {loading ? 'Processing...' : `${operationType.charAt(0).toUpperCase() + operationType.slice(1)} XP`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Operation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {operationHistory.map((operation) => (
                  <div key={operation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getOperationIcon(operation.operationType)}
                      <div>
                        <p className="font-medium">{operation.reason}</p>
                        <p className="text-sm text-gray-600">
                          User: {operation.targetUserEmail} • Admin: {operation.adminEmail}
                        </p>
                        <p className="text-xs text-gray-500">
                          {operation.oldXP !== undefined && operation.newXP !== undefined && 
                            `${operation.oldXP} XP → ${operation.newXP} XP`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOperationColor(operation.operationType)}`}>
                        {operation.operationType} {operation.amount} XP
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {operation.timestamp ? formatDistanceToNow(operation.timestamp.toDate(), { addSuffix: true }) : 'Recently'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Validation Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Validation Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {validationAlertsLoading ? (
                <p className="text-center text-gray-500 py-4">Loading validation alerts...</p>
              ) : validationAlerts.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No validation alerts found</p>
              ) : (
                <div className="space-y-3">
                  {validationAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 rounded-lg border bg-gray-50">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-gray-600">
                        User: {alert.userEmail} • Admin: {alert.adminEmail}
                      </p>
                      <p className="text-xs text-gray-500">
                        {alert.timestamp ? formatDistanceToNow(alert.timestamp.toDate(), { addSuffix: true }) : 'Recently'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {performanceMetrics ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Slow Operations</h4>
                    <ul className="list-disc list-inside space-y-2">
                      {performanceMetrics.slowOperations.map((op: any, index: number) => (
                        <li key={index} className="text-sm text-gray-700">
                          {op.operation} ({op.duration} ms)
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Health Check</h4>
                    <pre className="bg-gray-50 p-3 rounded-md text-sm text-gray-800">
                      {JSON.stringify(performanceMetrics.healthCheck, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No performance metrics available</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
