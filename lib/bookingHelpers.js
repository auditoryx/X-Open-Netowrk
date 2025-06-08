import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

// Save a new booking request
export async function sendBookingRequest({ buyerId, providerId, date, time, notes }) {
  const docRef = await addDoc(collection(db, "bookingRequests"), {
    buyerId,
    providerId,
    date,
    time,
    notes,
    status: "pending",
    createdAt: Date.now()
  });

  return docRef.id;
}

// Get incoming requests for a user
export async function getIncomingRequests(userId) {
  const q = query(collection(db, "bookingRequests"), where("providerId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
