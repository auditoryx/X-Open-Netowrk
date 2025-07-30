import { useState, useEffect } from 'react';
// Firebase admin is server-side only
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Mentorship } from '@/lib/types/Mentorship';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/formatCurrency';

export default function MentorshipListingPage() {
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expertise, setExpertise] = useState('all');

  // Expertise options
  const expertiseOptions = [
    'All',
    'Production',
    'Engineering',
    'Songwriting',
    'Mixing',
    'Mastering',
    'Vocal Performance',
    'Branding',
    'Marketing',
    'Music Business',
    'Artist Development',
    'Beat Making',
    'Sound Design',
    'Film Scoring',
    'Music Theory',
    'Recording Techniques',
    'Instrument Lessons',
    'Career Guidance'
  ];

  useEffect(() => {
    fetchMentorships();
  }, [filter, expertise]);

  const fetchMentorships = async () => {
    setLoading(true);
    try {
      let mentorshipQuery = query(
        collection(firestore, 'mentorships'),
        where('active', '==', true),
        orderBy(SCHEMA_FIELDS.USER.CREATED_AT, 'desc')
      );

      if (filter !== 'all') {
        mentorshipQuery = query(
          mentorshipQuery,
          where('format', '==', filter)
        );
      }

      if (expertise !== 'all') {
        mentorshipQuery = query(
          mentorshipQuery,
          where('expertise', 'array-contains', expertise)
        );
      }

      const mentorshipDocs = await getDocs(mentorshipQuery);
      const mentorshipList: Mentorship[] = [];

      mentorshipDocs.forEach(doc => {
        mentorshipList.push({
          id: doc.id,
          ...doc.data()
        } as Mentorship);
      });

      setMentorships(mentorshipList);
    } catch (error) {
      console.error('Error fetching mentorships:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Mentorship Opportunities</h1>
          <p className="text-gray-600 mb-8">
            Learn from industry experts through live sessions or asynchronous feedback
          </p>
          
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-8">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label htmlFor="format-filter" className="block text-sm font-medium text-gray-700">Format</label>
                <select
                  id="format-filter"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Formats</option>
                  <option value="live">Live Sessions</option>
                  <option value="async">Async Feedback</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="expertise-filter" className="block text-sm font-medium text-gray-700">Expertise</label>
                <select
                  id="expertise-filter"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                >
                  {expertiseOptions.map((opt) => (
                    <option 
                      key={opt} 
                      value={opt === 'All' ? 'all' : opt}
                    >
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Mentorship Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : mentorships.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No mentorships found</h3>
              <p className="mt-1 text-sm text-gray-500">Try changing your filters or check back later</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mentorships.map((mentorship) => (
                <Link 
                  href={`/mentorships/${mentorship.id}`} 
                  key={mentorship.id}
                  className="block"
                >
                  <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    {mentorship.creatorProfileImage ? (
                      <div className="h-48 w-full overflow-hidden">
                        <img 
                          src={mentorship.creatorProfileImage} 
                          alt={mentorship.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 w-full bg-gradient-to-r from-blue-500 to-purple-600" />
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{mentorship.title}</h3>
                          <p className="text-sm text-gray-500">by {mentorship.creatorName}</p>
                        </div>
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                          {mentorship.format === 'live' ? 'Live Session' : 'Async Feedback'}
                        </span>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-gray-700 line-clamp-2">{mentorship.description}</p>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {mentorship.expertise.slice(0, 2).map((exp, index) => (
                            <span 
                              key={index} 
                              className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                            >
                              {exp}
                            </span>
                          ))}
                          {mentorship.expertise.length > 2 && (
                            <span className="text-xs text-gray-500">+{mentorship.expertise.length - 2} more</span>
                          )}
                        </div>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(mentorship.price)}</p>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{mentorship.durationMinutes} minutes</span>
                          <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition">
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
