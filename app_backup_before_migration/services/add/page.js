"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import ServiceForm from "../../../components/ServiceForm";

export default function AddServicePage() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    const u = auth.currentUser;
    if (u) {
      setUser(u);
      getDoc(doc(db, "users", u.email)).then((snap) => {
        if (snap.exists()) setRole(snap.data().role);
      });
    }
  }, []);

  if (!user) return <p className="text-white p-10">Loading...</p>;

  return (
    <main className="p-10 bg-black text-white">
      <ServiceForm userId={user.uid} role={role} />
    </main>
  );
}
