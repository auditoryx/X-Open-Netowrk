import { db } from '@/lib/firebase'
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  setDoc,
  doc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore'

export interface LeaderboardEntry {
  uid: string
  points: number
}

export async function generateLeaderboard(period: 'weekly' | 'monthly', top = 10) {
  const usersRef = collection(db, 'users')
  const q = query(usersRef, orderBy('points', 'desc'), limit(top))
  const snap = await getDocs(q)
  const entries = snap.docs.map(d => ({ uid: d.id, points: (d.data() as any).points || 0 }))
  await setDoc(doc(db, 'leaderboards', period), {
    period,
    generatedAt: serverTimestamp(),
    entries,
  })
  return entries
}

export async function fetchLeaderboard(period: 'weekly' | 'monthly') {
  const ref = doc(db, 'leaderboards', period)
  const snap = await getDoc(ref)
  return snap.exists() ? ((snap.data() as any).entries as LeaderboardEntry[]) : []
}
