'use client';

import { useState } from 'react';
import LocationAutocomplete from './LocationAutocomplete';
import SavedFilters from './SavedFilters';
import { Translate } from '@/i18n/Translate';
import { track } from '@/lib/analytics/track';
import { useAuth } from '@/lib/hooks/useAuth';
import { createFilterPreset } from '@/lib/firestore/savedFilters';
import toast from 'react-hot-toast';

type Props = {
  filters: {
    role: string;
    location: string;
    service: string;
    genres: string[];
    minBpm?: number;
    maxBpm?: number;
    proTier?: 'standard' | 'verified' | 'signature';
    availableNow?: boolean;
    searchNearMe?: boolean;
    lat?: number;
    lng?: number;
    radiusKm?: number;
    sort?: 'rating' | 'distance' | 'popularity';
  };
  setFilters: (f: any) => void;
};

export default function FilterPanel({ filters, setFilters }: Props) {
  /* helpers */
  const updateFilters = (newFilters: any) => {
    setFilters(newFilters);
    track('filters_change', newFilters);
  };

  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  /* geo toggle */
  const handleGeoToggle = () => {
    if (!filters.searchNearMe) {
      navigator.geolocation.getCurrentPosition((pos) =>
        updateFilters({
          ...filters,
          searchNearMe: true,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      );
    } else {
      updateFilters({
        ...filters,
        searchNearMe: false,
        lat: undefined,
        lng: undefined,
      });
    }
  };

  /* tier toggle */
  const handleTierChange = (tier: 'verified' | 'signature') => {
    updateFilters({
      ...filters,
      proTier: filters.proTier === tier ? undefined : tier,
    });
  };

  /* genre input */
  const [genreInput, setGenreInput] = useState('');
  const addGenre = () => {
    const val = genreInput.trim();
    if (!val) return;
    updateFilters({ ...filters, genres: [...filters.genres, val] });
    setGenreInput('');
  };

  /* UI */
  return (
    <div className="mb-6 p-4 border border-neutral-800 rounded-lg bg-neutral-900 text-white">
      <h2 className="font-semibold mb-4 text-lg flex items-center justify-between">
        <span>
          <Translate t="filterPanel.filters" />
        </span>

        {/* save-filters icon */}
        <button
          onClick={async () => {
            const name = prompt('Preset name');
            if (!name || !user) return;
            await createFilterPreset(user.uid, name, filters);
            toast.success('Filters saved');
            setRefreshKey((k) => k + 1);
          }}
          className="text-sm"
          aria-label="Save Filters"
        >
          💾
        </button>
      </h2>

      <div className="flex flex-col gap-4">
        {/* saved presets */}
        <SavedFilters
          filters={filters}
          setFilters={updateFilters}
          refreshKey={refreshKey}
        />

        {/* role select */}
        <select
          aria-label={Translate.txt('filterPanel.roleLabel')}
          value={filters.role}
          onChange={(e) => updateFilters({ ...filters, role: e.target.value })}
          className="input-base"
        >
          <option value="">{Translate.txt('filterPanel.allRoles')}</option>
          <option value="artist">{Translate.txt('filterPanel.role.artist')}</option>
          <option value="producer">
            {Translate.txt('filterPanel.role.producer')}
          </option>
          <option value="studio">{Translate.txt('filterPanel.role.studio')}</option>
          <option value="videographer">
            {Translate.txt('filterPanel.role.videographer')}
          </option>
          <option value="engineer">
            {Translate.txt('filterPanel.role.engineer')}
          </option>
        </select>

        {/* location */}
        <LocationAutocomplete
          value={filters.location}
          onChange={(v) => updateFilters({ ...filters, location: v })}
          onSelect={(name, lat, lng) =>
            updateFilters({
              ...filters,
              location: name,
              lat,
              lng,
              searchNearMe: false,
            })
          }
        />

        {/* radius */}
        <div>
          <label htmlFor="radius" className="text-sm block mb-1" id="radius-label">
            <Translate t="filterPanel.radius" />: {filters.radiusKm ?? 50} km
          </label>
          <input
            id="radius"
            type="range"
            min={1}
            max={100}
            value={filters.radiusKm ?? 50}
            onChange={(e) =>
              updateFilters({ ...filters, radiusKm: +e.target.value })
            }
            className="w-full"
          />
        </div>

        {/* service text */}
        <input
          aria-label={Translate.txt('filterPanel.serviceLabel')}
          type="text"
          placeholder={Translate.txt('filterPanel.servicePlaceholder')}
          value={filters.service}
          onChange={(e) =>
            updateFilters({ ...filters, service: e.target.value })
          }
          className="input-base"
        />

        {/* genres */}
        <div>
          <label htmlFor="genres-input" className="text-sm block mb-1">Genres</label>
          <div className="flex flex-wrap gap-1 mb-1">
            {filters.genres.map((g) => (
              <span
                key={g}
                className="bg-neutral-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
              >
                {g}
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({
                      ...filters,
                      genres: filters.genres.filter((x) => x !== g),
                    })
                  }
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            id="genres-input"
            type="text"
            value={genreInput}
            onChange={(e) => setGenreInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addGenre();
              }
            }}
            className="input-base"
          />
        </div>

        {/* BPM range */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="min-bpm-filter" className="text-sm block mb-1">Min BPM</label>
            <input
              id="min-bpm-filter"
              type="number"
              value={filters.minBpm ?? ''}
              onChange={(e) =>
                updateFilters({
                  ...filters,
                  minBpm: e.target.value ? +e.target.value : undefined,
                })
              }
              className="input-base"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="max-bpm-filter" className="text-sm block mb-1">Max BPM</label>
            <input
              id="max-bpm-filter"
              type="number"
              value={filters.maxBpm ?? ''}
              onChange={(e) =>
                updateFilters({
                  ...filters,
                  maxBpm: e.target.value ? +e.target.value : undefined,
                })
              }
              className="input-base"
            />
          </div>
        </div>

        {/* sort */}
        <select
          aria-label={Translate.txt('filterPanel.sort.rating')}
          value={filters.sort || 'rating'}
          onChange={(e) =>
            updateFilters({ ...filters, sort: e.target.value as any })
          }
          className="input-base"
        >
          <option value="rating">
            {Translate.txt('filterPanel.sort.rating')}
          </option>
          <option value="distance">
            {Translate.txt('filterPanel.sort.distance')}
          </option>
          <option value="popularity">
            {Translate.txt('filterPanel.sort.popularity')}
          </option>
        </select>

        {/* toggles */}
        <label htmlFor="search-near-me" className="flex items-center gap-2 text-sm">
          <input
            id="search-near-me"
            type="checkbox"
            checked={!!filters.searchNearMe}
            onChange={handleGeoToggle}
            aria-label={Translate.txt('filterPanel.searchNearMe')}
          />
          <Translate t="filterPanel.searchNearMe" />
        </label>

        <label htmlFor="available-now" className="flex items-center gap-2 text-sm">
          <input
            id="available-now"
            type="checkbox"
            checked={!!filters.availableNow}
            onChange={() => {
              const next = !filters.availableNow;
              track('filter_available_now', { on: next });
              updateFilters({ ...filters, availableNow: next });
            }}
            className="accent-green-400"
            aria-label={Translate.txt('filterPanel.availableNow')}
          />
          <Translate t="filterPanel.availableNow" />
        </label>

        {/* tier checkboxes */}
        <div className="flex gap-4">
          <label htmlFor="tier-signature" className="flex items-center gap-2 text-sm">
            <input
              id="tier-signature"
              type="checkbox"
              checked={filters.proTier === 'signature'}
              onChange={() => handleTierChange('signature')}
              className="accent-yellow-400"
              aria-label={Translate.txt('filterPanel.signature')}
            />
            <Translate t="filterPanel.signature" />
          </label>

          <label htmlFor="tier-verified" className="flex items-center gap-2 text-sm">
            <input
              id="tier-verified"
              type="checkbox"
              checked={filters.proTier === 'verified'}
              onChange={() => handleTierChange('verified')}
              className="accent-blue-400"
              aria-label={Translate.txt('filterPanel.verified')}
            />
            <Translate t="filterPanel.verified" />
          </label>
        </div>
      </div>
    </div>
  );
}
