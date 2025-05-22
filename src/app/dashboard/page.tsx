'use client'

import Navbar from '@/app/components/Navbar'
import { useRouter } from 'next/navigation'
import { getAuth, signOut } from 'firebase/auth'
import { app } from '@/lib/firebase'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const { userData } = useAuth()

  useEffect(() => {
    const auth = getAuth(app)
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login')
      } else {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    const auth = getAuth(app)
    await signOut(auth)
    router.push('/login')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6 text-center">Dashboard</h1>

        {userData?.proTier === 'standard' && (
          <div className="bg-yellow-400 text-black p-4 rounded-xl mb-6">
            <h2 className="font-bold text-lg">👤 Get Verified</h2>
            <p className="text-sm">Verified creators appear higher in Explore and unlock more visibility.</p>
            <Link href="/dashboard/edit">
              <button className="mt-2 px-4 py-2 bg-black text-white rounded">Start Verification</button>
            </Link>
          </div>
        )}

        <div className="flex flex-col space-y-6">
          <button onClick={() => router.push('/dashboard/services')} className="border border-white p-4 rounded hover:bg-white hover:text-black transition">
            Manage My Services
          </button>
          <button onClick={() => router.push('/services/add')} className="border border-white p-4 rounded hover:bg-white hover:text-black transition">
            Add New Service
          </button>
          <button onClick={() => router.push('/dashboard/orders')} className="border border-white p-4 rounded hover:bg-white hover:text-black transition">
            View Orders (Sales)
          </button>
          <button onClick={() => router.push('/dashboard/purchases')} className="border border-white p-4 rounded hover:bg-white hover:text-black transition">
            View Purchases (Buy History)
          </button>
          <button onClick={handleLogout} className="border border-white p-4 rounded hover:bg-white hover:text-black transition">
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
