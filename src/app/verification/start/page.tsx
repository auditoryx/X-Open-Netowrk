/**
 * KYC Verification Start Page
 * 
 * Allows users to initiate the identity verification process
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Shield, FileText, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface VerificationRequirements {
  required: boolean;
  documentTypes: string[];
  additionalChecks: string[];
}

export default function VerificationStartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState<VerificationRequirements>({
    required: false,
    documentTypes: [],
    additionalChecks: [],
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'verified' | 'signature'>('verified');

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    // Load verification requirements based on user's current tier and target tier
    loadVerificationRequirements();
  }, [user, selectedTier]);

  const loadVerificationRequirements = async () => {
    try {
      // In production, this would call an API to get requirements
      const mockRequirements: VerificationRequirements = {
        required: true,
        documentTypes: selectedTier === 'signature' 
          ? ['passport', 'driving_license', 'id_card']
          : ['driving_license', 'id_card'],
        additionalChecks: selectedTier === 'signature'
          ? ['selfie', 'address_verification']
          : ['selfie'],
      };
      
      setRequirements(mockRequirements);
    } catch (error) {
      console.error('Error loading verification requirements:', error);
      toast.error('Failed to load verification requirements');
    }
  };

  const startVerification = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/kyc/start-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: selectedTier,
          reason: `Tier upgrade to ${selectedTier}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start verification');
      }

      if (data.verification?.url) {
        // Redirect to Stripe Identity verification
        window.location.href = data.verification.url;
      } else {
        toast.error('Invalid verification session');
      }

    } catch (error: any) {
      console.error('Error starting verification:', error);
      toast.error(error.message || 'Failed to start verification');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Identity Verification
          </h1>
          <p className="text-lg text-gray-600">
            Verify your identity to unlock premium features and build trust with the community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Information */}
          <div className="space-y-6">
            {/* Tier Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Choose Verification Level
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                  <input
                    type="radio"
                    name="tier"
                    value="verified"
                    checked={selectedTier === 'verified'}
                    onChange={(e) => setSelectedTier(e.target.value as 'verified')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      Verified Tier
                    </div>
                    <div className="text-sm text-gray-500">
                      Basic identity verification for standard features
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                  <input
                    type="radio"
                    name="tier"
                    value="signature"
                    checked={selectedTier === 'signature'}
                    onChange={(e) => setSelectedTier(e.target.value as 'signature')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      Signature Tier
                    </div>
                    <div className="text-sm text-gray-500">
                      Enhanced verification for premium features and higher earnings
                    </div>
                  </div>
                  <Shield className="h-5 w-5 text-blue-500 ml-auto" />
                </label>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What You'll Need
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Government-issued ID
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {requirements.documentTypes.map((type) => (
                      <li key={type} className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-500" />
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </li>
                    ))}
                  </ul>
                </div>

                {requirements.additionalChecks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Additional Requirements
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {requirements.additionalChecks.map((check) => (
                        <li key={check} className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          {check.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">
                    Your Data is Secure
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    All verification data is encrypted and securely stored. We never share your personal information with third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Start Verification */}
          <div className="space-y-6">
            {/* Process Steps */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Verification Process
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                    1
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      Document Upload
                    </h4>
                    <p className="text-sm text-gray-600">
                      Take photos of your government-issued ID
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                    2
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      Selfie Verification
                    </h4>
                    <p className="text-sm text-gray-600">
                      Take a selfie to match with your ID photo
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                    3
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      Review Process
                    </h4>
                    <p className="text-sm text-gray-600">
                      Automated review, typically completed within minutes
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      Verification Complete
                    </h4>
                    <p className="text-sm text-gray-600">
                      Access premium features and increased trust
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Start Button */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-600">
                    I agree to the{' '}
                    <a href="/legal/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/legal/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                    . I understand that my personal information will be used for identity verification purposes.
                  </span>
                </label>
              </div>

              <button
                onClick={startVerification}
                disabled={!agreedToTerms || loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Starting Verification...
                  </div>
                ) : (
                  'Start Identity Verification'
                )}
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                The verification process is powered by Stripe Identity and typically takes 2-3 minutes to complete.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}