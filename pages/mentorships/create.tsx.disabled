import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/router';
import CreateMentorshipForm from '@/components/forms/CreateMentorshipForm';
import { useEffect } from 'react';

export default function CreateMentorshipPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect to login
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Create Mentorship Offer</h1>
          <p className="text-gray-600 mb-8">
            Share your expertise through live or asynchronous mentorship sessions.
          </p>
          
          <div className="bg-white rounded-lg shadow p-6">
            <CreateMentorshipForm />
          </div>
        </div>
      </div>
    </div>
  );
}
