'use client';

import Link from 'next/link';
import { CheckCircle, Clock, Users, Star, TrendingUp, Shield } from 'lucide-react';

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Shield className="h-16 w-16 text-blue-500" />
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Get <span className="text-blue-500">Verified</span> on AuditoryX
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join the ranks of trusted creators. Verification increases your visibility, 
              builds trust with clients, and unlocks exclusive features.
            </p>
            <Link 
              href="/apply/provider"
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Apply for Verification
            </Link>
          </div>
        </div>
      </div>

      {/* What is Verification Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">What is Verification?</h2>
            <p className="text-gray-300 text-lg mb-6">
              Verification is our way of confirming that you're a legitimate professional creator. 
              It's like Spotify's verified artist badge – it shows clients that you're the real deal.
            </p>
            <p className="text-gray-300 text-lg">
              The blue verification badge appears next to your name across the platform, 
              giving you instant credibility and helping you stand out from the crowd.
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full mr-4"></div>
              <div>
                <div className="flex items-center">
                  <span className="font-semibold">Producer Name</span>
                  <CheckCircle className="h-5 w-5 text-blue-500 ml-2" />
                </div>
                <span className="text-gray-400 text-sm">Verified Producer</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              This is how your profile will appear to clients once verified.
            </p>
          </div>
        </div>
      </div>

      {/* Who Should Apply Section */}
      <div className="bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Who Should Apply?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black rounded-lg p-6 border border-gray-800">
              <Users className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Professional Creators</h3>
              <p className="text-gray-300">
                Producers, engineers, artists, and other music professionals with 
                a proven track record and professional portfolio.
              </p>
            </div>
            <div className="bg-black rounded-lg p-6 border border-gray-800">
              <TrendingUp className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Established Profiles</h3>
              <p className="text-gray-300">
                Creators with external presence on platforms like Spotify, Instagram, 
                SoundCloud, or other professional networks.
              </p>
            </div>
            <div className="bg-black rounded-lg p-6 border border-gray-800">
              <Star className="h-8 w-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Quality Focused</h3>
              <p className="text-gray-300">
                Those committed to providing high-quality services and building 
                long-term relationships with clients.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Benefits of Verification</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Trust & Credibility</h3>
            <p className="text-gray-300">
              The blue badge instantly signals to clients that you're verified and trustworthy.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Increased Visibility</h3>
            <p className="text-gray-300">
              Verified profiles appear higher in search results and explore feeds.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">XP Bonus</h3>
            <p className="text-gray-300">
              Get 500 XP points instantly upon verification approval.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Priority Support</h3>
            <p className="text-gray-300">
              Access to priority customer support and direct feedback channels.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Featured Placement</h3>
            <p className="text-gray-300">
              Appear in the verified creators directory and featured sections.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Exclusive Tools</h3>
            <p className="text-gray-300">
              Access to verified-only analytics, features, and promotional opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* How to Apply Section */}
      <div className="bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How to Apply</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-white font-semibold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Complete Your Profile</h3>
                  <p className="text-gray-300">
                    Make sure your profile is complete with portfolio links, bio, and examples of your work.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-white font-semibold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Provide External Links</h3>
                  <p className="text-gray-300">
                    Include links to your professional presence on Spotify, Instagram, SoundCloud, 
                    or other platforms that verify your identity and work.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-white font-semibold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Submit Application</h3>
                  <p className="text-gray-300">
                    Fill out the verification form explaining why you should be verified 
                    and submit your application for review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">What Happens After Submission</h2>
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-600"></div>
            
            <div className="space-y-12">
              <div className="flex items-center">
                <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mr-6 relative z-10">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Application Submitted</h3>
                  <p className="text-gray-300">
                    Your application is received and enters our review queue. 
                    You'll get a confirmation message immediately.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-yellow-600 rounded-full w-16 h-16 flex items-center justify-center mr-6 relative z-10">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Under Review</h3>
                  <p className="text-gray-300">
                    Our team reviews your application, portfolio, and external links. 
                    This typically takes 2-3 business days.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mr-6 relative z-10">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Get Your Badge</h3>
                  <p className="text-gray-300">
                    If approved, you'll receive your verification badge, 500 XP bonus, 
                    and access to exclusive verified creator tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Verified?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of verified creators who are building trust and growing their business on AuditoryX.
          </p>
          <div className="space-x-4">
            <Link 
              href="/apply/provider"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Application
            </Link>
            <Link 
              href="/verified"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              Browse Verified Creators
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}