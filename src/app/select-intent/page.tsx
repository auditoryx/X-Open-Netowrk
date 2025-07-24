'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { setUserIntent } from '@/lib/firestore/setUserIntent';
import XPProgressBar from '@/components/gamification/XPProgressBar';

export default function SelectIntentPage() {
  const [intent, setIntent] = useState<'client' | 'provider' | 'both' | ''>('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !intent) return;
    await setUserIntent(user.uid, intent as any);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Welcome! How do you plan to use AuditoryX?</h1>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
        <label className="flex items-center gap-2">
          <input type="radio" value="client" checked={intent==='client'} onChange={() => setIntent('client')} />
          Book Services (Client)
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" value="provider" checked={intent==='provider'} onChange={() => setIntent('provider')} />
          Offer Services (Provider)
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" value="both" checked={intent==='both'} onChange={() => setIntent('both')} />
          Both
        </label>
        <button type="submit" disabled={!intent} className="btn btn-primary w-full mt-4">Continue</button>
      </form>
      <div className="w-full max-w-sm mt-6">
        <XPProgressBar currentXP={0} targetXP={50} targetLabel="Apply for Verification" />
      </div>
    </div>
  );
}
