'use client';

import React from 'react';
import { X, MessageSquare, Calendar, Star, Shield, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SignupPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'contact' | 'booking';
  creatorName?: string;
}

export default function SignupPromptModal({ 
  isOpen, 
  onClose, 
  action,
  creatorName 
}: SignupPromptModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const actionText = action === 'booking' ? 'book' : 'contact';
  const ActionIcon = action === 'booking' ? Calendar : MessageSquare;

  const handleSignup = () => {
    router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
  };

  const handleLogin = () => {
    router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-white/20 rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ActionIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Ready to {actionText} {creatorName}?
          </h2>
          <p className="text-gray-300">
            Create your free account to connect with amazing creators and unlock the full AuditoryX experience
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Shield className="w-5 h-5 text-green-500" />
            <span>Secure messaging and payments</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Star className="w-5 h-5 text-yellow-500" />
            <span>Save favorite creators</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Zap className="w-5 h-5 text-blue-500" />
            <span>Get instant booking confirmations</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSignup}
            className="w-full bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all"
          >
            Sign Up Free
          </button>
          
          <button
            onClick={handleLogin}
            className="w-full bg-neutral-800 hover:bg-neutral-700 border border-white/10 hover:border-white/20 text-white font-medium py-3 rounded-lg transition-all"
          >
            I Have an Account
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Free forever • No credit card required
        </p>
      </div>
    </div>
  );
}
