import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { logXpEvent } from '@/lib/gamification'

const REFERRAL_XP = 500

async function getReferralCode(uid: string): Promise<string | null> {
  const codesRef = collection(db, 'referralCodes')
  const q = query(codesRef, where('ownerId', '==', uid))
  const snap = await getDocs(q)
  return snap.empty ? null : snap.docs[0].id
}

export async function generateReferralCode(uid: string): Promise<string> {
  const existing = await getReferralCode(uid)
  if (existing) return existing

  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  await setDoc(doc(db, 'referralCodes', code), {
    ownerId: uid,
    createdAt: serverTimestamp(),
  })
  return code
}

export async function redeemReferralCode(
  uid: string,
  code: string,
): Promise<boolean> {
  const codeRef = doc(db, 'referralCodes', code)
  const snap = await getDoc(codeRef)
  if (!snap.exists()) return false
  const data = snap.data() as any
  if (data.ownerId === uid || data.redeemedBy) return false

  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  if (userSnap.exists() && (userSnap.data() as any).referredBy) return false

  await updateDoc(codeRef, { redeemedBy: uid, redeemedAt: serverTimestamp() })
  await updateDoc(userRef, { referredBy: data.ownerId })
  await logXpEvent(uid, REFERRAL_XP, 'referral')
  return true
}
