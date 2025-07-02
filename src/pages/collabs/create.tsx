import React, { useState } from 'react';
import { CreateCollabPackageForm } from '@/src/components/collab/CreateCollabPackageForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/router';
import { ArrowLeft, Users, Lightbulb, Target, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CreateCollabPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const handlePackageCreated = (packageId: string) => {
    router.push(`/collabs/${packageId}`);
  };

  const handleCancel = () => {
    if (showForm) {
      setShowForm(false);
    } else {
      router.back();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to create collaboration packages.
          </p>
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create Collaboration Package
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showForm ? (
          <div className="space-y-8">
            {/* Introduction */}
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Build Your Dream Team Package
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Combine your skills with other verified creators to offer comprehensive 
                collaboration packages. From studio sessions to live performances, 
                create offerings that showcase the power of teamwork.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
                <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Reach More Clients
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Tap into new markets by offering comprehensive services that clients can't get elsewhere.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
                <Zap className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Higher Value Projects
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Team packages command premium prices while sharing the workload among specialists.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
                <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Network & Collaborate
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Build lasting relationships with other creators and expand your professional network.
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <Lightbulb className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
                    Tips for Success
                  </h3>
                  <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                    <li>• <strong>Choose complementary skills:</strong> Combine different specialties for comprehensive offerings</li>
                    <li>• <strong>Set clear expectations:</strong> Define roles, responsibilities, and revenue splits upfront</li>
                    <li>• <strong>Price competitively:</strong> Consider the combined value you're providing to clients</li>
                    <li>• <strong>Showcase past work:</strong> Include portfolio pieces from each team member</li>
                    <li>• <strong>Communicate effectively:</strong> Ensure all team members are aligned on the package goals</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Example Packages */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
                Popular Package Types
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Complete Studio Session
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Artist + Producer + Engineer + Studio space for full-service recording
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Recording</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Mixing</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Mastering</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Music Video Production
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Artist + Videographer + Producer for complete visual content creation
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Filming</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Editing</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Audio</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Live Performance Package
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Multiple artists + Engineer for concerts, festivals, and events
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Performance</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Sound</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Setup</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Custom Creative Project
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Flexible combination of roles for unique client requirements
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Consultation</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Creation</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Delivery</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium"
              >
                Start Creating Your Package
              </button>
            </div>
          </div>
        ) : (
          <CreateCollabPackageForm
            onPackageCreated={handlePackageCreated}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
