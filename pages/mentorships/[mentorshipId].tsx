import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Mentorship, isCreatorOfMentorship } from '@/lib/types/Mentorship';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toggleMentorshipActive } from '@/lib/firestore/createMentorshipService';
import MentorshipBookingForm from '@/components/forms/MentorshipBookingForm';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function MentorshipDetailPage() {
  const router = useRouter();
  const { mentorshipId } = router.query;
  const { user, loading: authLoading } = useAuth();
  
  const [mentorship, setMentorship] = useState<Mentorship | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessingToggle, setIsProcessingToggle] = useState(false);
  
  useEffect(() => {
    if (mentorshipId && typeof mentorshipId === 'string') {
      fetchMentorship(mentorshipId);
    }
  }, [mentorshipId]);
  
  const fetchMentorship = async (id: string) => {
    try {
      const mentorshipDoc = await getDoc(doc(db, 'mentorships', id));
      
      if (!mentorshipDoc.exists()) {
        toast.error('Mentorship not found');
        router.push('/mentorships');
        return;
      }
      
      setMentorship({
        id: mentorshipDoc.id,
        ...mentorshipDoc.data()
      } as Mentorship);
    } catch (error) {
      console.error('Error fetching mentorship:', error);
      toast.error('Failed to load mentorship');
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleActive = async () => {
    if (!mentorship || !user) return;
    
    setIsProcessingToggle(true);
    
    try {
      await toggleMentorshipActive(mentorship.id!, !mentorship.active);
      toast.success(`Mentorship ${mentorship.active ? 'deactivated' : 'activated'}`);
      // Refresh the page
      fetchMentorship(mentorship.id!);
    } catch (error) {
      console.error('Error toggling mentorship active state:', error);
      toast.error('Failed to update mentorship');
    } finally {
      setIsProcessingToggle(false);
    }
  };
  
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }
  
  if (!mentorship) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Mentorship not found</h2>
          <Link href="/mentorships" className="text-blue-600 hover:underline mt-4 inline-block">
            Browse Mentorships
          </Link>
        </div>
      </div>
    );
  }
  
  const isCreator = user && isCreatorOfMentorship(mentorship, user.uid);
  const canBook = user && !isCreator && mentorship.active;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <Link href="/mentorships" className="text-blue-600 hover:underline mb-2 inline-block">
                ← Back to Mentorships
              </Link>
              <h1 className="text-3xl font-bold">{mentorship.title}</h1>
              <p className="text-gray-600">
                by {mentorship.creatorName || 'Creator'}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${mentorship.format === 'live' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                {mentorship.format === 'live' ? 'Live Session' : 'Async Feedback'}
              </span>
              
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${mentorship.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {mentorship.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">About this Mentorship</h2>
                <p className="text-gray-700 whitespace-pre-line mb-6">
                  {mentorship.description}
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Format</h3>
                    <p className="text-gray-700">
                      {mentorship.format === 'live' 
                        ? `Live ${mentorship.durationMinutes}-minute session via Zoom` 
                        : `Asynchronous feedback (typically within 48 hours)`}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Areas of Expertise</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {mentorship.expertise.map(area => (
                        <span key={area} className="px-2 py-1 bg-gray-100 rounded-md text-sm">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {mentorship.format === 'live' && mentorship.availableDays && mentorship.availableDays.length > 0 && (
                    <div>
                      <h3 className="font-medium">Available Days</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {mentorship.availableDays.map(day => (
                          <span key={day} className="px-2 py-1 bg-gray-100 rounded-md text-sm capitalize">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {isCreator && (
                    <div className="mt-8 pt-6 border-t">
                      <h3 className="font-medium mb-3">Creator Actions</h3>
                      <div className="flex flex-wrap gap-3">
                        <Link href={`/mentorships/${mentorship.id}/edit`} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                          Edit Mentorship
                        </Link>
                        <button
                          onClick={handleToggleActive}
                          disabled={isProcessingToggle}
                          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm disabled:opacity-50"
                        >
                          {isProcessingToggle ? 'Processing...' : mentorship.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sidebar - Pricing and Booking */}
            <div className="md:col-span-1">
              {canBook ? (
                <MentorshipBookingForm mentorship={mentorship} />
              ) : (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-2">Pricing</h2>
                  <p className="text-3xl font-bold mb-4">${mentorship.price}</p>
                  <p className="text-gray-600 mb-6">
                    {mentorship.durationMinutes} minute {mentorship.format === 'live' ? 'live session' : 'review & feedback'}
                  </p>
                  
                  {!user ? (
                    <Link href="/auth/login" className="block w-full py-3 px-4 bg-black text-white text-center rounded-md hover:bg-gray-800">
                      Login to Book
                    </Link>
                  ) : isCreator ? (
                    <p className="text-gray-500 text-center">This is your mentorship offering</p>
                  ) : !mentorship.active ? (
                    <p className="text-gray-500 text-center">This mentorship is currently unavailable</p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
