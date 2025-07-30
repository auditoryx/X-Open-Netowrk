"use client";
import { useEffect, useState } from "react";
import { auth, db, isFirebaseConfigured } from "../../firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";

type Role = "artist" | "engineer" | "producer" | "videographer" | "studio";

export default function SetRolePage(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured, role assignment unavailable');
      setFirebaseError('Authentication service unavailable');
      setLoading(false);
      return;
    }

    try {
      const unsub = onAuthStateChanged(auth, (u) => {
        if (u) {
          setUser(u);
        }
        setLoading(false);
      });
      return () => unsub();
    } catch (error) {
      console.error('Failed to set up auth listener:', error);
      setFirebaseError('Authentication service error');
      setLoading(false);
    }
  }, []);

  const assignRole = async (role: Role): Promise<void> => {
    if (!user) return;
    
    if (!isFirebaseConfigured()) {
      setFirebaseError('Cannot assign role - database service unavailable');
      return;
    }

    try {
      await setDoc(doc(db, "users", user.uid), { role }, { merge: true });
      router.push(`/dashboard/${role}`);
    } catch (error) {
      console.error('Failed to assign role:', error);
      setFirebaseError('Failed to assign role. Please try again.');
    }
  };

  if (loading) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="p-10 text-white space-y-4">
      {firebaseError && (
        <div className="bg-red-900 text-red-100 p-4 rounded-lg mb-4">
          ⚠️ {firebaseError}
        </div>
      )}
      
      {!isFirebaseConfigured() && (
        <div className="bg-blue-900 text-blue-100 p-4 rounded-lg mb-4">
          ℹ️ Role assignment unavailable - authentication service offline
        </div>
      )}

      {!user && !firebaseError && (
        <div className="bg-yellow-900 text-yellow-100 p-4 rounded-lg mb-4">
          Please sign in to set your role
        </div>
      )}

      <h1 className="text-2xl font-bold">Choose Your Role</h1>
      <div className="flex gap-4 flex-wrap">
        {(["artist", "engineer", "producer", "videographer", "studio"] as Role[]).map((r) => (
          <button
            key={r}
            className="btn btn-primary disabled:opacity-50"
            onClick={() => assignRole(r)}
            disabled={!user || !isFirebaseConfigured()}
            data-testid={r === "artist" ? "smoke" : undefined}
          >
            I am a {r}
          </button>
        ))}
      </div>
    </div>
  );
}
