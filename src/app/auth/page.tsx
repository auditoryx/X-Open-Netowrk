'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/firebase/firebaseConfig';
import { isFirebaseConfigured } from '@/lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import BannedNotice from '@/components/BannedNotice';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBanned, setIsBanned] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured in auth page');
      setFirebaseError('Authentication service unavailable');
      return;
    }

    try {
      const unsub = onAuthStateChanged(auth, async (user) => {
        if (!user) return;

        try {
          const token = await user.getIdTokenResult();
          const uid = user.uid;

          // 🔍 Fetch Firestore user data to check for banned flag
          const res = await fetch(`/api/users/${uid}`);
          const userData = await res.json();

          if (userData?.banned) {
            setIsBanned(true);
            return;
          }

          // ✅ Redirect based on role
          if (token.claims.admin) {
            router.push('/admin/applications');
          } else if (token.claims.role) {
            router.push(`/dashboard/${token.claims.role}`);
          } else {
            router.push('/');
          }
        } catch (err) {
          console.error('Auth check failed:', err);
          setFirebaseError('Authentication check failed');
        }
      });

      return () => unsub();
    } catch (error) {
      console.error('Failed to set up auth listener:', error);
      setFirebaseError('Authentication service error');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFirebaseConfigured()) {
      alert('Authentication service is not available');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error('Login failed:', err);
      alert(err.message || 'Login failed');
    }
  };

  // 🔒 Show banned screen if needed
  if (isBanned) return <BannedNotice />;

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      {firebaseError && (
        <div className="absolute top-4 left-4 right-4 bg-red-900 text-red-100 p-4 rounded-lg">
          ⚠️ {firebaseError}
        </div>
      )}
      
      {!isFirebaseConfigured() && (
        <div className="absolute top-20 left-4 right-4 bg-blue-900 text-blue-100 p-4 rounded-lg">
          ℹ️ Authentication service unavailable - running in development mode
        </div>
      )}

      <form
        onSubmit={handleLogin}
        className="bg-gray-900 p-8 rounded-md space-y-6 max-w-md w-full"
      >
        <h1 className="text-2xl font-bold">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded"
          disabled={!isFirebaseConfigured()}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded"
          disabled={!isFirebaseConfigured()}
        />
        <button 
          type="submit" 
          className="btn btn-primary w-full"
          data-testid="smoke"
          disabled={!isFirebaseConfigured()}
        >
          {isFirebaseConfigured() ? 'Login' : 'Login (Unavailable)'}
        </button>
      </form>
    </main>
  );
}
