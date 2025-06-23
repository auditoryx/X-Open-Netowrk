import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { calcRankScore } from '../../../src/lib/rank'
import { TIER_WEIGHT } from '../../../src/constants/gamification'

if (!admin.apps.length) {
  admin.initializeApp()
}

export const calcTierAndRank = functions.pubsub
  .schedule('0 17 * * *') // 02:00 JST
  .timeZone('UTC')
  .onRun(async () => {
    const db = admin.firestore()
    const usersCol = db.collection('users')
    let last: FirebaseFirestore.QueryDocumentSnapshot | null = null
    const batchSize = 500

    while (true) {
      let q: FirebaseFirestore.Query = usersCol
        .where('role', '==', 'creator')
        .orderBy(admin.firestore.FieldPath.documentId())
        .limit(batchSize)

      if (last) q = q.startAfter(last)

      const snap = await q.get()
      if (snap.empty) break

      const batch = db.batch()
      snap.docs.forEach((doc) => {
        const data = doc.data() as any
        const xp = data.xp || data.points || 0
        const rating = data.averageRating || 0
        const reviews = data.reviewCount || 0
        const responseHrs = data.responseHrs || 0
        const lateDeliveries = data.lateDeliveries || 0
        const openDisputes = data.openDisputes || 0
        const tierFrozen = openDisputes > 0
        let tier: 'standard' | 'verified' | 'signature' = data.tier || data.proTier || 'standard'

        if (!tierFrozen) {
          if (xp >= 2500) tier = 'signature'
          else if (xp >= 500) tier = 'verified'
          else tier = 'standard'
        }

        const rankScore = calcRankScore({
          tier,
          rating,
          reviews,
          xp,
          responseHrs,
          proximityKm: 0,
        })

        const updates: any = { rankScore, tierFrozen }
        if (tier !== (data.tier || data.proTier)) {
          updates.tier = tier
          updates.proTier = tier
        }
        batch.update(doc.ref, updates)
      })

      await batch.commit()
      last = snap.docs[snap.docs.length - 1]
    }

    return null
  })
