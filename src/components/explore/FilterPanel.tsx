'use client';

import React from 'react';

type Props = {
  filters: {
    role: string;
    verifiedOnly: boolean;
    location: string;
    service: string;
    lat?: number;
    lng?: number;
    searchNearMe?: boolean;
  };
  setFilters: (filters: any) => void;
};

const FilterPanel = ({ filters, setFilters }: Props) => {
  const handleGeoToggle = () => {
    if (!filters.searchNearMe) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFilters({
          ...filters,
          searchNearMe: true,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      });
    } else {
      setFilters({
        ...filters,
        searchNearMe: false,
        lat: undefined,
        lng: undefined,
      });
    }
  };

  return (
    <div className="mb-6 p-4 border border-neutral-800 rounded-lg bg-neutral-900 text-white">
      <h2 className="font-semibold mb-4 text-lg">Filters</h2>
      <div className="flex flex-col gap-4">
        <select
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          className="bg-black border border-neutral-700 p-2 rounded text-white"
        >
          <option value="">All Roles</option>
          <option value="artist">Artist</option>
          <option value="producer">Producer</option>
          <option value="studio">Studio</option>
          <option value="videographer">Videographer</option>
          <option value="engineer">Engineer</option>
        </select>

        <input
          type="text"
          placeholder="Location (Tokyo, Seoul...)"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="bg-black border border-neutral-700 p-2 rounded text-white"
        />

        <input
          type="text"
          placeholder="Service (Mixing, Videography...)"
          value={filters.service}
          onChange={(e) => setFilters({ ...filters, service: e.target.value })}
          className="bg-black border border-neutral-700 p-2 rounded text-white"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.searchNearMe || false}
            onChange={handleGeoToggle}
          />
          Search Near Me
        </label>
      </div>
    </div>
  );
};

export default FilterPanel;
