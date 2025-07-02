import { useState, useEffect } from 'react';
import { createBookingWithContract } from '@/lib/firestore/createBookingWithContract';
import { useAuth } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';
import { Booking, RevenueSplit } from '@/lib/types/Booking';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/firebaseAdmin';

interface BookingFormProps {
  providerId: string;
  serviceId: string;
  studioId: string;
  durationMinutes: number;
  totalCost: number;
  scheduledAt: Date;
}

export default function BookingForm({
  providerId,
  serviceId,
  studioId,
  durationMinutes,
  totalCost,
  scheduledAt,
}: BookingFormProps) {
  const { user } = useAuth();
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [revenueSplit, setRevenueSplit] = useState<RevenueSplit>({ client: 50, provider: 50 });
  const [providerAllowsSplitEdit, setProviderAllowsSplitEdit] = useState(false);

  useEffect(() => {
    const fetchProviderSettings = async () => {
      const providerDoc = await getDoc(doc(firestore, 'users', providerId));
      if (providerDoc.exists()) {
        const providerData = providerDoc.data();
        if (providerData.defaultRevenueSplit) {
          setRevenueSplit(providerData.defaultRevenueSplit);
        }
        setProviderAllowsSplitEdit(providerData.allowsSplitEdit || false);
      }
    };
    fetchProviderSettings();
  }, [providerId]);

  const handleSplitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const clientSplit = parseInt(value, 10);
    if (!isNaN(clientSplit) && clientSplit >= 0 && clientSplit <= 100) {
      setRevenueSplit({
        client: clientSplit,
        provider: 100 - clientSplit,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to book.');
      return;
    }

    const bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'contractUrl'> = {
      clientUids: [user.uid],
      creatorUid: providerId,
      serviceId,
      studioId,
      status: 'pending',
      scheduledAt,
      durationMinutes,
      totalCost,
      sessionTitle,
      sessionDescription,
      revenueSplit,
      createdBy: user.uid,
    };

    try {
      await createBookingWithContract(bookingData);
      toast.success('Booking request sent and contract generated!');
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Failed to create booking. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <input
        placeholder="Session Title"
        value={sessionTitle}
        onChange={(e) => setSessionTitle(e.target.value)}
        className='w-full p-2 border rounded'
        required
      />
      <textarea
        placeholder="Session Description"
        value={sessionDescription}
        onChange={(e) => setSessionDescription(e.target.value)}
        className='w-full p-2 border rounded'
      />
      
      <div className="p-4 border rounded-md">
        <label className="block font-bold mb-2">Revenue Split</label>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm">You Keep: {revenueSplit.client}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={revenueSplit.client}
              onChange={handleSplitChange}
              className="w-full"
              disabled={!providerAllowsSplitEdit}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm">Creator Keeps: {revenueSplit.provider}%</label>
          </div>
        </div>
        {!providerAllowsSplitEdit && (
          <p className="text-xs text-gray-500 mt-2">The creator has locked the revenue split for this service.</p>
        )}
      </div>

      <button type='submit' className='bg-black text-white px-4 py-2 rounded w-full'>
        Request Booking & Sign Contract
      </button>
    </form>
  );
}
