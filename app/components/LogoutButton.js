'use client';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/auth/login');
  };

  return (
    <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white mt-4">
      Logout
    </button>
  );
}
