import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface Props {
  params: { uid: string };
}

export default async function PublicProfile({ params }: Props) {
  const ref = doc(db, 'users', params.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return <div className="p-6 text-red-500">Profile not found.</div>;
  }

  const data = snap.data();

  return (
    <div className="p-6 space-y-2 max-w-xl">
      <h1 className="text-3xl font-bold">{data.name}</h1>
      <p className="text-gray-600 italic">{data.role}</p>
      <p>{data.bio}</p>
      <p><strong>Instagram:</strong> @{data.instagram}</p>
      <p><strong>Availability:</strong> {data.availability}</p>
    </div>
  );
}

import Link from 'next/link';

...

  return (
    <div className="p-6 space-y-2 max-w-xl">
      <h1 className="text-3xl font-bold">{data.name}</h1>
      <p className="text-gray-600 italic">{data.role}</p>
      <p>{data.bio}</p>
      <p><strong>Instagram:</strong> @{data.instagram}</p>
      <p><strong>Availability:</strong> {data.availability}</p>

      <Link
        href={`/book/${params.uid}`}
        className="inline-block mt-4 px-4 py-2 bg-black text-white rounded"
      >
        Request Booking
      </Link>
    </div>
  );
}
