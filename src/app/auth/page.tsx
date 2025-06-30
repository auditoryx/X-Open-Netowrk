'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/firebase/firebaseConfig';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import BannedNotice from '@/components/BannedNotice';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBanned, setIsBanned] = useState(false);
  const router = useRouter();

  useEffect(() => {
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
      }
    });

    return () => unsub();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 🔒 Show banned screen if needed
  if (isBanned) return <BannedNotice />;

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
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
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded"
        />
        <button type="submit" className="btn btn-primary w-full">
          Login
        </button>
      </form>
    </main>
  );
}
