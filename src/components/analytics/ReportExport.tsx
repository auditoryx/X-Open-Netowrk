/**
 * Report Export Component
 * 
 * Handles exporting analytics data in various formats
 */

'use client';

import React, { useState } from 'react';
import { Download, FileText, Database, Calendar } from 'lucide-react';

interface ReportExportProps {
  onExport: (type: 'users' | 'bookings' | 'revenue', format: 'csv' | 'json') => Promise<void>;
  loading?: boolean;
}

const ReportExport: React.FC<ReportExportProps> = ({ onExport, loading = false }) => {
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const handleExport = async (type: 'users' | 'bookings' | 'revenue', format: 'csv' | 'json') => {
    const key = `${type}-${format}`;
    setExportLoading(key);
    
    try {
      await onExport(type, format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(null);
    }
  };

  const exportOptions = [
    {
      type: 'users' as const,
      label: 'User Analytics',
      icon: FileText,
      description: 'User registrations, retention, and engagement metrics',
    },
    {
      type: 'bookings' as const,
      label: 'Booking Analytics',
      icon: Calendar,
      description: 'Booking performance, completion rates, and trends',
    },
    {
      type: 'revenue' as const,
      label: 'Revenue Analytics',
      icon: Database,
      description: 'Revenue metrics, creator earnings, and financial trends',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center mb-4">
        <Download className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Export Reports</h3>
      </div>
      
      <div className="space-y-4">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          
          return (
            <div key={option.type} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="p-2 bg-blue-50 rounded-lg mr-4">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{option.label}</h4>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => handleExport(option.type, 'csv')}
                      disabled={loading || exportLoading === `${option.type}-csv`}
                      className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      {exportLoading === `${option.type}-csv` ? (
                        <div className="animate-spin rounded-full h-3 w-3 border border-green-600 border-t-transparent"></div>
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                      <span>CSV</span>
                    </button>
                    
                    <button
                      onClick={() => handleExport(option.type, 'json')}
                      disabled={loading || exportLoading === `${option.type}-json`}
                      className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      {exportLoading === `${option.type}-json` ? (
                        <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                      <span>JSON</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Export Information</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• CSV format is ideal for Excel and data analysis tools</li>
          <li>• JSON format provides structured data for developers</li>
          <li>• Reports include data from the selected time range</li>
          <li>• All sensitive information is anonymized in exports</li>
        </ul>
      </div>
    </div>
  );
};

export default ReportExport;