'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2, Users, Calendar, BarChart3, Settings, 
  Zap, Globe, Shield, Star, ArrowRight, CheckCircle,
  Music, Headphones, Award, TrendingUp
} from 'lucide-react';

export default function EnterpriseLandingPage() {
  const features = [
    {
      icon: Building2,
      title: 'Label Dashboard',
      description: 'Executive-level overview with real-time metrics, artist performance, and revenue analytics.',
      href: '/dashboard/enterprise/label-dashboard',
      color: 'bg-blue-600'
    },
    {
      icon: Calendar,
      title: 'Bulk Booking System',
      description: 'Schedule multiple sessions efficiently with smart matching and conflict detection.',
      href: '/enterprise/bulk-booking',
      color: 'bg-green-600'
    },
    {
      icon: Users,
      title: 'Artist Roster Management',
      description: 'Comprehensive artist directory with performance tracking and bulk operations.',
      href: '/enterprise/artist-roster',
      color: 'bg-purple-600'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Business intelligence with revenue forecasting and market trend analysis.',
      href: '/enterprise/analytics',
      color: 'bg-yellow-600'
    },
    {
      icon: Globe,
      title: 'White-Label Solutions',
      description: 'Custom-branded platforms with your domain and branding.',
      href: '/enterprise/white-label',
      color: 'bg-red-600'
    },
    {
      icon: Settings,
      title: 'Enterprise API',
      description: 'RESTful API for seamless integration with your existing systems.',
      href: '/enterprise/api-docs',
      color: 'bg-gray-600'
    }
  ];

  const plans = [
    {
      name: 'Studio Pro',
      price: '$299',
      period: '/month',
      description: 'Perfect for growing studios',
      features: [
        'Up to 25 artists/creators',
        'Basic label dashboard',
        'Standard booking tools',
        'Email support',
        'Basic analytics'
      ],
      color: 'border-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Label Enterprise',
      price: '$799',
      period: '/month',
      description: 'For established record labels',
      features: [
        'Up to 100 artists/creators',
        'Advanced analytics & reporting',
        'Bulk booking system',
        'Priority support + account manager',
        'Revenue optimization tools'
      ],
      color: 'border-purple-600',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      popular: true
    },
    {
      name: 'White-Label',
      price: 'Custom',
      period: 'Pricing',
      description: 'Fully branded platform',
      features: [
        'Unlimited artists/creators',
        'Fully branded platform',
        'Custom features & integrations',
        'Dedicated infrastructure',
        '24/7 enterprise support'
      ],
      color: 'border-gold-600',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
    }
  ];

  const stats = [
    { label: 'Enterprise Clients', value: '50+', icon: Building2 },
    { label: 'Artists Managed', value: '10K+', icon: Music },
    { label: 'Bookings Processed', value: '100K+', icon: Calendar },
    { label: 'Revenue Tracked', value: '$50M+', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Enterprise Music <br />
              <span className="text-yellow-300">Management Platform</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Transform your record label, studio, or agency with AuditoryX's comprehensive 
              enterprise platform. Manage artists, bookings, and revenue at scale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard/enterprise/label-dashboard"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                View Demo Dashboard
              </Link>
              <Link
                href="/enterprise/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your music business at scale, 
              from artist rosters to revenue optimization.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  href={feature.href}
                  className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow group"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.color} rounded-lg mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-blue-600 font-medium">
                    Learn more
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-100 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Enterprise Pricing Plans
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that scales with your business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-lg p-8 ${plan.color} border-2 ${
                  plan.popular ? 'relative' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full text-white py-3 rounded-lg font-semibold transition-colors ${plan.buttonColor}`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Scale Your Music Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join leading record labels and studios using AuditoryX to manage their artists 
            and streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/enterprise/label-dashboard"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Try Demo Dashboard
            </Link>
            <Link
              href="/enterprise/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">AuditoryX Enterprise</h3>
              <p className="text-gray-400">
                The leading platform for music industry professionals.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Label Dashboard</li>
                <li>Bulk Booking</li>
                <li>Artist Management</li>
                <li>Analytics</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Record Labels</li>
                <li>Production Studios</li>
                <li>Entertainment Agencies</li>
                <li>Content Companies</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Contact Sales</li>
                <li>Enterprise Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AuditoryX Enterprise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
