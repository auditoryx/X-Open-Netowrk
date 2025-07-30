'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { app, isFirebaseConfigured } from '@/lib/firebase'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  
  // Only initialize Firebase auth if Firebase is configured
  const auth = isFirebaseConfigured() ? getAuth(app) : null
  const provider = isFirebaseConfigured() ? new GoogleAuthProvider() : null

  const handleLogin = async () => {
    setError('')
    
    if (!auth) {
      setError('Login is not available - Firebase not configured')
      return
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push(redirect)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    
    if (!auth || !provider) {
      setError('Google login is not available - Firebase not configured')
      return
    }
    try {
      await signInWithPopup(auth, provider)
      router.push(redirect)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-6">Log In</h1>

      <button
        onClick={handleGoogleLogin}
        className="mb-6 bg-white text-black px-6 py-2 rounded hover:bg-gray-300"
      >
        Sign in with Google
      </button>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4 p-3 rounded bg-neutral-800 border border-neutral-700 text-white w-80"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4 p-3 rounded bg-neutral-800 border border-neutral-700 text-white w-80"
      />
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <button
        onClick={handleLogin}
        className="bg-white text-black px-6 py-2 rounded hover:bg-gray-300 mb-4"
      >
        Log In
      </button>
      
      <button
        onClick={() => console.log('Smoke test: Login page tested')}
        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 mb-4 text-sm"
        data-testid="smoke"
      >
        Test Login Page
      </button>
      
      <Link 
        href="/forgot-password" 
        className="text-blue-400 hover:text-blue-300 text-sm underline"
      >
        Forgot your password?
      </Link>
    </div>
  )
}
