import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MapToggle from '@/components/Explore/MapToggle';
import WorldMapView from '@/components/Explore/WorldMapView';
import { getCoordsFromCity } from '@/lib/utils/getCoordsFromCity';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { searchCreators } from '@/lib/firestore/searchCreators'; // Import the function to search creators

// Interface for creator
interface Creator {
  id: string;
  displayName: string;
  location?: string;
  profileImageUrl?: string;
  roles?: string[];
  genres?: string[];
  bio?: string;
  verified?: boolean;
}

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [view, setView] = useState<'grid' | 'map'>(
    searchParams.get('view') === 'map' ? 'map' : 'grid'
  );
  
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  
  const [filters, setFilters] = useState({
    role: searchParams.get('role') || '',
    location: searchParams.get('location') || '',
    genre: searchParams.get('genre') ? searchParams.get('genre')!.split(',') : [],
  });

  // Load creators
  useEffect(() => {
    async function loadCreators() {
      setLoading(true);
      try {
        // Use the searchCreators function to get creators based on filters and search term
        const creatorsData = await searchCreators({
          searchTerm,
          role: filters.role,
          location: filters.location,
          genre: filters.genre.join(','),
          limit: 100
        });
        
        setCreators(creatorsData);
      } catch (error) {
        console.error('Error loading creators:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadCreators();
  }, [searchTerm, filters]);

  const handleCreatorClick = (creator: Creator) => {
    setSelectedCreator(creator);
    // Show a modal or navigate to creator profile
    router.push(`/profile/${creator.id}`);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    router.push(`/explore?${params.toString()}`);
  };

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    if (value && (Array.isArray(value) ? value.length > 0 : value !== '')) {
      params.set(name, Array.isArray(value) ? value.join(',') : value);
    } else {
      params.delete(name);
    }
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Explore Creators</h1>
            <p className="mt-1 text-sm text-gray-500">
              Find and connect with talented creators from around the world
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <MapToggle view={view} setView={setView} />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search creators by name, role, location..."
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4">
              <select
                className="px-3 py-2 border rounded-lg"
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="producer">Producer</option>
                <option value="singer">Singer</option>
                <option value="songwriter">Songwriter</option>
                <option value="engineer">Engineer</option>
                <option value="dj">DJ</option>
                <option value="instrumentalist">Instrumentalist</option>
              </select>
              
              <select
                className="px-3 py-2 border rounded-lg"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              >
                <option value="">All Locations</option>
                <option value="New York">New York</option>
                <option value="Los Angeles">Los Angeles</option>
                <option value="London">London</option>
                <option value="Tokyo">Tokyo</option>
                <option value="Berlin">Berlin</option>
                <option value="Paris">Paris</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No creators found</h3>
            <p className="mt-2 text-sm text-gray-500">Try changing your filters or search term</p>
          </div>
        ) : view === 'map' ? (
          <WorldMapView creators={creators} onCreatorClick={handleCreatorClick} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {creators.map((creator) => (
              <div 
                key={creator.id}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
              >
                <Link href={`/profile/${creator.id}`}>
                  <div className="cursor-pointer">
                    <div className="h-48 bg-gray-200 relative">
                      {creator.profileImageUrl ? (
                        <img 
                          src={creator.profileImageUrl} 
                          alt={creator.displayName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <svg className="h-16 w-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                      
                      {creator.verified && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Verified
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-lg">{creator.displayName}</h3>
                      
                      {creator.location && (
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {creator.location}
                        </p>
                      )}
                      
                      {creator.roles && creator.roles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {creator.roles.map(role => (
                            <span key={role} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {creator.bio && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{creator.bio}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
