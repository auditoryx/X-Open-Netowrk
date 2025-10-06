'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SCHEMA_FIELDS } from '@/lib/SCHEMA_FIELDS';
import { getAllCreators } from '@/lib/firestore/getAllCreators';
import { cityToCoords } from '@/lib/utils/cityToCoords';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Creator {
  uid: string;
  displayName: string;
  role: string;
  verified: boolean;
  price?: number;
  nextAvailable?: string;
  location?: string;
  locationLat?: number;
  locationLng?: number;
  avatar?: string;
  tier?: string;
  rating?: number;
  reviewCount?: number;
  availability?: string;
  services?: string[];
}

interface MapFilters {
  role: string[];
  priceRange: [number, number];
  availability: string;
  verified: boolean;
  tier: string[];
  rating: number;
  services: string[];
}

export default function GlobalMapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const mapboxglRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  
  const [creators, setCreators] = useState<Creator[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  
  const [filters, setFilters] = useState<MapFilters>({
    role: [],
    priceRange: [0, 1000],
    availability: 'all',
    verified: false,
    tier: [],
    rating: 0,
    services: []
  });

  // Load creators
  useEffect(() => {
    const loadCreators = async () => {
      try {
        const creatorData = await getAllCreators();
        setCreators(creatorData);
        setFilteredCreators(creatorData);
      } catch (error) {
        console.error('Failed to load creators:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCreators();
  }, []);

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (!mapContainer.current) return;

      if (!mapboxglRef.current) {
        const mbgl = (await import('mapbox-gl')).default;
        mbgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
        mapboxglRef.current = mbgl;
      }

      if (!map.current) {
        map.current = new mapboxglRef.current.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [-74.006, 40.7128], // Default to NYC
          zoom: 10,
        });

        // Add navigation controls
        map.current.addControl(new mapboxglRef.current.NavigationControl(), 'top-right');
        
        // Add geolocate control
        map.current.addControl(
          new mapboxglRef.current.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
          }),
          'top-right'
        );
      }
    };

    initMap();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = creators;

    if (filters.role.length > 0) {
      filtered = filtered.filter(creator => filters.role.includes(creator.role));
    }

    if (filters.verified) {
      filtered = filtered.filter(creator => creator.verified);
    }

    if (filters.tier.length > 0) {
      filtered = filtered.filter(creator => 
        creator.tier && filters.tier.includes(creator.tier)
      );
    }

    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      filtered = filtered.filter(creator => {
        const price = creator.price || 0;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }

    if (filters.rating > 0) {
      filtered = filtered.filter(creator => 
        (creator.rating || 0) >= filters.rating
      );
    }

    if (filters.availability !== 'all') {
      filtered = filtered.filter(creator => {
        if (filters.availability === 'available') {
          return creator.availability === 'available' || creator.nextAvailable;
        }
        return true;
      });
    }

    if (filters.services.length > 0) {
      filtered = filtered.filter(creator => 
        creator.services && creator.services.some(service => 
          filters.services.includes(service)
        )
      );
    }

    setFilteredCreators(filtered);
  }, [creators, filters]);

  // Update map markers with clustering
  useEffect(() => {
    if (!map.current || !mapboxglRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Prepare data for clustering
    const points = filteredCreators.map(creator => {
      let lat = creator.locationLat;
      let lng = creator.locationLng;

      if (!lat || !lng) {
        const fallback = cityToCoords[creator.location?.toLowerCase()?.replace(/\s+/g, '') || ''];
        if (fallback) {
          [lng, lat] = fallback;
        }
      }

      return lat && lng ? {
        type: 'Feature',
        properties: {
          creator,
          cluster: false
        },
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      } : null;
    }).filter(Boolean);

    // Add GeoJSON source for clustering
    if (map.current.getSource('creators')) {
      map.current.getSource('creators').setData({
        type: 'FeatureCollection',
        features: points
      });
    } else {
      map.current.addSource('creators', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: points
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Add cluster circles
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'creators',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            10,
            '#f1f075',
            30,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            10,
            30,
            30,
            40
          ]
        }
      });

      // Add cluster count
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'creators',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });

      // Add unclustered point layer
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'creators',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#11b4da',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      // Click event for clusters
      map.current.on('click', 'clusters', (e) => {
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        const clusterId = features[0].properties.cluster_id;
        map.current.getSource('creators').getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err) return;
            map.current.easeTo({
              center: features[0].geometry.coordinates,
              zoom: zoom
            });
          }
        );
      });

      // Click event for individual points
      map.current.on('click', 'unclustered-point', (e) => {
        const creator = e.features[0].properties.creator;
        if (creator) {
          setSelectedCreator(typeof creator === 'string' ? JSON.parse(creator) : creator);
        }
      });

      // Mouse events
      map.current.on('mouseenter', 'clusters', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'clusters', () => {
        map.current.getCanvas().style.cursor = '';
      });
      map.current.on('mouseenter', 'unclustered-point', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'unclustered-point', () => {
        map.current.getCanvas().style.cursor = '';
      });
    }

    // Add individual markers as fallback for browsers that don't support clustering well
    filteredCreators.forEach(creator => {
      let lat = creator.locationLat;
      let lng = creator.locationLng;

      if (!lat || !lng) {
        const fallback = cityToCoords[creator.location?.toLowerCase()?.replace(/\s+/g, '') || ''];
        if (fallback) {
          [lng, lat] = fallback;
        }
      }

      if (lat && lng) {
        // Create custom marker element for individual markers (as backup)
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.style.display = 'none'; // Hidden by default, shown when clustering is disabled
        markerElement.innerHTML = `
          <div class="w-10 h-10 rounded-full border-2 border-white shadow-lg overflow-hidden cursor-pointer transform hover:scale-110 transition-transform ${
            creator.verified ? 'ring-2 ring-blue-500' : ''
          }" style="background-color: ${getMarkerColor(creator)}">
            ${creator.avatar ? 
              `<img src="${creator.avatar}" class="w-full h-full object-cover" />` :
              `<div class="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                ${creator.displayName.charAt(0).toUpperCase()}
              </div>`
            }
          </div>
        `;

        // Add click event to marker
        markerElement.addEventListener('click', () => {
          setSelectedCreator(creator);
        });

        // Create and add marker (hidden by default)
        const marker = new mapboxglRef.current.Marker({ element: markerElement })
          .setLngLat([lng, lat])
          .addTo(map.current);

        markersRef.current.set(creator.uid, marker);
      }
    });
  }, [filteredCreators]);

  const getMarkerColor = (creator: Creator) => {
    if (creator.tier === 'signature') return '#6366f1'; // Indigo
    if (creator.tier === 'premium') return '#f59e0b'; // Amber
    if (creator.verified) return '#3b82f6'; // Blue
    return '#6b7280'; // Gray
  };

  const getRoleOptions = () => {
    const roles = [...new Set(creators.map(c => c.role))];
    return roles.filter(Boolean);
  };

  const getServiceOptions = () => {
    const services = creators.flatMap(c => c.services || []);
    return [...new Set(services)];
  };

  const handleFilterChange = (key: keyof MapFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      role: [],
      priceRange: [0, 1000],
      availability: 'all',
      verified: false,
      tier: [],
      rating: 0,
      services: []
    });
  };

  const handleBookNow = (creator: Creator) => {
    window.open(`/book/${creator.uid}`, '_blank');
  };

  const handleViewProfile = (creator: Creator) => {
    window.open(`/profile/${creator.uid}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading creators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Filter toggle button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
        </svg>
      </button>

      {/* Results counter */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg px-4 py-2">
        <span className="text-sm text-gray-600">
          {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="absolute top-16 left-4 right-4 sm:right-auto sm:left-4 z-10 bg-white rounded-lg shadow-lg p-4 sm:w-80 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="sm:hidden text-gray-500 hover:text-gray-700 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Role filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Role</label>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                {getRoleOptions().map(role => (
                  <label key={role} className="flex items-center p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={filters.role.includes(role)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleFilterChange(SCHEMA_FIELDS.USER.ROLE, [...filters.role, role]);
                        } else {
                          handleFilterChange(SCHEMA_FIELDS.USER.ROLE, filters.role.filter(r => r !== role));
                        }
                      }}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="text-sm capitalize">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Min: ${filters.priceRange[0]}</label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={filters.priceRange[0]}
                    onChange={(e) => handleFilterChange('priceRange', [
                      parseInt(e.target.value),
                      filters.priceRange[1]
                    ])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Max: ${filters.priceRange[1]}</label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [
                      filters.priceRange[0],
                      parseInt(e.target.value)
                    ])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Quick filters */}
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
              {/* Verified only */}
              <label className="flex items-center p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => handleFilterChange('verified', e.target.checked)}
                  className="mr-3 w-4 h-4"
                />
                <div>
                  <span className="text-sm font-medium">Verified creators only</span>
                  <p className="text-xs text-gray-500">Platform-verified professionals</p>
                </div>
              </label>
            </div>

            {/* Tier filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Tier</label>
              <div className="grid grid-cols-1 gap-2">
                {['signature', 'premium', 'standard'].map(tier => (
                  <label key={tier} className="flex items-center p-2 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={filters.tier.includes(tier)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleFilterChange(SCHEMA_FIELDS.USER.TIER, [...filters.tier, tier]);
                        } else {
                          handleFilterChange(SCHEMA_FIELDS.USER.TIER, filters.tier.filter(t => t !== tier));
                        }
                      }}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="text-sm capitalize">{tier}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Minimum Rating: {filters.rating > 0 ? `${filters.rating} stars` : 'Any'}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.rating}
                onChange={(e) => handleFilterChange(SCHEMA_FIELDS.REVIEW.RATING, parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Any</span>
                <span>5★</span>
              </div>
            </div>

            {/* Availability filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All creators</option>
                <option value="available">Available now</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Creator details modal */}
      {selectedCreator && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold truncate">{selectedCreator.displayName}</h2>
                <button
                  onClick={() => setSelectedCreator(null)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Creator avatar/profile image */}
              {selectedCreator.avatar && (
                <div className="flex justify-center mb-4">
                  <img 
                    src={selectedCreator.avatar} 
                    alt={selectedCreator.displayName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                  />
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Role:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">{selectedCreator.role}</span>
                    {selectedCreator.verified && (
                      <span className="text-blue-500 text-lg" title="Verified">✓</span>
                    )}
                  </div>
                </div>

                {selectedCreator.tier && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Tier:</span>
                    <span className={`text-sm font-medium capitalize px-2 py-1 rounded-full ${
                      selectedCreator.tier === 'signature' ? 'bg-purple-100 text-purple-800' :
                      selectedCreator.tier === 'premium' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedCreator.tier}
                    </span>
                  </div>
                )}

                {selectedCreator.price && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Starting Price:</span>
                    <span className="text-sm font-bold text-green-600">${selectedCreator.price}</span>
                  </div>
                )}

                {selectedCreator.rating && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Rating:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{selectedCreator.rating}/5</span>
                      <span className="text-yellow-400">★</span>
                      <span className="text-xs text-gray-500">({selectedCreator.reviewCount || 0})</span>
                    </div>
                  </div>
                )}

                {selectedCreator.nextAvailable && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Next Available:</span>
                    <span className="text-sm font-medium text-green-600">{selectedCreator.nextAvailable}</span>
                  </div>
                )}

                {selectedCreator.location && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Location:</span>
                    <span className="text-sm font-medium">{selectedCreator.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleViewProfile(selectedCreator)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleBookNow(selectedCreator)}
                  className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
