'use client';
import { useState } from 'react'
import { createDispute } from '@/lib/firestore/disputes/createDispute'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner';

type Props = {
  bookingId: string;
  clientId: string;
};

export default function DisputeForm({ bookingId, clientId }: Props) {
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth()

  const handleSubmit = async () => {
    const trimmed = reason.trim();
    if (!trimmed || trimmed.length < 5 || loading) return;

    setLoading(true);
    try {
      const result = await createDispute({
        bookingId,
        fromUser: clientId,
        reason: trimmed
      })

      if (!result?.error) {
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || null

        await Promise.all([
          fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: 'admin-notify',
              email: adminEmail,
              type: 'dispute',
              title: 'New Dispute Filed',
              message: `A user submitted a dispute for booking ${bookingId}`,
              link: `/admin/disputes`
            })
          }),
          user?.email
            ? fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: user.email,
                  type: 'dispute',
                  title: 'Dispute Submitted',
                  message: `We received your dispute for booking ${bookingId}`,
                  link: `/dashboard/disputes`
                })
              })
            : Promise.resolve()
        ])
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Dispute submitted successfully!');
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Dispute error:', err);
      toast.error('Failed to submit dispute.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return <p className="text-green-600">Dispute submitted. Admin will review it shortly.</p>;
  }

  return (
    <div className="space-y-3 border p-4 rounded bg-white text-black">
      <label htmlFor="dispute-reason" className="text-sm font-medium">
        Explain your reason for dispute
      </label>
      <textarea
        id="dispute-reason"
        aria-label="Reason for dispute"
        value={reason}
        onChange={(e) => setReason(e.target.value.replace(/\s{2,}/g, ' '))}
        placeholder="Minimum 5 characters"
        maxLength={500}
        disabled={loading}
        className="w-full p-2 border rounded resize-none h-28"
      />
      <div className="text-xs text-right text-gray-500">{reason.length}/500</div>
      <button
        onClick={handleSubmit}
        disabled={loading || reason.trim().length < 5}
        className={`w-full px-4 py-2 rounded font-semibold transition ${
          loading
            ? 'bg-gray-500 cursor-not-allowed text-white'
            : 'bg-red-600 text-white hover:opacity-90'
        }`}
        aria-label="Submit dispute"
      >
        {loading ? 'Submitting...' : 'Submit Dispute'}
      </button>
    </div>
  );
}
// Usage example
// <DisputeForm bookingId="12345" clientId="67890" />
// This component can be used in a booking details page or a similar context
// where the user can submit a dispute for a specific booking.
// Make sure to replace the `createDispute` function with your actual implementation
// for creating a dispute in your Firestore database.
// The `toast` library is used for displaying success and error messages.
// Ensure you have the necessary imports and setup for the `toast` library
// in your project.
// The `useState` hook is used to manage the state of the reason input,
// loading state, and submission status.
// The `handleSubmit` function is called when the user clicks the "Submit Dispute" button.
// It validates the input, calls the `createDispute` function, and handles
// success and error cases.
// The component returns a form with a textarea for the dispute reason,
// a character count, and a submit button.
// The button is disabled while loading or if the input is invalid.
// The component also handles the case where the dispute has already been submitted,
// displaying a success message instead of the form.
// The `submitted` state is used to track whether the dispute has been submitted.
// The `loading` state is used to show a loading indicator on the button
// while the dispute is being processed.
// The `reason` state is used to store the user's input for the dispute reason.
// The `setReason` function is used to update the `reason` state
// whenever the user types in the textarea.
// The `setLoading` function is used to update the `loading` state
// when the dispute is being submitted.
// The `setSubmitted` function is used to update the `submitted` state
// when the dispute is successfully submitted.
// The `handleSubmit` function is called when the user clicks the "Submit Dispute" button.
// It checks if the input is valid, sets the loading state, and calls the `createDispute` function.
// If the dispute is successfully created, it shows a success message
// and updates the submitted state.
// If there is an error, it shows an error message.
// The `handleSubmit` function also handles the case where the user
// tries to submit the dispute with an empty or invalid reason.
// The `trimmed` variable is used to check if the input is valid
// by removing leading and trailing whitespace.
// The `setLoading` function is used to set the loading state
// while the dispute is being processed.
// The `setSubmitted` function is used to update the submitted state
// when the dispute is successfully submitted.
// The `loading` state is used to disable the button and show a loading indicator
// while the dispute is being processed.
// The `submitted` state is used to show a success message
// instead of the form when the dispute has already been submitted. 