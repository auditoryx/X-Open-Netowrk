import { useState } from 'react';
import { MentorshipBooking } from '@/lib/types/Mentorship';
import { createMentorshipBooking } from '@/lib/firestore/createMentorshipService';
import { Calendar, Clock, DollarSign, User, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface MentorshipBookingFormProps {
  mentorshipId: string;
  mentorId: string;
  menteeId: string;
  price: number;
  duration: number;
  onSuccess?: (bookingId: string) => void;
  onCancel?: () => void;
}

export default function MentorshipBookingForm({
  mentorshipId,
  mentorId,
  menteeId,
  price,
  duration,
  onSuccess,
  onCancel
}: MentorshipBookingFormProps) {
  const [formData, setFormData] = useState({
    sessionDate: '',
    sessionTime: '',
    specialRequests: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const bookingData: Omit<MentorshipBooking, 'id' | 'createdAt' | 'updatedAt'> = {
        mentorshipId,
        mentorId,
        menteeId,
        sessionDate: new Date(formData.sessionDate),
        sessionTime: formData.sessionTime,
        duration,
        price,
        status: 'pending',
        paymentStatus: 'pending',
        specialRequests: formData.specialRequests || undefined
      };

      const bookingId = await createMentorshipBooking(bookingData);
      toast.success('Mentorship booking created successfully!');
      onSuccess?.(bookingId);
    } catch (error) {
      console.error('Error creating mentorship booking:', error);
      toast.error('Failed to create mentorship booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Mentorship Session</h2>
        <p className="text-gray-600">Schedule your mentorship session</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Session Date
          </label>
          <input
            type="date"
            name="sessionDate"
            value={formData.sessionDate}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            Session Time
          </label>
          <input
            type="time"
            name="sessionTime"
            value={formData.sessionTime}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageCircle className="inline w-4 h-4 mr-1" />
            Special Requests (Optional)
          </label>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any specific topics or goals you'd like to focus on..."
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Duration:</span>
            <span className="text-sm text-gray-900">{duration} hours</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Total Price:
            </span>
            <span className="text-lg font-bold text-green-600">${price}</span>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Book Session'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// Helper function to create mentorship booking
async function createMentorshipBooking(bookingData: Omit<MentorshipBooking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const { db } = await import('@/lib/firebase');
  const { collection, addDoc } = await import('firebase/firestore');
  
  const booking = {
    ...bookingData,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const docRef = await addDoc(collection(db, 'mentorshipBookings'), booking);
  return docRef.id;
}
