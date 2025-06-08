import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({
  credential: applicationDefault(),
  projectId: 'auditory-x-open-network',
});

const db = getFirestore();

// Default templates grouped by creator role
const templates: Record<string, Array<Record<string, any>>> = {
  artist: [
    {
      id: 'feature-verse',
      title: 'Feature Verse',
      description: 'Add a guest verse to a track',
      price: 100,
    },
    {
      id: 'mix-master',
      title: 'Mix & Master',
      description: 'Professional mixing and mastering',
      price: 200,
    },
  ],
  videographer: [
    {
      id: 'music-video',
      title: 'Music Video Shoot',
      description: 'Full production for a music video',
      price: 500,
    },
  ],
  studio: [
    {
      id: 'hourly-session',
      title: 'Studio Session',
      description: 'Hourly recording session',
      price: 50,
    },
  ],
};

async function seed() {
  for (const [role, list] of Object.entries(templates)) {
    for (const tpl of list) {
      await db
        .collection('serviceTemplates')
        .doc(role)
        .collection('templates')
        .doc(tpl.id)
        .set(tpl);
    }
  }
  console.log('✅ Seeded service templates');
}

seed().catch((err) => {
  console.error('❌ Failed to seed templates:', err);
});
