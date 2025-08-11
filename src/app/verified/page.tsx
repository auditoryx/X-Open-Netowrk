'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  limit
} from 'firebase/firestore';
import { app } from '@/lib/firebase';
import VerifiedBadge from '@/components/VerifiedBadge';
import { Star, Users, TrendingUp } from 'lucide-react';

interface VerifiedCreator {
  uid: string;
  name: string;
  displayName?: string;
  role: string;
  xp: number;
  averageRating?: number;
  profileImageUrl?: string;
  bio?: string;
  location?: string;
}

export default function VerifiedDirectoryPage() {
  const [creators, setCreators] = useState<VerifiedCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'xp' | 'rating'>(SCHEMA_FIELDS.USER.XP);

  useEffect(() => {
    fetchVerifiedCreators();
  }, [sortBy]);

  const fetchVerifiedCreators = async () => {
    setLoading(true);
    try {
      const db = getFirestore(app);
      const usersRef = collection(db, 'users');
      
      const q = query(
        usersRef,
        where('isVerified', '==', true),
        orderBy(sortBy === 'xp' ? 'xp' : 'averageRating', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const verifiedCreators = snapshot.docs.map(doc => ({
        uid: doc.id,
        name: doc.data().name || doc.data().displayName || 'Anonymous',
        displayName: doc.data().displayName,
        role: doc.data().role || 'Creator',
        xp: doc.data().xp || 0,
        averageRating: doc.data().averageRating || 0,
        profileImageUrl: doc.data().profileImageUrl,
        bio: doc.data().bio,
        location: doc.data().location
      })) as VerifiedCreator[];

      setCreators(verifiedCreators);
    } catch (error) {
      console.error('Error fetching verified creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="h-4 w-4 text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-600" />
      );
    }

    return stars;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-black to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 rounded-full p-4">
                <Users className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Verified <span className="text-blue-500">Creators</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover trusted, verified creators who have been validated by our team. 
              These professionals have proven their expertise and commitment to quality.
            </p>
            <div className="flex justify-center items-center gap-4">
              <span className="text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'xp' | 'rating')}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              >
                <option value="xp">XP Points</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900 rounded-lg p-6 text-center border border-gray-800">
            <div className="text-3xl font-bold text-blue-500 mb-2">{creators.length}</div>
            <div className="text-gray-300">Verified Creators</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 text-center border border-gray-800">
            <div className="text-3xl font-bold text-green-500 mb-2">
              {creators.reduce((sum, creator) => sum + creator.xp, 0).toLocaleString()}
            </div>
            <div className="text-gray-300">Total XP</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 text-center border border-gray-800">
            <div className="text-3xl font-bold text-yellow-500 mb-2">
              {creators.length > 0 ? (creators.reduce((sum, creator) => sum + (creator.averageRating || 0), 0) / creators.length).toFixed(1) : '0.0'}
            </div>
            <div className="text-gray-300">Average Rating</div>
          </div>
        </div>

        {/* Creators Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-20">
            <Users className="mx-auto h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No verified creators yet</h3>
            <p className="text-gray-500">Be the first to get verified!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creators.map((creator) => (
              <Link 
                key={creator.uid} 
                href={`/profile/${creator.uid}`}
                className="group"
              >
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-blue-500 transition-colors">
                  {/* Profile Image */}
                  <div className="flex items-center mb-4">
                    <div className="relative">
                      {creator.profileImageUrl ? (
                        <img
                          src={creator.profileImageUrl}
                          alt={creator.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-gray-300 text-xl font-semibold">
                            {creator.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center mb-1">
                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {creator.name}
                        </h3>
                        <VerifiedBadge size="sm" className="ml-2" />
                      </div>
                      <p className="text-gray-400 text-sm capitalize">{creator.role}</p>
                      {creator.location && (
                        <p className="text-gray-500 text-xs">{creator.location}</p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {creator.bio && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {creator.bio}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">XP</span>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-green-500 font-semibold">
                          {creator.xp.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    {creator.averageRating && creator.averageRating > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Rating</span>
                        <div className="flex items-center">
                          <div className="flex mr-2">
                            {renderStars(creator.averageRating)}
                          </div>
                          <span className="text-yellow-400 text-sm font-semibold">
                            {creator.averageRating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Want to get verified?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join these trusted creators and build credibility with clients through verification.
          </p>
          <Link 
            href="/apply/provider"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Apply now →
          </Link>
        </div>
      </div>
    </div>
  );
}