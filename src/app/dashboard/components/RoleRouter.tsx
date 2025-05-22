'use client';

import { useEffect } from 'react';
import RoleSwitcher from '@/components/dashboard/RoleSwitcher';
import { useRouter } from 'next/navigation';
import RoleSwitcher from '@/components/dashboard/RoleSwitcher';
import { useAuth } from '@/lib/hooks/useAuth';
import RoleSwitcher from '@/components/dashboard/RoleSwitcher';

export default function RoleRouter() {
  const { userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!userData?.role) return;
    router.replace(`/dashboard/${userData.role}`);
  }, [userData, router]);

  return <div className="p-6 text-white">Redirecting to your dashboard...</div>;
}
