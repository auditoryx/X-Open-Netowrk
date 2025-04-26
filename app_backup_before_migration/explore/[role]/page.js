"use client";
import { useEffect, useState } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

export default function ExploreRole({ params }) {
  const { role } = params;
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      const q = query(collection(db, "users"), where("role", "==", role));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    }
    fetchUsers();
  }, [role]);

  return (
    <main className="p-10 text-white">
      <h1 className="text-3xl font-bold capitalize mb-6">Explore {role}s</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="p-4 bg-gray-900 border border-gray-700 rounded">
            <h2 className="text-xl font-bold">{user.displayName || user.id}</h2>
            <p className="text-sm text-gray-400">{user.email}</p>
            <Link href={`/booking`} className="text-blue-400 underline mt-2 block">Book</Link>
          </div>
        ))}
      </div>
    </main>
  );
}
