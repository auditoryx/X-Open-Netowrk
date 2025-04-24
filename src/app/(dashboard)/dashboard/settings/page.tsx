'use client'

import { useEffect, useState } from 'react'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export default function SettingsPage() {
  const [visible, setVisible] = useState(true)
  const [uid, setUid] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid)
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (snap.exists()) {
          setVisible(snap.data().visible)
        }
      }
    })
    return () => unsubscribe()
  }, [])

  const toggleVisibility = async () => {
    if (!uid) return
    const ref = doc(db, 'users', uid)
    await updateDoc(ref, { visible: !visible })
    setVisible(!visible)
  }

  const deleteProfile = async () => {
    if (!uid) return
    const confirmed = confirm('Are you sure you want to delete your profile? This cannot be undone.')
    if (!confirmed) return

    try {
      await deleteDoc(doc(db, 'users', uid))
      alert('Your profile has been deleted.')
      // Optional: add redirect or refresh logic here
    } catch (error) {
      console.error('Error deleting profile:', error)
    }
  }

  return (
    <div className="max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="flex items-center justify-between">
        <span>Public Profile Visibility</span>
        <button
          onClick={toggleVisibility}
          className={`px-4 py-2 rounded text-white ${visible ? 'bg-green-600' : 'bg-gray-400'}`}
        >
          {visible ? 'Visible' : 'Hidden'}
        </button>
      </div>
      <div className="pt-4">
        <button
          onClick={deleteProfile}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete Profile
        </button>
      </div>
    </div>
  )
}
