"use client";

import { useRouter } from "next/navigation";

export default function AdminNavbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/auth");
  };

  return (
    <nav className="bg-gray-950 border-b border-gray-800 px-6 py-4 text-white flex justify-between items-center">
      <h1 className="text-xl font-bold">AuditoryX Admin</h1>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
      >
        Logout
      </button>
    </nav>
  );
}
