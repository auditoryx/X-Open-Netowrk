import { useState } from 'react';
import { MentorshipBooking, Mentorship } from '@/lib/types/Mentorship';
import { updateMentorshipBookingStatus, provideMentorshipFeedback } from '@/lib/firestore/mentorshipBookings';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { uploadFile } from '@/lib/storage/uploadFiles';

interface MentorshipCardProps {
  booking: MentorshipBooking;
  viewType: 'creator' | 'client';
}

export default function MentorshipCard({ booking, viewType }: MentorshipCardProps) {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliverableUrl, setDeliverableUrl] = useState(booking.deliverableUrl || '');
  const [feedbackNotes, setFeedbackNotes] = useState(booking.feedbackNotes || '');
  const [isDeliverFeedbackOpen, setIsDeliverFeedbackOpen] = useState(false);
  const [feedbackFile, setFeedbackFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-indigo-100 text-indigo-800';
      case 'feedback_ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Not scheduled';
    return new Date(timestamp.toMillis()).toLocaleString();
  };
  
  const handleUpdateStatus = async (status: MentorshipBooking['status']) => {
    if (!user) return;
    
    setIsProcessing(true);
    
    try {
      await updateMentorshipBookingStatus(booking.id!, status);
      toast.success(`Status updated to ${status}`);
      // Refresh the page to see the updated status
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDeliverFeedback = async () => {
    if (!user || !booking.id) return;
    
    // Validate that either a URL or file is provided
    if (!deliverableUrl && !feedbackFile) {
      toast.error('Please provide either a feedback URL or upload a file');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      let finalDeliverableUrl = deliverableUrl;
      
      // If a file is selected, upload it first
      if (feedbackFile) {
        setIsUploading(true);
        try {
          finalDeliverableUrl = await uploadFile(feedbackFile, 'mentorships/feedback');
        } catch (error) {
          console.error('Error uploading feedback file:', error);
          toast.error('Failed to upload feedback file. Please try again.');
          setIsProcessing(false);
          setIsUploading(false);
          return;
        } finally {
          setIsUploading(false);
        }
      }
      
      // Update the booking with feedback
      await provideMentorshipFeedback(
        booking.id,
        finalDeliverableUrl,
        feedbackNotes
      );
      toast.success('Feedback delivered successfully');
      setIsDeliverFeedbackOpen(false);
      // Refresh the page to see the updated status
      window.location.reload();
    } catch (error) {
      console.error('Error delivering feedback:', error);
      toast.error('Failed to deliver feedback');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleMarkCompleted = async () => {
    if (!user || !booking.id) return;
    setIsProcessing(true);
    
    try {
      await updateMentorshipBookingStatus(booking.id, 'completed');
      toast.success('Mentorship marked as completed');
      // Refresh the page to see the updated status
      window.location.reload();
    } catch (error) {
      console.error('Error completing mentorship:', error);
      toast.error('Failed to complete mentorship');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="border rounded-lg shadow-sm p-5 bg-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">{booking.title}</h3>
          <p className="text-sm text-gray-500">
            {viewType === 'creator' ? `With ${booking.clientName || 'Client'}` : `With ${booking.creatorName || 'Mentor'}`}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
            {booking.status.replace('_', ' ')}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
            {booking.paymentStatus}
          </span>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Format</span>
          <span className="text-sm font-medium capitalize">{booking.format}</span>
        </div>
        
        {booking.scheduledAt && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Scheduled For</span>
            <span className="text-sm">{formatDate(booking.scheduledAt)}</span>
          </div>
        )}
        
        {booking.sessionGoal && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">Session Goal</span>
            <p className="text-sm bg-gray-50 p-2 rounded">{booking.sessionGoal}</p>
          </div>
        )}
        
        {booking.deliverableUrl && (
          <div className="mt-3">
            <span className="text-sm text-gray-500 block mb-1">Feedback</span>
            <div className="bg-blue-50 p-3 rounded">
              <a 
                href={booking.deliverableUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Feedback
              </a>
              
              {booking.feedbackNotes && (
                <p className="text-sm mt-2">{booking.feedbackNotes}</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Creator Actions */}
      {viewType === 'creator' && (
        <div className="mt-4 space-y-3">
          {(booking.status === 'pending' || booking.status === 'booked') && (
            <button
              onClick={() => handleUpdateStatus('in_progress')}
              disabled={isProcessing}
              className="w-full py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Start Working'}
            </button>
          )}
          
          {booking.status === 'in_progress' && (
            <button
              onClick={() => setIsDeliverFeedbackOpen(true)}
              disabled={isProcessing}
              className="w-full py-2 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Deliver Feedback'}
            </button>
          )}
          
          {isDeliverFeedbackOpen && (
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-medium text-sm mb-3">Deliver Feedback</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Feedback URL (Loom, Drive, Dropbox, etc.)</label>
                  <input
                    type="text"
                    value={deliverableUrl}
                    onChange={(e) => setDeliverableUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2 border rounded text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Provide a URL or upload a file below</p>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Upload File</label>
                  <input
                    type="file"
                    onChange={(e) => setFeedbackFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border rounded text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, MP4, ZIP, etc. (Max 100MB)</p>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Notes (Optional)</label>
                  <textarea
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    rows={3}
                    placeholder="Any additional notes about your feedback..."
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleDeliverFeedback}
                    disabled={isProcessing || isUploading}
                    className="py-2 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex-1 disabled:opacity-50"
                  >
                    {isUploading ? 'Uploading File...' : isProcessing ? 'Sending...' : 'Send Feedback'}
                  </button>
                  <button
                    onClick={() => setIsDeliverFeedbackOpen(false)}
                    className="py-2 px-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Client Actions */}
      {viewType === 'client' && (
        <div className="mt-4 space-y-3">
          {booking.status === 'feedback_ready' && (
            <button
              onClick={handleMarkCompleted}
              disabled={isProcessing}
              className="w-full py-2 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Mark as Completed'}
            </button>
          )}
          
          {booking.format === 'live' && booking.zoomLink && (
            <a
              href={booking.zoomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 px-3 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 text-sm"
            >
              Join Zoom Meeting
            </a>
          )}
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t text-xs text-gray-500 flex justify-between">
        <span>Created: {formatDate(booking.createdAt)}</span>
        <Link 
          href={`/bookings/${booking.id}`}
          className="text-blue-600 hover:underline"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
