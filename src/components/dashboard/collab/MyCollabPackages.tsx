'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { CollabPackage } from '@/lib/types/CollabPackage';
import { getCollabPackages } from '@/lib/firestore/getCollabPackages';
import { archiveCollabPackage } from '@/lib/firestore/createCollabPackage';
import Link from 'next/link';
import { Calendar, Users, Star, Eye, Archive, Edit } from 'lucide-react';

interface MyCollabPackagesProps {
  onArchive?: (packageId: string) => void;
}

export default function MyCollabPackages({ onArchive }: MyCollabPackagesProps) {
  const { user } = useAuth();
  const [packages, setPackages] = useState<CollabPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchMyPackages = async () => {
      try {
        setLoading(true);
        const result = await getCollabPackages({
          createdBy: user.uid,
          includeArchived: false,
          limit: 50
        });
        setPackages(result.packages);
      } catch (error) {
        console.error('Error fetching my collab packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPackages();
  }, [user]);

  const handleArchive = async (packageId: string) => {
    if (!user) return;

    try {
      setArchiving(packageId);
      await archiveCollabPackage(packageId, user.uid);
      setPackages(prev => prev.filter(pkg => pkg.id !== packageId));
      onArchive?.(packageId);
    } catch (error) {
      console.error('Error archiving package:', error);
      alert('Failed to archive package. Please try again.');
    } finally {
      setArchiving(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Collab Packages Yet</h3>
        <p className="text-gray-500 mb-6">
          Create your first collaboration package to start working with other creators.
        </p>
        <Link
          href="/collabs/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Collab Package
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Collab Packages</h2>
        <Link
          href="/collabs/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Create New Package
        </Link>
      </div>

      {packages.map((pkg) => (
        <div key={pkg.id} className="bg-white rounded-lg border p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{pkg.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{pkg.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href={`/collabs/${pkg.id}`}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="View Package"
              >
                <Eye className="h-4 w-4" />
              </Link>
              <button
                onClick={() => handleArchive(pkg.id)}
                disabled={archiving === pkg.id}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Archive Package"
              >
                <Archive className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              {pkg.members.length} members
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              {pkg.durationHours}h sessions
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Star className="h-4 w-4 mr-2" />
              ${pkg.totalPrice}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {pkg.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {pkg.members.slice(0, 4).map((member) => (
                <div
                  key={member.userId}
                  className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                  title={`${member.displayName} (${member.role})`}
                >
                  {member.displayName.charAt(0).toUpperCase()}
                </div>
              ))}
              {pkg.members.length > 4 && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                  +{pkg.members.length - 4}
                </div>
              )}
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">
                {pkg.stats?.totalBookings || 0} bookings
              </p>
              <p className="text-sm text-gray-500">
                Created {new Date(pkg.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
