"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

export default function SetRolePage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
    });
    return () => unsub();
  }, []);

  const assignRole = async (role) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), { role }, { merge: true });
    router.push(`/dashboard/${role}`);
  };

  if (!user) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="p-10 text-white space-y-4">
      <h1 className="text-2xl font-bold">Choose Your Role</h1>
      <div className="flex gap-4 flex-wrap">
        {["artist", "engineer", "producer", "videographer", "studio"].map((r) => (
          <button
            key={r}
            className="btn btn-primary"
            onClick={() => assignRole(r)}
          >
            I am a {r}
          </button>
        ))}
      </div>
    </div>
  );
}
