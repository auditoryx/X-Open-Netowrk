import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (process.env.NODE_ENV !== 'development') {
  console.log('seedDemo.ts only runs in development mode')
  process.exit(0)
}

initializeApp({
  credential: applicationDefault(),
  projectId: 'auditory-x-dev-f',
})

const db = getFirestore()

const creators = [
  {
    uid: 'demo-creator-1',
    displayName: 'Demo Artist',
    email: 'demo1@example.com',
    role: 'artist',
    photoURL: 'https://placehold.co/100x100?text=Artist',
    location: 'Tokyo, Japan',
    verified: true,
    availability: [
      new Date(Date.now() + 86400000).toISOString(),
      new Date(Date.now() + 172800000).toISOString(),
    ],
    createdAt: new Date(),
  },
  {
    uid: 'demo-creator-2',
    displayName: 'Demo Producer',
    email: 'demo2@example.com',
    role: 'producer',
    photoURL: 'https://placehold.co/100x100?text=Producer',
    location: 'Los Angeles, USA',
    verified: true,
    availability: [
      new Date(Date.now() + 259200000).toISOString(),
      new Date(Date.now() + 345600000).toISOString(),
    ],
    createdAt: new Date(),
  },
  {
    uid: 'demo-creator-3',
    displayName: 'Demo Videographer',
    email: 'demo3@example.com',
    role: 'videographer',
    photoURL: 'https://placehold.co/100x100?text=Video',
    location: 'Berlin, Germany',
    verified: true,
    availability: [
      new Date(Date.now() + 432000000).toISOString(),
      new Date(Date.now() + 518400000).toISOString(),
    ],
    createdAt: new Date(),
  },
]

async function seed() {
  for (const creator of creators) {
    await db.collection('users').doc(creator.uid).set(creator)
  }
  console.log('✅ Seeded demo creators')
}

seed().catch((err) => {
  console.error('❌ Failed to seed demo creators:', err)
})
