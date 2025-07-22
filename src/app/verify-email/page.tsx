import { Metadata } from 'next';
import EmailVerificationPrompt from '@/components/auth/EmailVerificationPrompt';

export const metadata: Metadata = {
  title: 'Verify Email | X-Open-Network',
  description: 'Verify your email address to access all X-Open-Network features.',
};

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <EmailVerificationPrompt />
      </div>
    </div>
  );
}