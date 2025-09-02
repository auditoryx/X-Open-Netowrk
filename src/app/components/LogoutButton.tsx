'use client';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white mt-4">
      Logout
    </button>
  );
}
