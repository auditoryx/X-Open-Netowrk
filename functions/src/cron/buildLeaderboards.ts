import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

if (!admin.apps.length) {
  admin.initializeApp()
}

export interface LeaderboardEntry {
  uid: string
  name?: string
  points: number
}

export interface LeaderboardMap {
  [city: string]: { [role: string]: LeaderboardEntry[] }
}

export function buildLeaderboardData(users: any[]): LeaderboardMap {
  const map: LeaderboardMap = {}
  users.forEach((u) => {
    const { city, role, pointsMonth = 0, displayName } = u
    if (!city || !role) return
    if (!map[city]) map[city] = {}
    if (!map[city][role]) map[city][role] = []
    map[city][role].push({ uid: u.uid, name: displayName, points: pointsMonth })
  })
  Object.values(map).forEach((roles) => {
    Object.keys(roles).forEach((r) => {
      roles[r].sort((a, b) => b.points - a.points)
      roles[r] = roles[r].slice(0, 10)
    })
  })
  return map
}

export const buildLeaderboards = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const db = admin.firestore()
    const snap = await db.collection('users').get()
    const users = snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
    const grouped = buildLeaderboardData(users)
    const batch = db.batch()

    Object.entries(grouped).forEach(([city, roles]) => {
      Object.entries(roles).forEach(([role, entries]) => {
        const col = db.collection('leaderboards').doc(city).collection(role)
        entries.forEach((entry) => {
          batch.set(col.doc(entry.uid), entry)
        })
      })
    })

    if (new Date().getDate() === 1) {
      snap.docs.forEach((d) => batch.update(d.ref, { pointsMonth: 0 }))
    }

    await batch.commit()
    return null
  })
