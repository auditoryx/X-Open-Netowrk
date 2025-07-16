import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

interface MessageData {
  from: string;
  message: string;
  timestamp: any;
}

interface BookingData {
  serviceId: string;
  timestamp: any;
  [key: string]: any;
}

// Store a message in Firestore
export const addMessage = async (
  toUserId: string, 
  messageText: string, 
  fromUserId: string = "admin@auditoryx.com"
): Promise<void> => {
  try {
    const messageData: MessageData = {
      from: fromUserId,
      message: messageText,
      timestamp: serverTimestamp(),
    };
    
    await addDoc(collection(db, "users", toUserId, "messages"), messageData);
  } catch (err) {
    console.error("Error sending message:", err);
  }
};

// Store a booking record
export const addBooking = async (
  userId: string, 
  serviceId: string, 
  details: Record<string, any>
): Promise<void> => {
  try {
    const bookingData: BookingData = {
      serviceId,
      ...details,
      timestamp: serverTimestamp(),
    };
    
    await addDoc(collection(db, "users", userId, "bookings"), bookingData);
  } catch (err) {
    console.error("Error creating booking:", err);
  }
};
