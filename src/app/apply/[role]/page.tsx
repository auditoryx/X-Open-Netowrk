'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/app/components/Navbar'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '@/lib/hooks/useAuth'
import { cityToCoords } from '@/lib/utils/cityToCoords'
import OnboardingStepHeader from '@/components/onboarding/OnboardingStepHeader'

export default function ApplyRolePage({ params }: { params: { role: string } }) {
  const router = useRouter()
  const { user, userData, loading } = useAuth()
  const [bio, setBio] = useState('')
  const [links, setLinks] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/apply/${params.role}`)
    }
  }, [user, loading, params.role, router])

  const handleSubmit = async () => {
    setError('')
    if (!user) return setError('You must be logged in to apply.')
    if (!bio.trim() || !links.trim() || !location.trim()) {
      return setError('All fields are required.')
    }

    const cleanedCity = location.toLowerCase().replace(/\s+/g, '')
    const fallbackCoords = cityToCoords[cleanedCity]
    let locationLat = null
    let locationLng = null

    if (fallbackCoords) {
      locationLng = fallbackCoords[0]
      locationLat = fallbackCoords[1]
    }

    await addDoc(collection(db, 'pendingVerifications'), {
      uid: user.uid,
      email: userData?.email || user.email,
      name: userData?.name || user.displayName || '',
      role: params.role,
      bio,
      links,
      location,
      locationLat,
      locationLng,
      timestamp: serverTimestamp(),
    })

    setSubmitted(true)
  }

  if (loading) {
    return <div className="text-white p-8">Loading...</div>
  }

  if (!user) {
    return <div className="text-red-500 p-8 text-center">You must be logged in to apply.</div>
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto py-12 px-6">
        <OnboardingStepHeader
          step={1}
          total={3}
          title={`Apply as ${params.role}`}
          subtitle="Tell us who you are so we can verify you."
        />

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="text-4xl text-green-400">✅</div>
            <h2 className="text-2xl font-bold">Application Submitted</h2>
            <p className="text-gray-400">
              Thanks for applying as a <strong>{params.role}</strong>. Our team will review your request and follow up shortly.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold capitalize mb-2">Apply as {params.role}</h1>
            <p className="text-gray-400 mb-6">
              Fill out the form to request verification as a {params.role}. Be clear and professional — this helps us verify you faster.
            </p>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Your Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
                  rows={4}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Links (Portfolio, Socials, Reels)</label>
                <input
                  value={links}
                  onChange={(e) => setLinks(e.target.value)}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Your City</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="mt-6 w-full bg-white text-black py-2 rounded hover:bg-gray-200 transition"
            >
              Submit Application
            </button>
          </>
        )}
      </div>
    </div>
  )
}
