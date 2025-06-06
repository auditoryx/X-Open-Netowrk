'use client';

import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { useEffect, useState } from 'react';
import { submitSupportMessage } from '@/lib/firestore/support/submitSupportMessage';
import { onAuthStateChanged } from 'firebase/auth';

export default function BannedNotice() {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userInfo, setUserInfo] = useState<{ uid: string; email: string } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserInfo({ uid: user.uid, email: user.email || '' });
      }
    });
    return () => unsub();
  }, []);

  const handleSubmit = async () => {
    if (!message.trim() || !userInfo) return;
    setSubmitting(true);

    const res = await submitSupportMessage({
      uid: userInfo.uid,
      email: userInfo.email,
      message,
    });

    setSubmitting(false);

    if (res.success) {
      setSubmitted(true);
      setMessage('');
    } else {
      alert('There was an error. Try again.');
    }
  };

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
          className="btn btn-primary bg-white text-black hover:bg-gray-200"
        >
          Sign Out
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-secondary"
        >
          Contact Support
        </button>
      </div>

      {/* 🪟 Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded max-w-md w-full space-y-4">
            <h2 className="text-xl font-bold">Contact Support</h2>

            {submitted ? (
              <p className="text-green-600 text-sm">✅ Message submitted. We’ll review it soon.</p>
            ) : (
              <>
                <textarea
                  placeholder="Explain your situation..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="textarea-base text-black"
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
                    onClick={handleSubmit}
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
