import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export async function logActivity(uid: string, actionType: string, details: Record<string, any> = {}) {
  if (!uid || !actionType) return

  try {
    await addDoc(collection(db, 'activityLogs', uid, 'logs'), {
      actionType,
      timestamp: serverTimestamp(),
      details,
    })
  } catch (err) {
    console.error('Error logging activity:', err)
  }
}
