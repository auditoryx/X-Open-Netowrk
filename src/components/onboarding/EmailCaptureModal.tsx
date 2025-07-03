'use client';

import React, { useState } from 'react';
import { X, Mail, Star, Users, Zap, Heart, Bell } from 'lucide-react';
import { useProgressiveOnboarding } from './ProgressiveOnboarding';
import toast from 'react-hot-toast';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'profile_views' | 'save_attempt' | 'exit_intent' | 'creator_notification';
  creatorName?: string;
}

export default function EmailCaptureModal({ 
  isOpen, 
  onClose, 
  trigger = 'profile_views',
  creatorName 
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateState, state, captureEmail } = useProgressiveOnboarding();

  if (!isOpen) return null;

  // Dynamic content based on trigger
  const getContent = () => {
    switch (trigger) {
      case 'creator_notification':
        return {
          title: `Never miss ${creatorName}'s latest`,
          subtitle: `Get notified when ${creatorName} posts new beats, opens booking slots, or drops exclusive content`,
          benefits: [
            { icon: '🔔', text: `${creatorName}'s new releases` },
            { icon: '⚡', text: 'Early booking access' },
            { icon: '💎', text: 'Exclusive content drops' }
          ]
        };
      case 'save_attempt':
        return {
          title: 'Save your favorites',
          subtitle: 'Create an account to save creators, track your bookings, and get personalized recommendations',
          benefits: [
            { icon: '❤️', text: 'Save unlimited creators' },
            { icon: '📊', text: 'Track booking history' },
            { icon: '🎯', text: 'Personalized recommendations' }
          ]
        };
      case 'exit_intent':
        return {
          title: 'Wait! Don\'t miss out',
          subtitle: 'Get exclusive deals and be first to know about new creators joining AuditoryX',
          benefits: [
            { icon: '💰', text: 'Exclusive booking discounts' },
            { icon: '🌟', text: 'New creator alerts' },
            { icon: '⚡', text: 'Priority booking access' }
          ]
        };
      default:
        return {
          title: 'Discover Amazing Creators',
          subtitle: 'Get early access to new creators, exclusive deals, and personalized recommendations',
          benefits: [
            { icon: '🌟', text: 'First to know about featured creators' },
            { icon: '💰', text: 'Exclusive booking discounts' },
            { icon: '🎯', text: 'Personalized creator recommendations' }
          ]
        };
    }
  };

  const content = getContent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    
    try {
      const result = await captureEmail(
        email.trim(),
        trigger === 'creator_notification' ? 'profile' : 'explore'
      );

      if (result.success) {
        toast.success(
          trigger === 'creator_notification' 
            ? `✅ You'll be notified about ${creatorName}'s updates!`
            : '✅ Welcome to AuditoryX! Check your email for exclusive deals.'
        );
        onClose();
      } else {
        toast.error(result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Failed to capture email:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
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
            {trigger === 'creator_notification' ? <Bell className="w-8 h-8 text-white" /> : <Star className="w-8 h-8 text-white" />}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {content.title}
          </h2>
          <p className="text-gray-300">
            {content.subtitle}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {content.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3 text-sm text-gray-300">
              <span className="text-lg">{benefit.icon}</span>
              <span>{benefit.text}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brand-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-all"
          >
            {isLoading ? 'Getting Started...' : 'Get Early Access'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          No spam, just the good stuff. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
