"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProgressiveOnboarding } from "@/components/onboarding/ProgressiveOnboarding";
import toast from "react-hot-toast";
import { WeeklyCalendarSelector } from "./WeeklyCalendarSelector";
import { createBooking } from "@lib/firestore/createBooking";
import { checkBookingConflict } from "@/lib/firestore/checkBookingConflict";
import { useProviderAvailability } from "@/lib/hooks/useProviderAvailability";
import { getNextDateForWeekday } from "@/lib/google/utils";

type BookingFormProps = {
  providerId: string;
  providerName?: string;
  onBooked?: () => void;
};

export default function BookingForm({ providerId, providerName, onBooked }: BookingFormProps) {
  const { user } = useAuth();
  const { trackAction } = useProgressiveOnboarding();
  const { slots, busySlots, timezone } = useProviderAvailability(providerId);
  const [service, setService] = useState("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const triggerSignupPrompt = () => {
    // Track the booking attempt
    trackAction('booking_attempt');
    
    // Dispatch custom event to show signup modal
    window.dispatchEvent(new CustomEvent('show-signup-prompt', {
      detail: { action: 'booking', creatorName: providerName }
    }));
  };

  // If user is not logged in, show a booking preview with signup prompt
  if (!user) {
    return (
      <div className="bg-neutral-900 border border-white/10 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Book a Session</h3>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Service Type</label>
            <select 
              className="w-full p-3 bg-neutral-800 border border-white/10 rounded-lg text-white"
              disabled
            >
              <option>Select a service...</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Preferred Time</label>
            <div className="p-4 bg-neutral-800 border border-white/10 rounded-lg text-gray-400 text-center">
              Calendar will appear here after signup
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Message (Optional)</label>
            <textarea 
              className="w-full p-3 bg-neutral-800 border border-white/10 rounded-lg text-white h-24"
              placeholder="Tell them about your project..."
              disabled
            />
          </div>
        </div>
        
        <button
          onClick={triggerSignupPrompt}
          className="w-full bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all"
        >
          Sign Up to Book Session
        </button>
        
        <p className="text-sm text-gray-400 text-center mt-3">
          Free account • Secure payments • Instant confirmations
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();

    if (!user) {
      toast.error("Please log in to send a booking request.");
      return;
    }

    if (!selectedTime) {
      toast.error("Please select a time slot.");
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const conflict = await checkBookingConflict(providerId, selectedTime);
      if (conflict) {
        toast.error("Time slot already booked");
        setLoading(false);
        return;
      }
      await createBooking({
        clientId: user.uid,
        providerId,
        service,
        dateTime: selectedTime,
        message: trimmed,
      });
      toast.success("Booking request sent!");
      setMessage("");
      setService("");
      setSelectedTime(null);
      if (onBooked) {
        onBooked();
      }
    } catch (err) {
      console.error("Booking submission failed:", err);
      toast.error("Failed to send booking request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4 border rounded bg-white text-black"
    >
      <input
        type="text"
        placeholder="Service name"
        value={service}
        onChange={(e) => setService(e.target.value)}
        className="input-base"
        required
      />

      <WeeklyCalendarSelector
        availability={slots
          .map((s) => `${getNextDateForWeekday(s.day as any)}T${s.time}`)
          .filter(
            (dt) =>
              !busySlots.some(
                (b) => `${getNextDateForWeekday(b.day as any)}T${b.time}` === dt
              )
          )}
        onSelect={(dt) => setSelectedTime(dt as string)}
      />

      <p className="text-xs text-gray-600">
        Provider timezone: {timezone || "N/A"}
      </p>

      <label htmlFor="booking-message" className="text-sm font-medium">
        Message to provider
      </label>
      <textarea
        id="booking-message"
        aria-label="Booking message"
        placeholder="Type your message..."
        value={message}
        onChange={(e) =>
          setMessage(e.target.value.replace(/\s{2,}/g, " "))
        }
        className="textarea-base"
        maxLength={500}
        disabled={loading}
      />
      <div className="text-xs text-right text-gray-500">
        {message.length}/500
      </div>
      <button
        type="submit"
        aria-label="Send booking request"
        disabled={loading || !message.trim() || !selectedTime}
        className="btn btn-primary"
      >
        {loading ? "Sending…" : "Send Booking Request"}
      </button>
    </form>
  );
}
