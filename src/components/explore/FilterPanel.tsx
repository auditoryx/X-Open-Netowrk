'use client';

type Props = {
  filters: {
    role: string;
    location: string;
    service: string;
    proTier?: 'standard' | 'verified' | 'signature';
    searchNearMe?: boolean;
    lat?: number;
    lng?: number;
  };
  setFilters: (filters: any) => void;
};

export default function FilterPanel({ filters, setFilters }: Props) {
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

  const handleTierChange = (tier: 'verified' | 'signature') => {
    const updated = { ...filters };
    updated.proTier = filters.proTier === tier ? undefined : tier;
    setFilters(updated);
  };

  return (
    <div className="mb-6 p-4 border border-neutral-800 rounded-lg bg-neutral-900 text-white">
      <h2 className="font-semibold mb-4 text-lg">Filters</h2>

      <div className="flex flex-col gap-4">
        <select
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          className="input-base"
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
          className="input-base"
        />

        <input
          type="text"
          placeholder="Service (Mixing, Videography...)"
          value={filters.service}
          onChange={(e) => setFilters({ ...filters, service: e.target.value })}
          className="input-base"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.searchNearMe || false}
            onChange={handleGeoToggle}
          />
          Search Near Me
        </label>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-white">
            <input
              type="checkbox"
              checked={filters.proTier === 'signature'}
              onChange={() => handleTierChange('signature')}
              className="accent-yellow-400"
            />
            Signature
          </label>
          <label className="flex items-center gap-2 text-sm text-white">
            <input
              type="checkbox"
              checked={filters.proTier === 'verified'}
              onChange={() => handleTierChange('verified')}
              className="accent-blue-400"
            />
            Verified
          </label>
        </div>
      </div>
    </div>
  );
}
