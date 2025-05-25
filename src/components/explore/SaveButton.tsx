'use client'

import { useEffect, useState } from 'react'
import { toggleFavorite } from '@/lib/firestore/toggleFavorite'
import { useAuth } from '@/lib/hooks/useAuth'
import { AiOutlineStar, AiFillStar } from 'react-icons/ai'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type Props = {
  creatorId: string
}

const SaveButton = ({ creatorId }: Props) => {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return
      const ref = doc(db, 'users', user.uid)
      const snap = await getDoc(ref)
      const data = snap.exists() ? snap.data() : {}
      const favs = data.favorites || []
      setSaved(favs.includes(creatorId))
    }

    fetchFavorites()
  }, [user, creatorId])

  const toggle = async () => {
    if (!user) {
      alert('Please log in to save favorites.')
      return
    }

    const newState = !saved
    setSaved(newState)
    await toggleFavorite(user.uid, creatorId, newState)
  }

  return (
    <button onClick={toggle} className="text-xl" title={saved ? 'Unsave' : 'Save'}>
      {saved ? <AiFillStar className="text-yellow-500" /> : <AiOutlineStar />}
    </button>
  )
}

export default SaveButton
