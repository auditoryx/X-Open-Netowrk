import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore"
import { app } from "../firebase/firebaseConfig"
import { getStripe } from "@/lib/utils/stripe"
import { logger } from "./logger"

const db = getFirestore(app)

export async function createBooking({
  providerId,
  serviceId,
  userId,
  date,
  time,
  message
}: {
  providerId: string
  serviceId: string
  userId: string
  date: string
  time: string
  message: string
}) {
  try {
    const bookingRef = collection(db, "bookings")
    const docRef = await addDoc(bookingRef, {
      providerId,
      serviceId,
      userId,
      date,
      time,
      message,
      status: "pending",
      createdAt: Timestamp.now()
    })

    const bookingId = docRef.id

    // Store contract info too (optional)
    const contractRef = collection(db, "contracts")
    await addDoc(contractRef, {
      clientId: userId,
      providerId,
      bookingId,
      status: "pending",
      createdAt: Timestamp.now()
    })

    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId })
    })

    const { sessionId } = await res.json()
    const stripe = await getStripe()
    if (!stripe) {
      throw new Error('Stripe failed to initialize')
    }
    await stripe.redirectToCheckout({ sessionId })

    return { success: true, id: bookingId }
  } catch (err) {
    logger.error("Booking error:", err)
    return { success: false, error: err }
  }
}
