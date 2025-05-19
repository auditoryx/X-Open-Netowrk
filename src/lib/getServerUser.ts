import { getAuth } from 'firebase-admin/auth'
import { admin } from './firebase-admin'

export async function getServerUser(token: string) {
  try {
    const decoded = await getAuth(admin).verifyIdToken(token)
    const uid = decoded.uid

    const snap = await admin.firestore().collection('users').doc(uid).get()
    const data = snap.data()

    if (data?.banned) return null // 🔒 Block banned users
    return { uid, email: decoded.email, ...data }
  } catch (err) {
    return null
  }
}
