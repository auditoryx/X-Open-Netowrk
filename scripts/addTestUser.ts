import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

initializeApp({
  credential: applicationDefault(),
  projectId: 'auditory-x-dev-f' // 👈 manually specify your project ID
})

const db = getFirestore()

async function addTestUser() {
  const docRef = db.collection('users').doc('test-creator-uid')

  await docRef.set({
    uid: 'test-creator-uid',
    role: 'videographer',
    name: 'Test Creator',
    email: 'test@example.com',
    location: 'Tokyo, Japan',
    profileImageUrl: 'https://placehold.co/100x100',
    portfolio: [
      {
        title: 'Tokyo Skate Promo',
        mediaUrl: 'https://example.com/skate.mp4',
        description: 'Shot and edited a brand video for a Tokyo-based skate brand.',
      }
    ],
    socials: {
      instagram: '@testcreator',
      website: 'https://testcreator.io'
    },
    availability: {
      timezone: 'Asia/Tokyo',
      days: ['Monday', 'Wednesday', 'Friday'],
      hours: ['13:00', '18:00']
    },
    verified: false,
    createdAt: new Date()
  })

  console.log('✅ Test user added')
}

addTestUser().catch(console.error)
