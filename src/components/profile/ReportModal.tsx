import React, { useState } from 'react';
import { submitUserReport } from '@/lib/firestore/submitUserReport';
import { useAuth } from '@/lib/hooks/useAuth';
import { X, AlertTriangle, Flag, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUid: string;
  targetName?: string;
}

const REPORT_CATEGORIES = [
  { value: 'harassment', label: 'Harassment or bullying', icon: AlertTriangle },
  { value: 'inappropriate', label: 'Inappropriate content', icon: Flag },
  { value: 'spam', label: 'Spam or fake profile', icon: MessageSquare },
  { value: 'scam', label: 'Scam or fraud', icon: AlertTriangle },
  { value: 'impersonation', label: 'Impersonation', icon: Flag },
  { value: 'other', label: 'Other', icon: Flag }
];

export function ReportModal({ isOpen, onClose, targetUid, targetName }: ReportModalProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('other');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to report a user');
      return;
    }

    if (!message.trim()) {
      toast.error('Please describe the issue');
      return;
    }

    if (message.trim().length < 10) {
      toast.error('Please provide more details (at least 10 characters)');
      return;
    }

    setSubmitting(true);
    try {
      await submitUserReport({
        reportedUid: targetUid,
        reporterUid: user.uid,
        message: message.trim(),
        category
      });
      
      toast.success('Report submitted successfully. Our team will review it.');
      setMessage('');
      setCategory('other');
      onClose();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Flag className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Report User
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {targetName && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You are reporting: <span className="font-medium text-gray-900 dark:text-white">{targetName}</span>
              </p>
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              What's the issue?
            </label>
            <div className="space-y-2">
              {REPORT_CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <label 
                    key={cat.value}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.value}
                      checked={category === cat.value}
                      onChange={(e) => setCategory(e.target.value)}
                      className="text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600"
                    />
                    <IconComponent className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {cat.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label 
              htmlFor="report-message" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Please provide details about the issue
            </label>
            <textarea
              id="report-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe what happened. Please be specific..."
              rows={4}
              maxLength={1000}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {message.length}/1000 characters
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Privacy Notice:</strong> Your report will be reviewed by our moderation team. 
              We may contact you for additional information. Reports are kept confidential.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !message.trim() || message.trim().length < 10}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Flag className="w-4 h-4" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
