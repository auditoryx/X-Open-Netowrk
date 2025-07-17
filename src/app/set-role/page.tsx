"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";

type Role = "artist" | "engineer" | "producer" | "videographer" | "studio";

export default function SetRolePage(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
    });
    return () => unsub();
  }, []);

  const assignRole = async (role: Role): Promise<void> => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), { role }, { merge: true });
    router.push(`/dashboard/${role}`);
  };

  if (!user) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="p-10 text-white space-y-4">
      <h1 className="text-2xl font-bold">Choose Your Role</h1>
      <div className="flex gap-4 flex-wrap">
        {(["artist", "engineer", "producer", "videographer", "studio"] as Role[]).map((r) => (
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
