'use client';

import { signOut } from 'next-auth/react';

export default function BannedNotice() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">🚫 Access Denied</h1>
      <p className="mb-6 text-lg max-w-md">
        Your account has been banned from the AuditoryX platform. If you believe this is a mistake, please contact support.
      </p>
      <button
        onClick={() => signOut()}
        className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition"
      >
        Sign Out
      </button>
    </div>
  );
}
