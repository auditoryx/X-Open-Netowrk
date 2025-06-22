'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { app, db } from '@/lib/firebase';
import { getRedirectAfterSignup } from './getRedirectAfterSignup';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const auth = getAuth(app);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleOAuthSignup = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: redirectPath });
    } catch (err: any) {
      setError(err.message || 'OAuth signup failed');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      const role = snap.exists() ? (snap.data() as any).role : null;
      const path = getRedirectAfterSignup(role, redirectPath);
      router.push(path);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">Create an Account</h1>
      <p className="text-xs text-gray-400 mb-2">No spam — we respect your data.</p>
      <button onClick={() => signIn('google')} className="btn btn-primary w-full mb-4">
        Sign up with Google
      </button>
      <div className="flex flex-col gap-2 w-full max-w-sm mb-6">
        <button
          onClick={() => handleOAuthSignup('google')}
          className="w-full bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200"
        >
          Sign up with Google
        </button>
        <button
          onClick={() => handleOAuthSignup('apple')}
          className="w-full bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200"
        >
          Sign up with Apple
        </button>
        <button
          onClick={() => handleOAuthSignup('line')}
          className="w-full bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200"
        >
          Sign up with LINE
        </button>
        <button
          onClick={() => handleOAuthSignup('kakao')}
          className="w-full bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200"
        >
          Sign up with Kakao
        </button>
      </div>
      <form onSubmit={handleSignup} className="w-full max-w-sm space-y-4">
        <input
          type="email"
          className="w-full px-4 py-2 rounded bg-neutral-800 border border-neutral-700"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full px-4 py-2 rounded bg-neutral-800 border border-neutral-700"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200"
        >
          Sign Up
        </button>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
}
