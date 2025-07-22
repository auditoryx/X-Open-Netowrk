import { Metadata } from 'next';
import { Suspense } from 'react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password | X-Open-Network',
  description: 'Set your new password to regain access to your X-Open-Network account.',
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg border border-gray-200">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}