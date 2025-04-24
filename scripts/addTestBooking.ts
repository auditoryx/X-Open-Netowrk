import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({
  credential: applicationDefault(),
  projectId: 'auditory-x-dev-f', // 🔥 ADD THIS
});

const firestore = getFirestore();

async function addTestBooking() {
  await firestore.doc('bookings/test-booking-1').set({
    providerId: 'test-creator-uid',
    status: 'completed',
    review: {
      rating: 5,
      text: 'legend',
    },
  });

  console.log('✅ Test booking added');
}

addTestBooking().catch(console.error);
