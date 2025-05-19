'use client';

import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { useState } from 'react';

export default function BannedNotice() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold mb-4">🚫 You’ve Been Banned</h1>
      <p className="mb-6 max-w-md">
        Your account has been restricted due to violations of our terms.
        If you believe this was a mistake, you can reach out below.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => signOut(auth)}
          className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
        >
          Sign Out
        </button>

        <button
          onClick={() => setShowModal(true)}
          className="border border-white px-4 py-2 rounded hover:bg-white hover:text-black"
        >
          Contact Support
        </button>
      </div>

      {/* 📩 Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded max-w-md w-full space-y-4">
            <h2 className="text-xl font-bold">Contact Support</h2>
            <p className="text-sm text-gray-600">
              Email us at{' '}
              <a
                href="mailto:support@auditoryx.com"
                className="text-blue-600 underline"
              >
                support@auditoryx.com
              </a>{' '}
              or describe your issue below.
            </p>
            <textarea
              placeholder="Write your message here..."
              className="w-full p-2 border rounded text-black"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="text-sm text-gray-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('📨 Message feature coming soon!');
                  setShowModal(false);
                }}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
