'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

type Props = {
  userId: string;
};

export default function IDVerificationForm({ userId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || loading) return;

    setLoading(true);

    try {
      const storage = getStorage();
      const fileRef = ref(storage, `id-verifications/${userId}/${file.name}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      await updateDoc(doc(db, 'users', userId), {
        idVerification: {
          status: 'pending',
          fileUrl,
          submittedAt: new Date().toISOString(),
        },
      });

      toast.success('ID submitted successfully!');
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <p className="text-green-600 font-semibold">
        ✅ Your ID has been submitted and is under review.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded space-y-4 bg-white text-black">
      <h3 className="font-bold text-lg">Verify Your Identity</h3>

      <label htmlFor="id-file" className="text-sm font-medium block">
        Upload Government-Issued ID
      </label>
      <input
        type="file"
        id="id-file"
        accept="image/*,application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        disabled={loading}
        className="w-full border p-2 rounded"
      />

      <button
        type="submit"
        disabled={!file || loading}
        className={`w-full py-2 px-4 rounded font-medium text-white transition ${
          loading
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-black hover:bg-white hover:text-black border border-black'
        }`}
        aria-label="Submit ID for verification"
      >
        {loading ? 'Submitting...' : 'Submit Verification'}
      </button>
    </form>
  );
}
// Usage example
// <IDVerificationForm userId="user123" />
// // <IDVerificationForm userId={userId} />
// // <IDVerificationForm userId={user?.uid} />
// // <IDVerificationForm userId={userId} />
// // <IDVerificationForm userId={user?.uid} />
// // <IDVerificationForm userId={userId} />
// // <IDVerificationForm userId={user?.uid} />
// // <IDVerificationForm userId={userId} />
// // <IDVerificationForm userId={user?.uid} />