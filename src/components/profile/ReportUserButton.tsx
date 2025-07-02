import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { ReportModal } from './ReportModal';
import { Flag, MoreHorizontal } from 'lucide-react';

interface ReportUserButtonProps {
  targetUid: string;
  targetName?: string;
  variant?: 'button' | 'dropdown-item';
  className?: string;
}

export function ReportUserButton({ 
  targetUid, 
  targetName, 
  variant = 'button',
  className = '' 
}: ReportUserButtonProps) {
  const { user } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);

  // Don't show report button for own profile or if not logged in
  if (!user || user.uid === targetUid) {
    return null;
  }

  const handleReportClick = () => {
    setShowReportModal(true);
  };

  if (variant === 'dropdown-item') {
    return (
      <>
        <button
          onClick={handleReportClick}
          className={`flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 ${className}`}
        >
          <Flag className="w-4 h-4" />
          <span>Report User</span>
        </button>
        
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetUid={targetUid}
          targetName={targetName}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleReportClick}
        className={`inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-lg transition-colors ${className}`}
        title="Report this user"
      >
        <Flag className="w-4 h-4" />
        <span>Report</span>
      </button>
      
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetUid={targetUid}
        targetName={targetName}
      />
    </>
  );
}

export default ReportUserButton;
