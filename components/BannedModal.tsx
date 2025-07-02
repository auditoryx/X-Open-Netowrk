'use client';

import { useState } from 'react';
import { X, Mail, Send, AlertCircle } from 'lucide-react';
import { submitSupportMessage } from '@/lib/firestore/support/submitSupportMessage';
import toast from 'react-hot-toast';

interface BannedModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  banReason?: string;
}

export default function BannedModal({ isOpen, onClose, user, banReason }: BannedModalProps) {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('appeal');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Please describe your situation');
      return;
    }

    if (message.trim().length < 20) {
      toast.error('Please provide more details (at least 20 characters)');
      return;
    }

    setSubmitting(true);
    
    try {
      const supportData = {
        uid: user.uid,
        email: user.email || '',
        message: message.trim(),
        category: category,
        type: 'ban_appeal',
        metadata: {
          banReason: banReason || 'Not specified',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };

      const result = await submitSupportMessage(supportData);
      
      if (result.success) {
        setSubmitted(true);
        setMessage('');
        toast.success('Appeal submitted successfully. We\'ll review it within 24-48 hours.');
      } else {
        throw new Error(result.error || 'Failed to submit appeal');
      }
    } catch (error) {
      console.error('Error submitting ban appeal:', error);
      toast.error('Failed to submit appeal. Please try again later.');
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
            <Mail className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Contact Support
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
        <div className="p-6">
          {submitted ? (
            /* Success State */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <Send className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Appeal Submitted
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your appeal has been submitted successfully. Our team will review your case and respond within 24-48 hours.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Next Steps:</strong>
                  <br />• Check your email for updates
                  <br />• We may ask for additional information
                  <br />• Appeals are processed in order received
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Your Information</h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">User ID:</span> {user.uid}</p>
                  {banReason && (
                    <p><span className="font-medium">Ban Reason:</span> {banReason}</p>
                  )}
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  What would you like help with?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'appeal', label: 'Appeal this suspension' },
                    { value: 'clarification', label: 'Request clarification on the ban reason' },
                    { value: 'account_recovery', label: 'Account recovery assistance' },
                    { value: 'other', label: 'Other issue' }
                  ].map((cat) => (
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
                        className="text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {cat.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Please explain your situation
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your situation in detail. Include any relevant information that might help us review your case..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={5}
                  maxLength={1000}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {message.length}/1000 characters (minimum 20 characters)
                </p>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>Important:</strong> Please be honest and provide accurate information. 
                    False information in appeals may result in permanent account suspension.
                  </p>
                </div>
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
                  disabled={submitting || !message.trim() || message.trim().length < 20}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Appeal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
