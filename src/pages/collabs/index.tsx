import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { getFeaturedCollabPackages, getCollabPackages } from '@/lib/firestore/getCollabPackages';
import { CollabPackageCard } from '@/components/collab/CollabPackageCard';
import { CollabPackage } from '@/lib/types/CollabPackage';
import { 
  PlusIcon, 
  StarIcon, 
  ArrowRightIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function CollabsIndexPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [featuredPackages, setFeaturedPackages] = useState<CollabPackage[]>([]);
  const [recentPackages, setRecentPackages] = useState<CollabPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [featured, recent] = await Promise.all([
        getFeaturedCollabPackages(6),
        getCollabPackages(8)
      ]);
      
      setFeaturedPackages(featured);
      setRecentPackages(recent);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: UsersIcon,
      title: 'Multi-Role Teams',
      description: 'Work with verified artists, producers, engineers, videographers, and studios in one package'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Transparent Pricing',
      description: 'See detailed price breakdowns and revenue splits for all team members'
    },
    {
      icon: ClockIcon,
      title: 'Synchronized Schedules',
      description: 'Book entire teams with coordinated availability and schedules'
    },
    {
      icon: CheckCircleIcon,
      title: 'Verified Creators',
      description: 'All team members are verified professionals with proven track records'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Collaborate with <span className="text-yellow-300">Verified Creators</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Book complete creative teams for your projects. Artists, producers, engineers, 
              videographers, and studios working together seamlessly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/collabs/explore"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Explore Packages
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              
              {user && (
                <Link
                  href="/collabs/create"
                  className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Package
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* How It Works */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How Collab Packages Work
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Professional creative teams packaged together for seamless collaboration
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Packages */}
        {featuredPackages.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <StarIcon className="w-6 h-6 text-yellow-500 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Featured Packages
                </h2>
              </div>
              <Link
                href="/collabs/explore"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                View All
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPackages.map((package_) => (
                <CollabPackageCard
                  key={package_.id}
                  package={package_}
                  onClick={() => router.push(`/collabs/${package_.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Packages */}
        {recentPackages.length > 0 && (
          <div className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Latest Packages
              </h2>
              <Link
                href="/collabs/explore"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                View All
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentPackages.slice(0, 4).map((package_) => (
                <CollabPackageCard
                  key={package_.id}
                  package={package_}
                  onClick={() => router.push(`/collabs/${package_.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Collaborating?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already working together on amazing projects
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Sign Up to Start
                </Link>
                <Link
                  href="/collabs/explore"
                  className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Browse Packages
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/collabs/create"
                  className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Your Package
                </Link>
                <Link
                  href="/collabs/explore"
                  className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Find Collaborators
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
            <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-gray-600 dark:text-gray-400">Active Packages</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
            <div className="text-3xl font-bold text-purple-600 mb-2">2,000+</div>
            <div className="text-gray-600 dark:text-gray-400">Verified Creators</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
            <div className="text-3xl font-bold text-pink-600 mb-2">95%</div>
            <div className="text-gray-600 dark:text-gray-400">Client Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  );
}
