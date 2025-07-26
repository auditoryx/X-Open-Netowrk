/**
 * Cancellation Dialog Component
 * 
 * Provides a user-friendly interface for booking cancellation with refund preview
 */

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RefundCalculation {
  originalAmount: number;
  refundAmount: number;
  refundPercentage: number;
  platformFeeRefund: number;
  processingFee: number;
  timeUntilBooking: number;
  policyApplied: {
    description: string;
    hoursBeforeBooking: number;
    refundPercentage: number;
  };
}

interface RefundSummary {
  summary: string;
  details: string[];
  netRefund: number;
}

interface CancellationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  bookingTitle?: string;
  onCancellationComplete?: (result: any) => void;
}

export function CancellationDialog({ 
  open, 
  onOpenChange, 
  bookingId, 
  bookingTitle,
  onCancellationComplete 
}: CancellationDialogProps) {
  const [step, setStep] = useState<'quote' | 'confirm' | 'processing' | 'complete'>('quote');
  const [reason, setReason] = useState('');
  const [refundCalculation, setRefundCalculation] = useState<RefundCalculation | null>(null);
  const [refundSummary, setRefundSummary] = useState<RefundSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canCancel, setCanCancel] = useState(true);
  const [cancellationResult, setCancellationResult] = useState<any>(null);

  // Load cancellation quote when dialog opens
  useEffect(() => {
    if (open && bookingId) {
      loadCancellationQuote();
    }
  }, [open, bookingId]);

  const loadCancellationQuote = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load cancellation details');
      }
      
      setCanCancel(data.canCancel);
      if (data.canCancel) {
        setRefundCalculation(data.refundCalculation);
        setRefundSummary(data.refundSummary);
      } else {
        setError(data.reason || 'This booking cannot be cancelled');
      }
    } catch (err: any) {
      setError(err.message);
      setCanCancel(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    setStep('processing');
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason.trim(),
          confirmRefund: true
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Cancellation failed');
      }

      setCancellationResult(result);
      setStep('complete');
      
      // Notify parent component
      onCancellationComplete?.(result);
      
    } catch (err: any) {
      setError(err.message);
      setStep('confirm');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state when closing
    setTimeout(() => {
      setStep('quote');
      setReason('');
      setRefundCalculation(null);
      setRefundSummary(null);
      setError(null);
      setCancellationResult(null);
    }, 300);
  };

  const renderQuoteStep = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-amber-600">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-medium">Cancellation Policy</span>
      </div>

      {refundCalculation && refundSummary && (
        <div className="space-y-4">
          {/* Refund Summary */}
          <div className="p-4 bg-slate-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium">{refundSummary.summary}</span>
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              {refundSummary.details.map((detail, index) => (
                <div key={index}>{detail}</div>
              ))}
            </div>
          </div>

          {/* Timing Information */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="h-4 w-4" />
            <span>
              Time until booking: {Math.round(refundCalculation.timeUntilBooking)} hours
            </span>
          </div>

          {/* Policy Applied */}
          <Alert>
            <AlertDescription>
              {refundCalculation.policyApplied.description}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for cancellation *</Label>
        <Textarea
          id="reason"
          placeholder="Please provide a reason for cancelling this booking..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          rows={3}
        />
        <div className="text-xs text-slate-500 text-right">
          {reason.length}/500
        </div>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Confirm Cancellation</h3>
        <p className="text-slate-600">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>
      </div>

      {refundSummary && (
        <div className="p-4 bg-slate-50 rounded-lg border text-center">
          <div className="text-lg font-semibold text-green-600 mb-1">
            ${refundSummary.netRefund.toFixed(2)} Refund
          </div>
          <div className="text-sm text-slate-600">
            Will be processed within 3-5 business days
          </div>
        </div>
      )}

      <div className="p-3 bg-slate-100 rounded text-sm">
        <strong>Reason:</strong> {reason}
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center py-8">
      <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
      <h3 className="text-lg font-semibold mb-2">Processing Cancellation</h3>
      <p className="text-slate-600">
        Please wait while we cancel your booking and process the refund...
      </p>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center py-6">
      {cancellationResult?.refundError ? (
        <>
          <XCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Booking Cancelled</h3>
          <p className="text-slate-600 mb-4">
            Your booking has been cancelled, but there was an issue processing the refund.
            Please contact support for assistance.
          </p>
          <Alert>
            <AlertDescription>
              Error: {cancellationResult.refundError}
            </AlertDescription>
          </Alert>
        </>
      ) : (
        <>
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Cancellation Complete</h3>
          <p className="text-slate-600 mb-4">
            {cancellationResult?.message || 'Your booking has been cancelled successfully.'}
          </p>
          {cancellationResult?.refundSummary && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-lg font-semibold text-green-700 mb-1">
                ${cancellationResult.refundSummary.netRefund.toFixed(2)} Refund
              </div>
              <div className="text-sm text-green-600">
                Will appear in your account within 3-5 business days
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'complete' ? 'Cancellation Complete' : 'Cancel Booking'}
          </DialogTitle>
          {bookingTitle && (
            <p className="text-sm text-slate-600">{bookingTitle}</p>
          )}
        </DialogHeader>

        <div className="py-4">
          {loading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-spin" />
              <p className="text-slate-600">Loading cancellation details...</p>
            </div>
          )}

          {error && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && canCancel && (
            <>
              {step === 'quote' && renderQuoteStep()}
              {step === 'confirm' && renderConfirmStep()}
              {step === 'processing' && renderProcessingStep()}
              {step === 'complete' && renderCompleteStep()}
            </>
          )}

          {!loading && !canCancel && (
            <div className="text-center py-6">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Cannot Cancel</h3>
              <p className="text-slate-600">
                {error || 'This booking cannot be cancelled at this time.'}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'quote' && canCancel && !loading && (
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Keep Booking
              </Button>
              <Button
                onClick={() => setStep('confirm')}
                disabled={!reason.trim()}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={() => setStep('quote')} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleConfirmCancellation}
                variant="destructive"
                className="flex-1"
              >
                Cancel Booking
              </Button>
            </div>
          )}

          {step === 'complete' && (
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          )}

          {!canCancel && (
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}