import React, { useState } from 'react';
import { SplitBookingForm } from '@/src/components/booking/SplitBookingForm';
import { SplitBookingsList } from '@/src/components/dashboard/SplitBookingsList';
import { TalentRequestModal } from '@/src/components/booking/TalentRequestModal';
import { Users, Calendar, Music, DollarSign, Bell, ArrowRight } from 'lucide-react';

// Mock data for demonstration
const mockStudios = [
  {
    id: 'studio-1',
    name: 'Abbey Road Studios',
    location: 'London, UK',
    hourlyRate: 500,
    description: 'World-renowned recording studio with vintage equipment'
  },
  {
    id: 'studio-2',
    name: 'Electric Lady Studios',
    location: 'New York, NY',
    hourlyRate: 350,
    description: 'Historic studio in Greenwich Village'
  },
  {
    id: 'studio-3',
    name: 'Sunset Sound',
    location: 'Los Angeles, CA',
    hourlyRate: 400,
    description: 'Legendary recording studio in Hollywood'
  }
];

export default function SplitBookingDemoPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'manage' | 'notifications'>('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [talentModalOpen, setTalentModalOpen] = useState(false);

  const features = [
    {
      icon: Users,
      title: 'Dual Client Booking',
      description: 'Two users can co-book the same studio session and split the cost'
    },
    {
      icon: DollarSign,
      title: 'Flexible Cost Splitting',
      description: 'Customize the cost ratio (50/50, 70/30, etc.) with automatic payment calculation'
    },
    {
      icon: Music,
      title: 'Talent Requests',
      description: 'Invite specific artists, producers, or engineers to join your session'
    },
    {
      icon: Bell,
      title: 'Real-time Updates',
      description: 'Get instant notifications for invites, confirmations, and talent responses'
    },
    {
      icon: Calendar,
      title: 'Session Management',
      description: 'Track booking status, payment status, and session details in real-time'
    }
  ];

  const workflowSteps = [
    {
      step: 1,
      title: 'Create Split Session',
      description: 'Select studio, date/time, invite collaborator, set cost split ratio'
    },
    {
      step: 2,
      title: 'Invite Talent (Optional)',
      description: 'Request specific artists, producers, or engineers to join'
    },
    {
      step: 3,
      title: 'Confirmation',
      description: 'Co-client accepts invite, talent responds, booking is confirmed'
    },
    {
      step: 4,
      title: 'Payment',
      description: 'Both clients pay their share via Stripe checkout'
    },
    {
      step: 5,
      title: 'Session Time',
      description: 'All parties receive reminders and session details'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Split Studio Sessions
              </h1>
            </div>
            
            <div className="flex space-x-2">
              {['overview', 'create', 'manage', 'notifications'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Collaborate & Share Studio Costs
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Book studio sessions with a collaborator, split the cost fairly, and invite talented 
                artists, producers, or engineers to join your creative process.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <feature.icon className="w-10 h-10 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Workflow */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                How It Works
              </h3>
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
                {workflowSteps.map((step, index) => (
                  <React.Fragment key={step.step}>
                    <div className="flex-1 text-center">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                        {step.step}
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {step.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={() => setActiveTab('create')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
              >
                Create Your First Split Session
              </button>
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Create Split Studio Session
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Set up a new collaborative studio session and invite your collaborator
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <SplitBookingForm
                studios={mockStudios}
                onBookingCreated={(bookingId) => {
                  console.log('Booking created:', bookingId);
                  setActiveTab('manage');
                }}
                onCancel={() => setActiveTab('overview')}
              />
            </div>
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Manage Split Sessions
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage all your collaborative studio sessions
              </p>
            </div>

            <SplitBookingsList
              onCreateNew={() => setActiveTab('create')}
            />
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Notifications & Invites
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Stay updated on session invites, confirmations, and talent responses
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-8">
              <div className="text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No new notifications
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You'll receive notifications here for session invites, talent responses, and payment reminders.
                </p>
              </div>
            </div>

            {/* Demo Talent Request Modal */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Demo: Talent Request Modal
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This is how talent members will see and respond to session invitations:
              </p>
              <button
                onClick={() => setTalentModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                View Demo Modal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Demo Talent Request Modal */}
      <TalentRequestModal
        isOpen={talentModalOpen}
        onClose={() => setTalentModalOpen(false)}
        bookingId="demo-booking-id"
        talentRole="producer"
        onResponseSubmitted={(response) => {
          console.log('Demo response:', response);
          setTalentModalOpen(false);
        }}
      />
    </div>
  );
}
