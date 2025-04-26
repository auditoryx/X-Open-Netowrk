import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// Store a message in Firestore
export const addMessage = async (toUserId, messageText, fromUserId = "admin@auditoryx.com") => {
  try {
    await addDoc(collection(db, "users", toUserId, "messages"), {
      from: fromUserId,
      message: messageText,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error("Error sending message:", err);
  }
};

// Store a booking record
export const addBooking = async (userId, serviceId, details) => {
  try {
    await addDoc(collection(db, "users", userId, "bookings"), {
      serviceId,
      ...details,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error("Error creating booking:", err);
  }
};
