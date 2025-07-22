'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const resendVerificationSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

type ResendVerificationForm = z.infer<typeof resendVerificationSchema>;

interface EmailVerificationPromptProps {
  defaultEmail?: string;
}

export default function EmailVerificationPrompt({ defaultEmail = '' }: EmailVerificationPromptProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<ResendVerificationForm>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: defaultEmail
    }
  });

  const onSubmit = async (data: ResendVerificationForm) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        setError('email', { message: result.error || 'Failed to send verification email' });
        return;
      }

      if (result.alreadyVerified) {
        setError('email', { message: 'This email address is already verified' });
        return;
      }

      setEmailSent(true);
    } catch (error) {
      setError('email', { message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verification Email Sent
          </h2>
          
          <p className="text-gray-600 mb-6">
            We've sent a verification link to your email. Click the link in the email to verify your account.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => setEmailSent(false)}
              className="block w-full btn btn-secondary text-center"
            >
              Send to Different Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg border border-gray-200">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600">
          Please verify your email address to access all features and secure your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className={`input w-full ${errors.email ? 'border-red-500' : ''}`}
            placeholder="Enter your email address"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn btn-primary w-full ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Sending...' : 'Send Verification Email'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Already verified your email? 
          <a 
            href="/login" 
            className="ml-1 text-blue-600 hover:text-blue-500"
          >
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}