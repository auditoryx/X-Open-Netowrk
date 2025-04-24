import { cookies } from 'next/headers'
import { getAuth } from 'firebase-admin/auth'
import { admin } from './firebase-admin'

export async function getServerUser() {
  const token = cookies().get('__session')?.value
  if (!token) return null

  try {
    const decoded = await getAuth(admin).verifyIdToken(token)
    return {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role || null,
    }
  } catch (err) {
    console.error('getServerUser error:', err)
    return null
  }
}
