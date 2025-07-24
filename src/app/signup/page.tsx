'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);

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
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        createdAt: new Date()
      }, { merge: true });
      
      // Send verification email automatically
      try {
        await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });
      } catch (verificationError) {
        console.warn('Failed to send verification email:', verificationError);
        // Don't block signup if verification email fails
      }
      
      // Show verification prompt instead of redirecting immediately
      setShowVerificationPrompt(true);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  // Show verification prompt after successful signup
  if (showVerificationPrompt) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-md mx-auto bg-neutral-900 p-8 rounded-lg border border-neutral-700">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-900 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold mb-2">
              Account Created Successfully!
            </h2>
            
            <p className="text-gray-400 mb-6">
              We've sent a verification email to <strong>{email}</strong>. 
              Please check your inbox and click the verification link to activate your account.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/verify-email')}
                className="block w-full bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200"
              >
                Verify Email to Continue
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                You must verify your email before proceeding
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">Create an Account</h1>
      <p className="text-xs text-gray-400 mb-2">No spam — we respect your data.</p>
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
