'use client';
import RoleSelectCard from '@/components/onboarding/RoleSelectCard';
import { roles } from '@/utils/roles';

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
            <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-bold mb-4 text-center">Apply to AuditoryX</h1>
        <p className="text-lg text-gray-400 mb-10 text-center">
          Choose your creator role to begin your application.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <RoleSelectCard key={role.value} role={role} />
          ))}
        </div>
      </div>
    </div>
  );
}
