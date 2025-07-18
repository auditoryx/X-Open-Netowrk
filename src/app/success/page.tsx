'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CaseStudyCard from '@/components/CaseStudyCard';
import { Star, TrendingUp, Users } from 'lucide-react';

const caseStudies = [
  {
    id: '1',
    creatorName: 'Marcus "Metro" Johnson',
    creatorRole: 'Hip-Hop Producer',
    profileImage: '/api/placeholder/64/64',
    beforeStats: {
      monthlyEarnings: 2500,
      clients: 8,
      rating: 4.2
    },
    afterStats: {
      monthlyEarnings: 8200,
      clients: 24,
      rating: 4.9
    },
    timeframe: '8 months',
    testimonial: 'X Open Network changed my career completely. I went from struggling to find clients to having a waiting list. The verification system helped clients trust me, and the platform made everything so professional.',
    projectTitle: 'Chart-Topping Album Production',
    projectDescription: 'Produced a full 12-track album that reached #3 on Billboard Hip-Hop charts, working with emerging artists who found me through the platform.',
    mediaUrl: '/api/placeholder/400/200',
    mediaType: 'image' as const,
    tags: ['Hip-Hop', 'Production', 'Mixing', 'Chart Success'],
    featured: true
  },
  {
    id: '2',
    creatorName: 'Sofia Martinez',
    creatorRole: 'R&B Vocalist & Songwriter',
    profileImage: '/api/placeholder/64/64',
    beforeStats: {
      monthlyEarnings: 1800,
      clients: 5,
      rating: 4.1
    },
    afterStats: {
      monthlyEarnings: 5400,
      clients: 16,
      rating: 4.8
    },
    timeframe: '6 months',
    testimonial: 'The collaborative features on X Open Network opened doors I never knew existed. I\'ve worked with producers from 3 different countries and my music has never sounded better.',
    projectTitle: 'International R&B Collaboration',
    projectDescription: 'Co-wrote and performed on an R&B track with producers from London and Seoul, resulting in over 2M streams on Spotify.',
    mediaUrl: '/api/placeholder/400/200',
    mediaType: 'image' as const,
    tags: ['R&B', 'Songwriting', 'Vocals', 'International']
  },
  {
    id: '3',
    creatorName: 'David Chen',
    creatorRole: 'Audio Engineer',
    profileImage: '/api/placeholder/64/64',
    beforeStats: {
      monthlyEarnings: 3200,
      clients: 12,
      rating: 4.3
    },
    afterStats: {
      monthlyEarnings: 7800,
      clients: 28,
      rating: 4.9
    },
    timeframe: '10 months',
    testimonial: 'The trust system and client reviews helped me build credibility fast. Now I work with major label artists who discovered my work through the platform.',
    projectTitle: 'Grammy-Nominated Mix',
    projectDescription: 'Mixed and mastered an album that received a Grammy nomination for Best Engineered Album, Non-Classical.',
    mediaUrl: '/api/placeholder/400/200',
    mediaType: 'video' as const,
    tags: ['Mixing', 'Mastering', 'Grammy', 'Major Label']
  },
  {
    id: '4',
    creatorName: 'Zoe Williams',
    creatorRole: 'Music Video Director',
    profileImage: '/api/placeholder/64/64',
    beforeStats: {
      monthlyEarnings: 4500,
      clients: 6,
      rating: 4.4
    },
    afterStats: {
      monthlyEarnings: 12500,
      clients: 18,
      rating: 4.9
    },
    timeframe: '7 months',
    testimonial: 'X Open Network helped me transition from doing music videos for local artists to working with streaming platform features. The networking opportunities are incredible.',
    projectTitle: 'Viral Music Video Campaign',
    projectDescription: 'Directed a music video that gained 50M+ views across platforms and was featured in major streaming service playlists.',
    mediaUrl: '/api/placeholder/400/200',
    mediaType: 'video' as const,
    tags: ['Music Video', 'Directing', 'Viral', 'Streaming']
  },
  {
    id: '5',
    creatorName: 'Alex Thompson',
    creatorRole: 'Electronic Music Producer',
    profileImage: '/api/placeholder/64/64',
    beforeStats: {
      monthlyEarnings: 1200,
      clients: 3,
      rating: 4.0
    },
    afterStats: {
      monthlyEarnings: 6800,
      clients: 22,
      rating: 4.8
    },
    timeframe: '12 months',
    testimonial: 'Starting out, I was just making beats in my bedroom. X Open Network connected me with artists worldwide and helped me turn my passion into a sustainable career.',
    projectTitle: 'Festival Main Stage Production',
    projectDescription: 'Produced tracks for artists who performed at major electronic music festivals including Ultra and EDC.',
    mediaUrl: '/api/placeholder/400/200',
    mediaType: 'image' as const,
    tags: ['Electronic', 'EDM', 'Festival', 'Production']
  }
];

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isBookingSuccess = searchParams.get('time');

  if (isBookingSuccess) {
    return (
      <div className="min-h-screen bg-ebony text-gray-100 flex items-center justify-center p-4">
        <div className="bg-panel rounded-xl p-8 max-w-md w-full text-center border border-neutral-700">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-4 text-white">
            Booking Request Sent!
          </h1>
          <p className="text-gray-400 mb-6">
            Your request has been submitted successfully. You'll receive a confirmation email shortly.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard/bookings')}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
            >
              View My Bookings
            </button>
            
            <button
              onClick={() => router.push('/success')}
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-gray-300 hover:text-white py-3 px-4 rounded-lg transition-colors"
            >
              See Success Stories
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Success Stories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Real creators. Real results. See how X Open Network is transforming careers 
            and helping artists build sustainable businesses in the music industry.
          </p>
          
          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                <TrendingUp className="w-6 h-6" />
                <span className="text-3xl font-bold">240%</span>
              </div>
              <p className="text-gray-600">Average earnings increase</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                <Users className="w-6 h-6" />
                <span className="text-3xl font-bold">180%</span>
              </div>
              <p className="text-gray-600">Average client growth</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-purple-600 mb-2">
                <Star className="w-6 h-6" />
                <span className="text-3xl font-bold">4.8</span>
              </div>
              <p className="text-gray-600">Average platform rating</p>
            </div>
          </div>
        </div>

        {/* Featured Case Study */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Featured Success Story</h2>
          <CaseStudyCard caseStudy={caseStudies[0]} variant="featured" />
        </div>

        {/* Case Studies Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">More Success Stories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.slice(1, 4).map((caseStudy) => (
              <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} />
            ))}
          </div>
        </div>

        {/* Compact Stories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Wins</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {caseStudies.slice(4).map((caseStudy) => (
              <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} variant="compact" />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Write Your Success Story?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators who are building thriving careers on X Open Network
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/signup')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </button>
            <button
              onClick={() => router.push('/explore')}
              className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Explore Creators
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}