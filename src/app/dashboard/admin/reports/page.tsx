'use client';

import { useEffect, useState } from 'react';
import { SCHEMA_FIELDS } from '@/lib/SCHEMA_FIELDS';
import { useAuth } from '@/lib/hooks/useAuth';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Flag, Eye, CheckCircle, X, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import withAdminProtection from '@/middleware/withAdminProtection';

interface Report {
  id: string;
  reportedUid: string;
  reporterUid: string;
  message: string;
  category: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: any;
}

function AdminReportsPage() {
  const { user, userData } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const reportsRef = collection(db, 'reports');
      const q = query(reportsRef, orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc'));
      const snapshot = await getDocs(q);
      
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: Report['status']) => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, { 
        status,
        reviewedAt: new Date(),
        reviewedBy: user?.uid 
      });
      
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, status } : report
      ));
      
      toast.success(`Report ${status}`);
      setSelectedReport(null);
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'reviewed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'resolved': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'dismissed': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'reviewed': return <Eye className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'dismissed': return <X className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Flag className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Reports</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Review and manage user reports submitted by the community
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading reports...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Reports</h3>
                <p className="text-gray-600 dark:text-gray-400">No user reports have been submitted yet.</p>
              </div>
            ) : (
              reports.map((report) => (
                <div 
                  key={report.id} 
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                          <span>{report.status}</span>
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {report.category}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {report.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Reported User</p>
                          <p className="font-medium text-gray-900 dark:text-white">{report.reportedUid}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Reporter</p>
                          <p className="font-medium text-gray-900 dark:text-white">{report.reporterUid}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Message</p>
                        <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded">
                          {report.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {report.status === 'pending' && (
                    <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => updateReportStatus(report.id, 'reviewed')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Mark as Reviewed</span>
                      </button>
                      <button
                        onClick={() => updateReportStatus(report.id, 'resolved')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Resolve</span>
                      </button>
                      <button
                        onClick={() => updateReportStatus(report.id, 'dismissed')}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Dismiss</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAdminProtection(AdminReportsPage);
