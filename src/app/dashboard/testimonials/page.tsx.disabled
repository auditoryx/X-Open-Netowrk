'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import TestimonialManager from '@/components/testimonials/TestimonialManager';
import SocialProofWidgets from '@/components/social-proof/SocialProofWidgets';
import { 
  MessageSquare, 
  Award, 
  Users, 
  TrendingUp,
  Settings,
  Share2,
  Download
} from 'lucide-react';

export default function TestimonialDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'manage' | 'showcase' | 'analytics'>('manage');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600">Please sign in to access your testimonial dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Testimonial Management</h1>
          <p className="text-gray-600">
            Manage client testimonials, showcase social proof, and track your reputation
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('manage')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'manage'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Manage Testimonials
              </button>
              
              <button
                onClick={() => setActiveTab('showcase')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'showcase'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Award className="w-4 h-4 inline mr-2" />
                Social Proof Showcase
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Analytics & Insights
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'manage' && (
            <TestimonialManager creatorId={user.uid} />
          )}

          {activeTab === 'showcase' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Social Proof Widgets</h2>
                    <p className="text-gray-600">Customize how your testimonials and achievements are displayed</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      <Settings className="w-4 h-4 mr-2" />
                      Customize
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Profile
                    </button>
                  </div>
                </div>
                
                <SocialProofWidgets 
                  creatorId={user.uid} 
                  layout="grid"
                  maxWidgets={6}
                />
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Testimonial Analytics</h2>
                  <p className="text-gray-600">Track testimonial performance and reputation metrics</p>
                </div>
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </button>
              </div>
              
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics Coming Soon</h3>
                <p className="text-gray-600">
                  Detailed analytics for testimonial performance, response rates, and reputation tracking will be available soon.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
