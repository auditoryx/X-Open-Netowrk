import { NextRequest } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { admin } from '../firebase-admin'

export async function getServerUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.split('Bearer ')[1]
  if (!token) return null
  try {
    const decoded = await getAuth(admin).verifyIdToken(token)
    const snap = await admin.firestore().collection('users').doc(decoded.uid).get()
    const data = snap.data()
    if (data?.banned) return null
    return { uid: decoded.uid, email: decoded.email, ...data }
  } catch {
    return null
  }
}
