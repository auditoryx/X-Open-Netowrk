'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProgressiveOnboarding } from '@/components/onboarding/ProgressiveOnboarding';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
  creatorId: string;
}

export default function ContactModal({ isOpen, onClose, creatorName, creatorId }: ContactModalProps) {
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const { trackAction } = useProgressiveOnboarding();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      // Track contact attempt for analytics
      trackAction('contact_attempt');
      
      // Trigger signup prompt
      window.dispatchEvent(new CustomEvent('show-signup-prompt', {
        detail: { action: 'contact', creatorName }
      }));
      
      onClose();
      return;
    }

    // If user is logged in, handle the actual message sending
    console.log('Sending message to:', creatorId, 'Message:', message);
    // TODO: Implement actual message sending logic
    onClose();
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
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Contact {creatorName}
          </h2>
          {!user && (
            <p className="text-gray-300">
              Sign up to send messages and start collaborating
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={user ? `Tell ${creatorName} about your project...` : "Preview: Tell them about your project..."}
              className="w-full p-3 bg-neutral-800 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brand-500 h-32 resize-none"
              disabled={!user}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {user ? 'Send Message' : 'Sign Up to Send Message'}
          </button>
        </form>

        {!user && (
          <p className="text-xs text-gray-500 text-center mt-4">
            Free account • Direct messaging • Secure platform
          </p>
        )}
      </div>
    </div>
  );
}
