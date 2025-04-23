"use client";
import { useEffect, useState } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import SendServiceRequest from "../../../components/SendServiceRequest";

export default function UserProfile({ params }) {
  const { id } = params;
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const snap = await getDoc(doc(db, "users", id));
      if (snap.exists()) setUser(snap.data());
    };
    fetchUser();
  }, [id]);

  if (!user) return <p className="text-white p-10">Loading...</p>;

  return (
    <main className="min-h-screen bg-black text-white p-10 space-y-6">
      <div className="border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold">{user.displayName || id}</h1>
        <p className="text-gray-400">{user.email}</p>
        <p className="capitalize text-blue-400">{user.role}</p>
        <p className="mt-4">{user.bio || "No bio provided."}</p>
      </div>

      <SendServiceRequest recipientId={id} recipientRole={user.role} />
    </main>
  );
}
