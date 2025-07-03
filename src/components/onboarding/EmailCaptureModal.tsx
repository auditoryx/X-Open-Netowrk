'use client';

import React, { useState } from 'react';
import { X, Mail, Star, Users, Zap } from 'lucide-react';
import { useProgressiveOnboarding } from './ProgressiveOnboarding';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailCaptureModal({ isOpen, onClose }: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateState } = useProgressiveOnboarding();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    
    try {
      // Here you would typically send to your email service
      // For now, just simulate the capture
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateState({ emailCaptured: true });
      onClose();
      
      // Could show a success toast here
      console.log('Email captured:', email);
    } catch (error) {
      console.error('Failed to capture email:', error);
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
            <Star className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Discover Amazing Creators
          </h2>
          <p className="text-gray-300">
            Get early access to new creators, exclusive deals, and personalized recommendations
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <div className="w-2 h-2 bg-brand-500 rounded-full" />
            <span>First to know about featured creators</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <div className="w-2 h-2 bg-purple-500 rounded-full" />
            <span>Exclusive booking discounts</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Personalized creator recommendations</span>
          </div>
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
            disabled={loading || !email.trim()}
            className="w-full bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-all"
          >
            {loading ? 'Getting Started...' : 'Get Early Access'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          No spam, just the good stuff. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
