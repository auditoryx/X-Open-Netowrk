'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { User, Camera, Calendar, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
}

const ROLES = [
  { value: 'producer', label: 'Producer', description: 'Create beats, mix tracks, and offer music production services' },
  { value: 'artist', label: 'Artist', description: 'Perform, record, and collaborate on musical projects' },
  { value: 'engineer', label: 'Engineer', description: 'Mix, master, and provide technical audio services' },
  { value: 'videographer', label: 'Videographer', description: 'Create music videos, social content, and visual media' }
];

export default function OnboardingWizard() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    role: '',
    displayName: '',
    bio: '',
    profileImage: '',
    location: '',
    genres: [] as string[],
    availability: 'flexible'
  });

  const steps: OnboardingStep[] = [
    {
      id: 'role',
      title: 'What describes you best?',
      description: 'Select your primary role on the platform',
      component: (
        <div className="space-y-4">
          {ROLES.map((role) => (
            <button
              key={role.value}
              onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                formData.role === role.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-lg">{role.label}</h3>
              <p className="text-gray-600 text-sm mt-1">{role.description}</p>
            </button>
          ))}
        </div>
      )
    },
    {
      id: 'profile',
      title: 'Set up your profile',
      description: 'Add basic information about yourself',
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="How should we call you?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us a bit about yourself and your work..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, State or Remote"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )
    },
    {
      id: 'preferences',
      title: 'Set your preferences',
      description: 'Help us personalize your experience',
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genres & Styles
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Hip Hop', 'R&B', 'Pop', 'Rock', 'Electronic', 'Jazz', 'Country', 'Alternative'].map((genre) => (
                <button
                  key={genre}
                  onClick={() => {
                    const newGenres = formData.genres.includes(genre)
                      ? formData.genres.filter(g => g !== genre)
                      : [...formData.genres, genre];
                    setFormData(prev => ({ ...prev, genres: newGenres }));
                  }}
                  className={`p-2 text-sm rounded-md border transition-all ${
                    formData.genres.includes(genre)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability
            </label>
            <select
              value={formData.availability}
              onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="flexible">Flexible - Available most times</option>
              <option value="weekdays">Weekdays only</option>
              <option value="weekends">Weekends only</option>
              <option value="by-appointment">By appointment only</option>
            </select>
          </div>
        </div>
      )
    }
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      // Here you would typically save the onboarding data
      toast.success('Welcome to X Open Network!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to complete onboarding');
      console.error('Onboarding error:', error);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.role !== '';
      case 1:
        return formData.displayName.trim() !== '';
      case 2:
        return true; // Preferences are optional
      default:
        return false;
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to X Open Network</h1>
        <p className="text-gray-600">Let's get you set up in just a few steps</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Step {currentStep + 1} of {steps.length}</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-600">{steps[currentStep].description}</p>
        </div>
        
        {steps[currentStep].component}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`flex items-center px-4 py-2 rounded-md transition-all ${
            currentStep === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`flex items-center px-6 py-2 rounded-md transition-all ${
            canProceed()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {currentStep === steps.length - 1 ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Complete
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}