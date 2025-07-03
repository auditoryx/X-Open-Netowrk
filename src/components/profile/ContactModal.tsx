'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProgressiveOnboarding } from '@/components/onboarding/ProgressiveOnboarding';
import { messageService } from '@/lib/services/messageService';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
  creatorId: string;
}

export default function ContactModal({ isOpen, onClose, creatorName, creatorId }: ContactModalProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { trackAction } = useProgressiveOnboarding();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    
    try {
      // Create or get thread between current user and creator
      const threadId = await messageService.getOrCreateThread(
        user.uid,
        creatorId,
        creatorName,
        user.displayName || user.email || 'Unknown User'
      );

      // Send the message
      await messageService.sendMessage(
        threadId,
        user.uid,
        creatorId,
        message.trim()
      );

      toast.success('Message sent successfully!');
      onClose();
      setMessage('');
      
      // Navigate to the conversation
      router.push(`/dashboard/messages/${threadId}`);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
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
            disabled={sending || (!user && !message.trim())}
            className="w-full bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : (user ? 'Send Message' : 'Sign Up to Send Message')}
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
