'use client';

import LocationAutocomplete from './LocationAutocomplete';
import SavedFilters from './SavedFilters';
import { Translate } from '@/i18n/Translate';

type Props = {
  filters: {
    role: string;
    location: string;
    service: string;
    proTier?: 'standard' | 'verified' | 'signature';
    searchNearMe?: boolean;
    lat?: number;
    lng?: number;
    radiusKm?: number;
    sort?: 'rating' | 'distance' | 'popularity';
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
      <h2 className="font-semibold mb-4 text-lg">
        <Translate t="filterPanel.filters" />
      </h2>

      <div className="flex flex-col gap-4">
        <SavedFilters filters={filters} setFilters={setFilters} />
        <select
          aria-label={<Translate t="filterPanel.roleLabel" /> as unknown as string}
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          className="input-base"
        >
          <option value="">
            <Translate t="filterPanel.allRoles" />
          </option>
          <option value="artist">
            <Translate t="filterPanel.role.artist" />
          </option>
          <option value="producer">
            <Translate t="filterPanel.role.producer" />
          </option>
          <option value="studio">
            <Translate t="filterPanel.role.studio" />
          </option>
          <option value="videographer">
            <Translate t="filterPanel.role.videographer" />
          </option>
          <option value="engineer">
            <Translate t="filterPanel.role.engineer" />
          </option>
        </select>

        <LocationAutocomplete
          value={filters.location}
          onChange={(v) => setFilters({ ...filters, location: v })}
          onSelect={(name, lat, lng) =>
            setFilters({
              ...filters,
              location: name,
              lat,
              lng,
              searchNearMe: false,
            })
          }
        />

        <div>
          <label className="text-sm block mb-1" id="radius-label">
            <Translate t="filterPanel.radius" />: {filters.radiusKm ?? 50} km
          </label>
          <input
            aria-labelledby="radius-label"
            type="range"
            min={1}
            max={100}
            value={filters.radiusKm ?? 50}
            onChange={(e) =>
              setFilters({
                ...filters,
                radiusKm: parseInt(e.target.value, 10),
              })
            }
            className="w-full"
          />
        </div>

        <input
          aria-label={<Translate t="filterPanel.serviceLabel" /> as unknown as string}
          type="text"
          placeholder={<Translate t="filterPanel.servicePlaceholder" /> as unknown as string}
          value={filters.service}
          onChange={(e) => setFilters({ ...filters, service: e.target.value })}
          className="input-base"
        />

        <select
          aria-label={<Translate t="filterPanel.sort.rating" /> as unknown as string}
          value={filters.sort || 'rating'}
          onChange={(e) =>
            setFilters({ ...filters, sort: e.target.value as any })
          }
          className="input-base"
        >
          <option value="rating">
            <Translate t="filterPanel.sort.rating" />
          </option>
          <option value="distance">
            <Translate t="filterPanel.sort.distance" />
          </option>
          <option value="popularity">
            <Translate t="filterPanel.sort.popularity" />
          </option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.searchNearMe || false}
            onChange={handleGeoToggle}
            aria-label={<Translate t="filterPanel.searchNearMe" /> as unknown as string}
          />
          <Translate t="filterPanel.searchNearMe" />
        </label>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-white">
            <input
              type="checkbox"
              checked={filters.proTier === 'signature'}
              onChange={() => handleTierChange('signature')}
              className="accent-yellow-400"
              aria-label={<Translate t="filterPanel.signature" /> as unknown as string}
            />
            <Translate t="filterPanel.signature" />
          </label>
          <label className="flex items-center gap-2 text-sm text-white">
            <input
              type="checkbox"
              checked={filters.proTier === 'verified'}
              onChange={() => handleTierChange('verified')}
              className="accent-blue-400"
              aria-label={<Translate t="filterPanel.verified" /> as unknown as string}
            />
            <Translate t="filterPanel.verified" />
          </label>
        </div>
      </div>
    </div>
  );
}
