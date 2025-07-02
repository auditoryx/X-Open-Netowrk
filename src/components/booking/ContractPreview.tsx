import React, { useState, useRef, useEffect } from 'react';
import { BookingData } from '@/lib/firestore/getBookingById';
import { FileText, Clock, MapPin, DollarSign, Calendar, User, CheckCircle } from 'lucide-react';

interface ContractPreviewProps {
  booking: BookingData;
  clientProfile: any;
  providerProfile: any;
  onProceedToPayment: () => void;
  loading?: boolean;
}

export function ContractPreview({
  booking,
  clientProfile,
  providerProfile,
  onProceedToPayment,
  loading = false
}: ContractPreviewProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (contractRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contractRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;
      setHasScrolledToBottom(isNearBottom);
    }
  };

  useEffect(() => {
    const contractEl = contractRef.current;
    if (contractEl) {
      contractEl.addEventListener('scroll', handleScroll);
      return () => contractEl.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Time TBD';
    try {
      return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  const getDurationText = (duration?: number) => {
    if (!duration) return 'Duration TBD';
    if (duration < 60) return `${duration} minutes`;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`;
  };

  const defaultTerms = `
**SERVICE AGREEMENT**

This agreement is between ${clientProfile?.name || booking.clientName} (Client) and ${providerProfile?.name || booking.providerName} (Provider) for the following service:

**SERVICE DETAILS:**
- Service: ${booking.serviceTitle}
- Date: ${formatDate(booking.bookingDate)}
- Time: ${formatTime(booking.bookingTime)}
- Duration: ${getDurationText(booking.duration)}
- Location: ${booking.location || (booking.isOnline ? 'Online' : 'Location TBD')}
- Total Cost: $${booking.price}

**TERMS AND CONDITIONS:**

1. **Payment**: Full payment is required before the service begins. Payment will be held in escrow and released to the Provider upon successful completion of the service.

2. **Cancellation**: 
   - Client may cancel up to 24 hours before the scheduled time for a full refund
   - Provider may cancel up to 48 hours before the scheduled time
   - Last-minute cancellations may incur fees

3. **Service Delivery**: The Provider agrees to deliver the service as described above to the best of their ability and in accordance with industry standards.

4. **Intellectual Property**: Any work created during this service belongs to the Client unless otherwise specified in writing.

5. **Confidentiality**: Both parties agree to maintain confidentiality regarding any sensitive information shared during the service.

6. **Dispute Resolution**: Any disputes will be handled through the platform's resolution process.

7. **Platform Fees**: A service fee will be deducted from the total amount as per platform terms.

**PROVIDER INFORMATION:**
- Name: ${providerProfile?.name || booking.providerName}
- Rating: ${providerProfile?.averageRating ? `${providerProfile.averageRating}/5 stars` : 'New provider'}
- Location: ${providerProfile?.location || 'Not specified'}

**CLIENT INFORMATION:**
- Name: ${clientProfile?.name || booking.clientName}
- Contact: Via platform messaging system

By proceeding with payment, both parties agree to these terms and conditions.
  `;

  const contractContent = booking.contractTerms || defaultTerms;

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-xl rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Service Contract Preview</h1>
        </div>
        <p className="text-blue-100">Please review the contract details before proceeding to payment</p>
      </div>

      {/* Service Summary */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Service Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Provider</p>
              <p className="font-medium text-gray-900 dark:text-white">{providerProfile?.name || booking.providerName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Client</p>
              <p className="font-medium text-gray-900 dark:text-white">{clientProfile?.name || booking.clientName}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(booking.bookingDate)} at {formatTime(booking.bookingTime)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
              <p className="font-medium text-gray-900 dark:text-white">{getDurationText(booking.duration)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {booking.location || (booking.isOnline ? 'Online Session' : 'Location TBD')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <DollarSign className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Cost</p>
              <p className="font-medium text-green-600 text-lg">${booking.price}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Terms */}
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Contract Terms</h2>
        <div
          ref={contractRef}
          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 h-96 overflow-y-auto border border-gray-200 dark:border-gray-700"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="prose dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {contractContent}
            </pre>
          </div>
        </div>
        
        {!hasScrolledToBottom && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Please scroll to the bottom to review all terms
          </p>
        )}
      </div>

      {/* Agreement Checkbox */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            I have read and agree to the terms and conditions outlined in this contract. 
            I understand that payment will be processed securely and held in escrow until the service is completed.
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="p-6 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Secure payment powered by Stripe</p>
          <p>Your card details are encrypted and protected</p>
        </div>
        
        <button
          onClick={onProceedToPayment}
          disabled={!hasScrolledToBottom || !agreedToTerms || loading}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center space-x-2 ${
            hasScrolledToBottom && agreedToTerms && !loading
              ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Proceed to Payment (${booking.price})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
