import React from 'react';
import { MapIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface MapToggleProps {
  view: 'grid' | 'map';
  setView: (view: 'grid' | 'map') => void;
  className?: string;
}

const MapToggle: React.FC<MapToggleProps> = ({ view, setView, className = '' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleViewChange = (newView: 'grid' | 'map') => {
    setView(newView);

    // Update URL with view parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newView);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={`flex items-center bg-white rounded-full shadow-md border ${className}`}>
      <button
        onClick={() => handleViewChange('grid')}
        className={`flex items-center justify-center px-4 py-2 rounded-l-full transition-colors ${
          view === 'grid'
            ? 'bg-black text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="Grid view"
      >
        <Squares2X2Icon className="h-5 w-5 mr-1" />
        <span className="text-sm font-medium">Grid</span>
      </button>
      
      <button
        onClick={() => handleViewChange('map')}
        className={`flex items-center justify-center px-4 py-2 rounded-r-full transition-colors ${
          view === 'map'
            ? 'bg-black text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="Map view"
      >
        <MapIcon className="h-5 w-5 mr-1" />
        <span className="text-sm font-medium">Map</span>
      </button>
    </div>
  );
};

export default MapToggle;
