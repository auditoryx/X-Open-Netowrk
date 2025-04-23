"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import AdminNavbar from "../components/AdminNavbar";

interface Application {
  id: string;
  name: string;
  email: string;
  experience: string;
  role: string;
}

const ADMIN_UID = "MGBCYJHGVHXHXRXmUv8f64WCQuB2"; // zenji@auditoryx.com

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }

      if (user.uid === ADMIN_UID) {
        setIsAdmin(true);
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchApplications = async () => {
      const snapshot = await getDocs(collection(db, "applications"));
      const apps = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Application, "id">),
      }));
      setApplications(apps);
      setLoading(false);
    };
    fetchApplications();
  }, [isAdmin]);

  if (!isAdmin) {
    return <main className="p-10 text-white">Checking permissions...</main>;
  }

  return (
    <>
      <AdminNavbar />
      <main className="min-h-screen bg-black text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Applications Dashboard</h1>
        {loading ? (
          <p>Loading...</p>
        ) : applications.length === 0 ? (
          <p className="text-gray-500">No applications submitted yet.</p>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => (
              <div key={app.id} className="border border-gray-700 p-4 rounded bg-gray-900">
                <h2 className="text-xl font-semibold">{app.name}</h2>
                <p className="text-sm text-gray-400">{app.email}</p>
                <p className="text-sm text-blue-400">Role: {app.role}</p>
                <p className="mt-2 text-gray-300 whitespace-pre-line">{app.experience}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
