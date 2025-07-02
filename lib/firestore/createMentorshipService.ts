import { firestore } from '@/lib/firebase/firebaseAdmin';
import { Mentorship } from '@/lib/types/Mentorship';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';

interface CreateMentorshipParams {
  creatorUid: string;
  title: string;
  description: string;
  format: 'live' | 'async';
  price: number;
  durationMinutes: number;
  availableDays?: string[];
  availableTimeSlots?: string[];
  zoomLink?: string;
  maxBookingsPerDay?: number;
  expertise: string[];
}

export async function createMentorshipService(params: CreateMentorshipParams): Promise<string> {
  // Get creator info to store with mentorship
  const creatorDoc = await getDoc(doc(firestore, 'users', params.creatorUid));
  let creatorName = 'Unknown Creator';
  let creatorProfileImage = null;
  
  if (creatorDoc.exists()) {
    const creatorData = creatorDoc.data();
    creatorName = creatorData.displayName || creatorName;
    creatorProfileImage = creatorData.profileImage || null;
  }

  // Create mentorship document
  const mentorshipData: Omit<Mentorship, 'id'> = {
    creatorUid: params.creatorUid,
    title: params.title,
    description: params.description,
    format: params.format,
    price: params.price,
    durationMinutes: params.durationMinutes,
    availableDays: params.availableDays || [],
    availableTimeSlots: params.availableTimeSlots || [],
    zoomLink: params.format === 'live' ? params.zoomLink : undefined,
    maxBookingsPerDay: params.maxBookingsPerDay || 5,
    expertise: params.expertise,
    creatorName,
    creatorProfileImage,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const mentorshipRef = await addDoc(collection(firestore, 'mentorships'), mentorshipData);
  return mentorshipRef.id;
}

export async function updateMentorshipService(mentorshipId: string, updates: Partial<Mentorship>): Promise<void> {
  const mentorshipRef = doc(firestore, 'mentorships', mentorshipId);
  await updateDoc(mentorshipRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

export async function toggleMentorshipActive(mentorshipId: string, active: boolean): Promise<void> {
  const mentorshipRef = doc(firestore, 'mentorships', mentorshipId);
  await updateDoc(mentorshipRef, {
    active,
    updatedAt: serverTimestamp()
  });
}
