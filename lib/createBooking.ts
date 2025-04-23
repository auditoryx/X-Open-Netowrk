import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { app } from "@/firebase/firebaseConfig";

const db = getFirestore(app);

export async function createBooking({
  providerId,
  serviceId,
  userId,
  date,
  time,
  message
}: {
  providerId: string;
  serviceId: string;
  userId: string;
  date: string;
  time: string;
  message: string;
}) {
  try {
    const bookingRef = collection(db, "bookings");
    const doc = await addDoc(bookingRef, {
      providerId,
      serviceId,
      userId,
      date,
      time,
      message,
      status: "pending",
      createdAt: Timestamp.now()
    });
    return { success: true, id: doc.id };
  } catch (err) {
    console.error("Booking error:", err);
    return { success: false, error: err };
  }
}
