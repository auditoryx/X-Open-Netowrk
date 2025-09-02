import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getCoordsFromCity } from '@lib/utils/getCoordsFromCity';
import styles from './WorldMapView.module.css';

// Fix Leaflet default icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Define the Creator interface
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

interface CreatorWithCoords extends Creator {
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface WorldMapViewProps {
  creators: Creator[];
  onCreatorClick?: (creator: Creator) => void;
  className?: string;
}

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

// Custom creator marker icon
const createCreatorIcon = (imageUrl?: string) => {
  return L.divIcon({
    html: `
      <div class="creator-marker">
        <img src="${imageUrl || '/images/default-profile.jpg'}" alt="Creator" />
      </div>
    `,
    className: styles.creatorMarker,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

const WorldMapView: React.FC<WorldMapViewProps> = ({ creators, onCreatorClick, className = '' }) => {
  const [creatorsWithCoords, setCreatorsWithCoords] = useState<CreatorWithCoords[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const getCreatorCoordinates = async () => {
      setLoading(true);
      
      const creatorsWithCoordsPromises = creators.map(async (creator) => {
        if (!creator.location) return { ...creator, coordinates: null };
        
        try {
          const coordinates = await getCoordsFromCity(creator.location);
          return { ...creator, coordinates };
        } catch (error) {
          console.error(`Error getting coordinates for ${creator.displayName}:`, error);
          return { ...creator, coordinates: null };
        }
      });
      
      const results = await Promise.all(creatorsWithCoordsPromises);
      const validCreators = results.filter(c => c.coordinates !== null) as CreatorWithCoords[];
      
      setCreatorsWithCoords(validCreators);
      setLoading(false);
      
      // If we have at least one creator with coordinates, fit bounds
      if (validCreators.length > 0 && mapRef.current) {
        const bounds = L.latLngBounds(
          validCreators
            .filter(c => c.coordinates)
            .map(c => [c.coordinates!.lat, c.coordinates!.lng] as L.LatLngExpression)
        );
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    };
    
    getCreatorCoordinates();
  }, [creators]);

  const handleMarkerClick = (creator: Creator) => {
    if (onCreatorClick) {
      onCreatorClick(creator);
    }
  };

  const renderMobileLocationCards = () => {
    return (
      <div className="md:hidden space-y-2 p-4">
        <h3 className="font-semibold text-gray-700">Creators by Location</h3>
        <div className="flex flex-col space-y-2">
          {creatorsWithCoords.map((creator) => (
            <div 
              key={creator.id} 
              className="flex items-center p-3 bg-white shadow rounded-lg cursor-pointer"
              onClick={() => handleMarkerClick(creator)}
            >
              <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                <img 
                  src={creator.profileImageUrl || '/images/default-profile.jpg'} 
                  alt={creator.displayName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{creator.displayName}</p>
                <p className="text-sm text-gray-500">{creator.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading creator locations...</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="hidden md:block h-[70vh] w-full relative">
        <MapContainer
          center={[20, 0]} // Default center (middle of the world)
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          whenReady={() => {
            // Map ready callback
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {creatorsWithCoords.map((creator) => 
            creator.coordinates ? (
              <Marker 
                key={creator.id} 
                position={[creator.coordinates.lat, creator.coordinates.lng]}
                icon={createCreatorIcon(creator.profileImageUrl)}
                eventHandlers={{
                  click: () => handleMarkerClick(creator)
                }}
              >
                <Popup>
                  <div className="flex flex-col items-center p-1">
                    <img 
                      src={creator.profileImageUrl || '/images/default-profile.jpg'} 
                      alt={creator.displayName}
                      className="h-16 w-16 rounded-full object-cover mb-2" 
                    />
                    <h3 className="font-bold text-lg">{creator.displayName}</h3>
                    <p className="text-sm text-gray-600">{creator.location}</p>
                    {creator.roles && creator.roles.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {creator.roles.slice(0, 2).map(role => (
                          <span key={role} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                            {role}
                          </span>
                        ))}
                        {creator.roles.length > 2 && (
                          <span className="text-xs text-gray-500">+{creator.roles.length - 2}</span>
                        )}
                      </div>
                    )}
                    <button 
                      className="mt-2 px-4 py-1 bg-black text-white text-sm rounded hover:bg-gray-800"
                      onClick={() => handleMarkerClick(creator)}
                    >
                      View Profile
                    </button>
                  </div>
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>
      
      {/* Mobile fallback: scrollable location cards */}
      {renderMobileLocationCards()}
    </div>
  );
};

export default WorldMapView;
