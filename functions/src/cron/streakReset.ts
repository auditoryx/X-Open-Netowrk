import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { XP_VALUES } from '../../../src/constants/gamification'

if (!admin.apps.length) {
  admin.initializeApp()
}

const DAY_MS = 24 * 60 * 60 * 1000

export const streakReset = functions.pubsub
  .schedule('every day 06:00')
  .timeZone('UTC')
  .onRun(async () => {
    const db = admin.firestore()
    const users = await db.collection('users').get()
    const now = Date.now()
    const batch = db.batch()

    users.docs.forEach((doc) => {
      const data = doc.data() as any
      const last = data.lastActivityAt?.toMillis
        ? data.lastActivityAt.toMillis()
        : data.lastActivityAt?.seconds
          ? data.lastActivityAt.seconds * 1000
          : null

      if (!last || now - last >= DAY_MS) {
        const streak = data.streakCount || data.streak || 0
        const award = Math.floor(streak / 7) * XP_VALUES.sevenDayStreak

        const updates: any = { streakCount: 0 }
        if (award > 0) {
          updates.xp = admin.firestore.FieldValue.increment(award)
        }

        batch.update(doc.ref, updates)
      }
    })

    await batch.commit()
    console.log(`Streak reset for ${users.size} users.`)
    return null
  });
