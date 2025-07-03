'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { testimonialService } from '@/lib/services/testimonialService';
import { socialProofService } from '@/lib/services/socialProofService';
import { portfolioThemeService } from '@/lib/services/portfolioThemeService';
import TestimonialManager from '@/components/testimonials/TestimonialManager';
import SocialProofWidgets from '@/components/social-proof/SocialProofWidgets';
import PortfolioThemeSelector from '@/components/portfolio/themes/PortfolioThemeSelector';
import { 
  Star, 
  Award, 
  Palette, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Shield,
  Settings,
  Download,
  Share2,
  Eye,
  Target,
  BarChart3,
  Crown,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreatorShowcasePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'testimonials' | 'social-proof' | 'themes'>('overview');
  const [socialProofProfile, setSocialProofProfile] = useState<any>(null);
  const [testimonialAnalytics, setTestimonialAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    loadShowcaseData();
  }, [user]);

  const loadShowcaseData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const [socialProof, testimonials] = await Promise.all([
        socialProofService.getSocialProofProfile(user.uid),
        testimonialService.getTestimonialAnalytics(user.uid)
      ]);

      setSocialProofProfile(socialProof);
      setTestimonialAnalytics(testimonials);
    } catch (error) {
      console.error('Error loading showcase data:', error);
      toast.error('Failed to load showcase data');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSelect = (theme: any) => {
    toast.success(`Applied ${theme.name} theme`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow animate-pulse">
            <div className="p-6 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg text-white p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Creator Showcase & Portfolio</h1>
              <p className="text-purple-100 text-lg">
                Manage your professional presence, testimonials, and portfolio themes
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{socialProofProfile?.trustScore || 0}</div>
                <div className="text-sm text-purple-200">Trust Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{testimonialAnalytics?.totalTestimonials || 0}</div>
                <div className="text-sm text-purple-200">Testimonials</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {socialProofProfile?.badges?.filter((b: any) => b.isEarned).length || 0}
                </div>
                <div className="text-sm text-purple-200">Badges Earned</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'testimonials'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Testimonials
            </button>
            <button
              onClick={() => setActiveTab('social-proof')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'social-proof'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Award className="w-4 h-4 inline mr-2" />
              Social Proof
            </button>
            <button
              onClick={() => setActiveTab('themes')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'themes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Palette className="w-4 h-4 inline mr-2" />
              Portfolio Themes
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Trust Score</p>
                      <p className="text-2xl font-bold text-gray-900">{socialProofProfile?.trustScore || 0}/100</p>
                    </div>
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${socialProofProfile?.trustScore || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Testimonials</p>
                      <p className="text-2xl font-bold text-gray-900">{testimonialAnalytics?.totalTestimonials || 0}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {testimonialAnalytics?.averageRating?.toFixed(1) || 0} avg rating
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Badges Earned</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {socialProofProfile?.badges?.filter((b: any) => b.isEarned).length || 0}
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    of {socialProofProfile?.badges?.length || 0} available
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Response Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {testimonialAnalytics?.responseRate?.toFixed(1) || 0}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Client testimonial requests
                  </p>
                </div>
              </div>

              {/* Social Proof Widgets Preview */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Social Proof Widgets Preview</h3>
                  <button
                    onClick={() => setActiveTab('social-proof')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Customize →
                  </button>
                </div>
                
                {user?.uid && (
                  <SocialProofWidgets 
                    creatorId={user.uid} 
                    layout="grid" 
                    maxWidgets={4} 
                  />
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Request Testimonials</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Send testimonial requests to your clients
                    </p>
                    <button
                      onClick={() => setActiveTab('testimonials')}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Manage Testimonials
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-center">
                    <Palette className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Customize Portfolio</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose from professional portfolio themes
                    </p>
                    <button
                      onClick={() => setActiveTab('themes')}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Browse Themes
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="text-center">
                    <Award className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Earn More Badges</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Complete projects to unlock achievements
                    </p>
                    <button
                      onClick={() => setActiveTab('social-proof')}
                      className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      View Progress
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'testimonials' && user?.uid && (
            <TestimonialManager creatorId={user.uid} />
          )}

          {activeTab === 'social-proof' && user?.uid && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Social Proof & Trust Elements</h3>
                <SocialProofWidgets 
                  creatorId={user.uid} 
                  layout="vertical" 
                  maxWidgets={6} 
                />
              </div>
            </div>
          )}

          {activeTab === 'themes' && (
            <div className="space-y-8">
              <PortfolioThemeSelector
                currentThemeId="minimal-grid"
                onThemeSelect={handleThemeSelect}
                showCustomization={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
