import { db } from '@/lib/firebase'
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore'

const DAY_MS = 24 * 60 * 60 * 1000

export interface LogOptions {
  quickReply?: boolean
  /** Optional id used to deduplicate events (e.g. booking or message id) */
  contextId?: string
}

export async function logXpEvent(
  uid: string,
  xp: number,
  type: string,
  options: LogOptions = {}
) {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)
  const userData = userSnap.exists() ? (userSnap.data() as any) : {}

  const now = Date.now()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const activitiesRef = collection(db, 'users', uid, 'activities')
  if (options.contextId) {
    const dupQ = query(activitiesRef, where('contextId', '==', options.contextId))
    const dupSnap = await getDocs(dupQ)
    if (!dupSnap.empty) {
      await addDoc(collection(db, 'abuseLogs'), {
        uid,
        type,
        contextId: options.contextId,
        createdAt: serverTimestamp(),
      })
      return 0
    }
  }
  const q = query(activitiesRef, where('createdAt', '>=', Timestamp.fromDate(start)))
  const todaySnap = await getDocs(q)
  const earnedToday = todaySnap.docs.reduce((sum, d) => sum + (d.data().xp || 0), 0)

  const remaining = Math.max(0, 100 - earnedToday)
  const awarded = Math.min(xp, remaining)

  await addDoc(activitiesRef, {
    xp: awarded,
    type,
    contextId: options.contextId,
    createdAt: serverTimestamp(),
  })

  const last = userData.lastActivityAt?.toMillis
    ? userData.lastActivityAt.toMillis()
    : userData.lastActivityAt
      ? new Date(userData.lastActivityAt).getTime()
      : undefined
  let streak = userData.streakCount || 0
  if (options.quickReply) {
    if (last && now - last < DAY_MS) {
      streak += 1
    } else {
      streak = 1
    }
  } else if (!last || now - last >= DAY_MS) {
    streak = 0
  }

  await updateDoc(userRef, {
    points: (userData.points || 0) + awarded,
    streakCount: streak,
    lastActivityAt: serverTimestamp(),
  })

  return awarded
}
