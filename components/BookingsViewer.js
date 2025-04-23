"use client";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { useSession } from "next-auth/react";

export default function BookingsViewer() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!session?.user?.email) return;
    const q = query(
      collection(db, "booking_requests"),
      where("providerEmail", "==", session.user.email)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookings(requests);
    });
    return () => unsubscribe();
  }, [session]);

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "booking_requests", id), { status });
    } catch (err) {
      console.error("Failed to update booking:", err);
    }
  };

  if (!session?.user?.email) return <p className="text-white">Please login to view requests.</p>;

  return (
    <div className="text-white max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Your Booking Requests</h2>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        bookings.map((req) => (
          <div key={req.id} className="p-4 bg-gray-800 rounded-lg border border-gray-600">
            <p><strong>Date:</strong> {new Date(req.datetime).toLocaleString()}</p>
            <p><strong>Notes:</strong> {req.notes}</p>
            <p><strong>Status:</strong> {req.status}</p>
            {req.status === "pending" && (
              <div className="mt-2 flex gap-3">
                <button onClick={() => updateStatus(req.id, "accepted")} className="btn btn-primary">Accept</button>
                <button onClick={() => updateStatus(req.id, "declined")} className="btn btn-secondary">Decline</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
