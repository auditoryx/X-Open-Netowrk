import { firestore } from '@/lib/firebase/firebaseAdmin';
import { Booking } from '@/lib/types/Booking';
import { generateRevSplitContract } from '@/lib/pdf/generateRevSplitContract';
import { uploadContract } from '@/lib/storage/uploadContract';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

async function getUserNames(uids: string[]): Promise<string[]> {
    const userDocs = await Promise.all(uids.map(uid => getDoc(doc(firestore, 'users', uid))));
    return userDocs.map(doc => doc.exists() ? doc.data().displayName : 'Unknown User');
}

export async function createBookingWithContract(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'contractUrl'>): Promise<string> {
  const bookingCollection = collection(firestore, 'bookings');

  const newBookingRef = await addDoc(bookingCollection, {
    ...bookingData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const bookingId = newBookingRef.id;

  // Fetch user names for the contract
  const creatorName = (await getUserNames([bookingData.creatorUid]))[0];
  const clientNames = await getUserNames(bookingData.clientUids);

  // Generate PDF contract
  const contractPdf = await generateRevSplitContract(
    { ...bookingData, id: bookingId, createdAt: new Date(), updatedAt: new Date() } as Booking, // This is a temporary object for generation
    creatorName,
    clientNames
  );

  // Upload contract to storage
  const contractUrl = await uploadContract(bookingId, contractPdf);

  // Update booking with contract URL
  await updateDoc(newBookingRef, { contractUrl, updatedAt: serverTimestamp() });

  return bookingId;
}
