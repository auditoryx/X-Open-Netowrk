"use client";

import React from "react";
import Link from "next/link";

export default function ApplyPage() {
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-6">Join AuditoryX</h1>
      <p className="text-lg text-gray-400 mb-10">Choose your role and start offering or booking services.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {["Artist", "Producer", "Engineer", "Videographer", "Designer", "Studio", "Venue"].map((role) => (
          <Link key={role} href={`/apply/${role.toLowerCase()}`}>
            <div className="border border-gray-700 p-6 rounded-lg hover:bg-gray-900 transition-all cursor-pointer text-center">
              <h2 className="text-2xl font-semibold">{role}</h2>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
