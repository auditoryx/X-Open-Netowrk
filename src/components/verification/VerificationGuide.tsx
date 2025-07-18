'use client';

import { useState } from 'react';
import { CheckCircle, Star, Shield, Award, Users, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface VerificationTier {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  requirements: string[];
  benefits: string[];
  trustSignals: string[];
}

const verificationTiers: VerificationTier[] = [
  {
    id: 'standard',
    name: 'Standard',
    icon: <CheckCircle className="w-6 h-6" />,
    color: 'text-green-600 bg-green-100',
    requirements: [
      'Complete profile with bio and profile photo',
      'Valid email verification',
      'Phone number verification',
      'At least 1 completed booking'
    ],
    benefits: [
      'Basic verification badge',
      'Profile appears in search results',
      'Access to basic booking features',
      'Customer support'
    ],
    trustSignals: [
      'Verified contact information',
      'Basic identity confirmation',
      'Platform activity history'
    ]
  },
  {
    id: 'verified',
    name: 'Verified',
    icon: <Shield className="w-6 h-6" />,
    color: 'text-blue-600 bg-blue-100',
    requirements: [
      'All Standard requirements',
      '3+ completed bookings',
      '1000+ XP points',
      'Government ID verification',
      'Business license (if applicable)',
      'Portfolio with 5+ work samples'
    ],
    benefits: [
      'Verified badge and higher search ranking',
      'Priority customer support',
      'Access to premium features',
      'Higher booking limits',
      'Featured in verified creator sections'
    ],
    trustSignals: [
      'Government ID verified',
      'Strong review history',
      'Proven track record',
      'Professional credentials checked'
    ]
  },
  {
    id: 'signature',
    name: 'Signature',
    icon: <Award className="w-6 h-6" />,
    color: 'text-purple-600 bg-purple-100',
    requirements: [
      'All Verified requirements',
      '20+ completed bookings',
      '2000+ XP points',
      'Professional references',
      'Background check completion',
      'Industry credentials verification',
      'Invitation only or application review'
    ],
    benefits: [
      'Signature badge and premium placement',
      'Dedicated account manager',
      'Revenue optimization tools',
      'Early access to new features',
      'Marketing and promotion support',
      'Premium commission rates'
    ],
    trustSignals: [
      'Elite performance metrics',
      'Professional references verified',
      'Background check completed',
      'Industry recognition'
    ]
  }
];

const applicationProcess = [
  {
    step: 1,
    title: 'Submit Application',
    description: 'Complete the verification form with all required information and documents'
  },
  {
    step: 2,
    title: 'Document Review',
    description: 'Our team reviews your submission within 2-3 business days'
  },
  {
    step: 3,
    title: 'Verification Check',
    description: 'We verify your identity, credentials, and professional information'
  },
  {
    step: 4,
    title: 'Final Approval',
    description: 'Receive your verification badge and unlock premium features'
  }
];

export default function VerificationGuide() {
  const [selectedTier, setSelectedTier] = useState<string>('verified');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get Verified on X Open Network
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Build trust with clients and unlock premium features by getting verified. 
            Higher verification levels mean more bookings and better opportunities.
          </p>
        </div>

        {/* Verification Tiers */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Verification Tiers
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {verificationTiers.map((tier) => (
              <div
                key={tier.id}
                className={`bg-white rounded-lg shadow-sm border-2 p-6 cursor-pointer transition-all ${
                  selectedTier === tier.id ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedTier(tier.id)}
              >
                <div className="flex items-center mb-4">
                  <div className={`p-2 rounded-lg ${tier.color} mr-3`}>
                    {tier.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{tier.name}</h3>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                  <ul className="space-y-1">
                    {tier.requirements.slice(0, 3).map((req, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                    {tier.requirements.length > 3 && (
                      <li className="text-sm text-gray-500">
                        +{tier.requirements.length - 3} more requirements
                      </li>
                    )}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Benefits:</h4>
                  <ul className="space-y-1">
                    {tier.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <Star className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                    {tier.benefits.length > 3 && (
                      <li className="text-sm text-gray-500">
                        +{tier.benefits.length - 3} more benefits
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Tier Details */}
        {selectedTier && (
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-16">
            <div className="max-w-4xl mx-auto">
              {(() => {
                const tier = verificationTiers.find(t => t.id === selectedTier);
                if (!tier) return null;

                return (
                  <>
                    <div className="flex items-center mb-6">
                      <div className={`p-3 rounded-lg ${tier.color} mr-4`}>
                        {tier.icon}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">{tier.name} Tier Details</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">All Requirements</h3>
                        <ul className="space-y-2">
                          {tier.requirements.map((req, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">All Benefits</h3>
                        <ul className="space-y-2">
                          {tier.benefits.map((benefit, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <Star className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Trust Signals</h3>
                        <ul className="space-y-2">
                          {tier.trustSignals.map((signal, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start">
                              <Shield className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                              {signal}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Application Process */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Application Process
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6">
              {applicationProcess.map((step, index) => (
                <div key={step.step} className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {step.step}
                    </div>
                    {index < applicationProcess.length - 1 && (
                      <ArrowRight className="w-6 h-6 text-gray-400 ml-4 hidden md:block" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How long does verification take?</h3>
              <p className="text-gray-600">Standard verification takes 1-2 business days. Verified tier takes 3-5 business days. Signature tier can take up to 7-10 business days due to additional background checks.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What happens if my application is rejected?</h3>
              <p className="text-gray-600">We'll provide specific feedback on what needs to be improved. You can reapply after addressing the issues, usually within 30 days.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I upgrade my verification level later?</h3>
              <p className="text-gray-600">Yes! Once you meet the requirements for a higher tier, you can apply for an upgrade at any time.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is there a cost for verification?</h3>
              <p className="text-gray-600">Standard and Verified tiers are free. Signature tier may require a small processing fee to cover background check costs.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Get Verified?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Start building trust with clients and unlock premium features. 
            The verification process is quick and our team is here to help.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/apply"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Verification Application
            </Link>
            <Link
              href="/contact"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}