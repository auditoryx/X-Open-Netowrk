// src/lib/createBooking.ts
import getStripe from "./getStripe";

export async function createBooking(formData: any) {
  try {
    // Create the booking in Firestore via your own API route
    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok || !data.bookingId) {
      console.error("Booking creation failed", data);
      return { success: false };
    }

    // Create Stripe checkout session
    const stripeSession = await fetch("/api/create-checkout-session", {
      method: "POST",
      body: JSON.stringify({ bookingId: data.bookingId }),
    });

    const { sessionId } = await stripeSession.json();
    const stripe = await getStripe();
    if (stripe) {
      await stripe.redirectToCheckout({ sessionId });
    } else {
      console.error("Stripe initialization failed");
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error("Booking Error:", err);
    return { success: false };
  }
}
