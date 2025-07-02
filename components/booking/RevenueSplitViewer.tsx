import React, { useState } from 'react';
import { Booking } from '@/src/lib/types/Booking';
import { useContractPdf } from '@/hooks/useContractPdf';
import { FileText, Download, Eye, Loader } from 'lucide-react';

interface RevenueSplitViewerProps {
  booking: Booking;
}

export default function RevenueSplitViewer({ booking }: RevenueSplitViewerProps) {
  const { contractUrl, isLoading, downloadContract, openContract } = useContractPdf(booking);
  const [isOpen, setIsOpen] = useState(false);

  // Calculate percentages for visual representation
  const splitPercentages = booking.revenueSplit 
    ? Object.entries(booking.revenueSplit).map(([role, share]) => ({
        role,
        percentage: (share * 100).toFixed(1) + '%',
        value: share
      }))
    : [];

  if (!booking.revenueSplit || !booking.contractUrl) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold">Revenue Split Contract</h3>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={downloadContract}
            disabled={isLoading}
            className="flex items-center px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition"
            title="Download contract PDF"
          >
            {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          </button>
          
          <button
            onClick={openContract}
            disabled={isLoading}
            className="flex items-center px-2 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition"
            title="View contract PDF"
          >
            {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      
      <div className="px-1 py-2">
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700">Revenue Split Agreement</h4>
        </div>
        
        {/* Split percentage visualization */}
        <div className="w-full h-8 bg-gray-100 rounded-full mb-3 flex overflow-hidden">
          {splitPercentages.map((split, index) => (
            <div
              key={split.role}
              className={`h-full flex items-center justify-center text-xs font-bold
                ${index % 3 === 0 ? 'bg-blue-500' : 
                  index % 3 === 1 ? 'bg-green-500' : 'bg-purple-500'}`}
              style={{ width: split.percentage }}
            >
              <span className="text-white truncate px-1">
                {split.percentage}
              </span>
            </div>
          ))}
        </div>
        
        {/* Split details */}
        <div className="space-y-1">
          {splitPercentages.map((split, index) => (
            <div key={split.role} className="flex justify-between text-sm">
              <span className="text-gray-700 capitalize">{split.role}:</span>
              <span className="font-medium">{split.percentage}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
          Contract created on {new Date(booking.createdAt.toMillis()).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
