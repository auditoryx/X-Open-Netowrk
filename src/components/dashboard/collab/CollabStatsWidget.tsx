'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getCollabPackages } from '@/lib/firestore/getCollabPackages';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Users, Package, Calendar, TrendingUp } from 'lucide-react';
import { SCHEMA_FIELDS } from '../../../lib/SCHEMA_FIELDS';

export default function CollabStatsWidget() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activePackages: 0,
    totalBookings: 0,
    monthlyEarnings: 0,
    collaborators: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Get active packages count
        const packagesResult = await getCollabPackages({
          createdBy: user.uid,
          includeArchived: false,
          limit: 50
        });

        // Get total bookings count (both as creator and client)
        const creatorBookingsQuery = query(
          collection(db, 'collabBookings'),
          where('packageMembers', 'array-contains', user.uid)
        );
        const clientBookingsQuery = query(
          collection(db, 'collabBookings'),
          where('clientId', '==', user.uid)
        );

        const [creatorBookingsSnap, clientBookingsSnap] = await Promise.all([
          getCountFromServer(creatorBookingsQuery),
          getCountFromServer(clientBookingsQuery)
        ]);

        // Calculate unique collaborators
        const allMembers = new Set();
        packagesResult.packages.forEach(pkg => {
          pkg.members.forEach(member => {
            if (member.userId !== user.uid) {
              allMembers.add(member.userId);
            }
          });
        });

        setStats({
          activePackages: packagesResult.packages.length,
          totalBookings: creatorBookingsSnap.data().count + clientBookingsSnap.data().count,
          monthlyEarnings: 0, // TODO: Calculate from completed bookings
          collaborators: allMembers.size
        });
      } catch (error) {
        console.error('Error fetching collab stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-600 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-neutral-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statItems = [
    {
      label: 'Active Packages',
      value: stats.activePackages,
      icon: Package,
      color: 'text-blue-400'
    },
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'text-green-400'
    },
    {
      label: 'Collaborators',
      value: stats.collaborators,
      icon: Users,
      color: 'text-purple-400'
    },
    {
      label: 'This Month',
      value: `$${stats.monthlyEarnings}`,
      icon: TrendingUp,
      color: 'text-yellow-400'
    }
  ];

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Collaboration Overview</h3>
        <Link
          href="/dashboard/collabs"
          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
        >
          View Details →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {item.value}
              </div>
              <div className="text-xs text-gray-400">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>

      {stats.activePackages === 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-600">
          <p className="text-sm text-gray-400 text-center mb-3">
            Start collaborating with other creators
          </p>
          <Link
            href="/collabs/create"
            className="block w-full py-2 px-4 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-center text-sm"
          >
            Create Collab Package
          </Link>
        </div>
      )}
    </div>
  );
}
