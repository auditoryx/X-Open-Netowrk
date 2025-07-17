"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function DashboardHeader(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email || "");
      getDoc(doc(db, "users", user.email || "")).then((snap) => {
        if (snap.exists()) setRole(snap.data().role || "");
      });
    }
  }, []);

  const handleLogout = async (): Promise<void> => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-black text-white">
      <div>
        <h2 className="text-xl font-bold">Dashboard</h2>
        {email && <p className="text-sm text-gray-400">{email} — {role}</p>}
      </div>
      <button onClick={handleLogout} className="btn btn-secondary">
        Logout
      </button>
    </header>
  );
}
