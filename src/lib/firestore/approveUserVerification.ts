import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

/**
 * Approve a user's ID verification request. If the user has at least
 * 500 XP, they are promoted to the verified pro tier.
 */
export async function approveUserVerification(uid: string) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  const points = snap.exists() ? (snap.data() as any).points || 0 : 0

  const updates: any = { verificationStatus: 'verified' }
  if (points >= 500) {
    updates.proTier = 'verified'
  }
  await updateDoc(ref, updates)
  return updates
}
