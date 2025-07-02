import { firestore } from '@/lib/firebase/firebaseAdmin';
import { MentorshipBooking, MentorshipFormat } from '@/lib/types/Mentorship';
import { collection, addDoc, serverTimestamp, doc, getDoc, Timestamp } from 'firebase/firestore';

interface CreateMentorshipBookingParams {
  mentorshipId: string;
  clientUid: string;
  scheduledAt?: Date; // For live sessions
  sessionGoal?: string;
  projectFiles?: string[];
}

export async function createMentorshipBooking(params: CreateMentorshipBookingParams): Promise<string> {
  // First, get the mentorship details
  const mentorshipRef = doc(firestore, 'mentorships', params.mentorshipId);
  const mentorshipDoc = await getDoc(mentorshipRef);
  
  if (!mentorshipDoc.exists()) {
    throw new Error('Mentorship not found');
  }
  
  const mentorship = mentorshipDoc.data();
  
  // Get client name
  const clientDoc = await getDoc(doc(firestore, 'users', params.clientUid));
  let clientName = 'Unknown Client';
  
  if (clientDoc.exists()) {
    const clientData = clientDoc.data();
    clientName = clientData.displayName || clientName;
  }
  
  // Create booking document
  const bookingData: Omit<MentorshipBooking, 'id'> = {
    mentorshipId: params.mentorshipId,
    clientUid: params.clientUid,
    creatorUid: mentorship.creatorUid,
    title: mentorship.title,
    format: mentorship.format as MentorshipFormat,
    status: mentorship.format === 'live' ? 'booked' : 'in_progress',
    price: mentorship.price,
    scheduledAt: params.scheduledAt ? Timestamp.fromDate(params.scheduledAt) : undefined,
    sessionGoal: params.sessionGoal || '',
    projectFiles: params.projectFiles || [],
    zoomLink: mentorship.format === 'live' ? mentorship.zoomLink : undefined,
    clientName,
    creatorName: mentorship.creatorName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    paymentStatus: 'pending'
  };
  
  const bookingRef = await addDoc(collection(firestore, 'bookings'), bookingData);
  return bookingRef.id;
}

export async function updateMentorshipBookingStatus(
  bookingId: string, 
  status: MentorshipBooking['status'], 
  deliverableUrl?: string,
  feedbackNotes?: string
): Promise<void> {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  const updates: any = {
    status,
    updatedAt: serverTimestamp()
  };
  
  if (status === 'completed') {
    updates.completedAt = serverTimestamp();
  }
  
  if (deliverableUrl) {
    updates.deliverableUrl = deliverableUrl;
  }
  
  if (feedbackNotes) {
    updates.feedbackNotes = feedbackNotes;
  }
  
  await updateDoc(bookingRef, updates);
}

export async function confirmMentorshipPayment(bookingId: string, stripeSessionId: string): Promise<void> {
  const bookingRef = doc(firestore, 'bookings', bookingId);
  await updateDoc(bookingRef, {
    paymentStatus: 'paid',
    stripeSessionId,
    updatedAt: serverTimestamp()
  });
}
