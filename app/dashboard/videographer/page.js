<<<<<<< HEAD
export default function VideographerDashboard() {
  return <div style={{ padding: '2rem' }}><h1>🎥 Videographer Dashboard</h1><p>Welcome, videographer!</p></div>;
=======
"use client";
import { useEffect, useState } from "react";
import { auth } from "../../../firebase/firebaseConfig";
import { getUserRole } from "../../../lib/getUserRole";
import { onAuthStateChanged } from "firebase/auth";

export default function VideographerDashboard() {
  const [access, setAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return setLoading(false);
      const role = await getUserRole(user.uid);
      if (role === "videographer") setAccess(true);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="text-white p-10">Loading...</div>;
  if (!access) return <div className="text-white p-10">Access Denied</div>;

  return <div className="p-10 text-white text-2xl">Videographer Dashboard</div>;
>>>>>>> 3126253 (chore: finalize migration prep for rebase)
}
