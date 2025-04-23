"use client";
import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useSession } from "next-auth/react";

export default function RoleToggle() {
  const { data: session } = useSession();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (!session?.user?.email) return;
      const docRef = doc(db, "users", session.user.email);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setRole(snap.data().role);
      }
    };
    fetchRole();
  }, [session]);

  const toggleRole = async () => {
    if (!session?.user?.email) return;
    const newRole = role === "client" ? "provider" : "client";
    await updateDoc(doc(db, "users", session.user.email), { role: newRole });
    setRole(newRole);
  };

  if (!role) return null;

  return (
    <div className="text-white mt-6">
      <p className="mb-2">
        Current Mode:{" "}
        <span className="font-bold text-blue-400 uppercase">{role}</span>
      </p>
      <button onClick={toggleRole} className="btn btn-secondary">
        Switch to {role === "client" ? "Provider" : "Client"} Mode
      </button>
    </div>
  );
}
