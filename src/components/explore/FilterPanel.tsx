'use client';

import LocationAutocomplete from './LocationAutocomplete';
import SavedFilters from './SavedFilters';
import { Translate } from '@/i18n/Translate';
import { track } from '@/lib/analytics/track';

type Props = {
  filters: {
    role: string;
    location: string;
    service: string;
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
  /* ——— helper ——— */
  const updateFilters = (newFilters: any) => {
    setFilters(newFilters);
    track('filters_change', newFilters);
  };

  /* ——— toggles ——— */
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

  const handleTierChange = (tier: 'verified' | 'signature') => {
    updateFilters({
      ...filters,
      proTier: filters.proTier === tier ? undefined : tier,
    });
  };

  /* ——— UI ——— */
  return (
    <div className="mb-6 p-4 border border-neutral-800 rounded-lg bg-neutral-900 text-white">
      <h2 className="font-semibold mb-4 text-lg">
        <Translate t="filterPanel.filters" />
      </h2>

      <div className="flex flex-col gap-4">
        {/* Saved filter presets */}
        <SavedFilters filters={filters} setFilters={updateFilters} />

        {/* Role select */}
        <select
          aria-label={Translate.txt('filterPanel.roleLabel')}
          value={filters.role}
          onChange={(e) => updateFilters({ ...filters, role: e.target.value })}
          className="input-base"
        >
          <option value="">{Translate.txt('filterPanel.allRoles')}</option>
          <option value="artist">{Translate.txt('filterPanel.role.artist')}</option>
          <option value="producer">{Translate.txt('filterPanel.role.producer')}</option>
          <option value="studio">{Translate.txt('filterPanel.role.studio')}</option>
          <option value="videographer">
            {Translate.txt('filterPanel.role.videographer')}
          </option>
          <option value="engineer">{Translate.txt('filterPanel.role.engineer')}</option>
        </select>

        {/* Location autocomplete */}
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

        {/* Radius slider */}
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
              updateFilters({ ...filters, radiusKm: +e.target.value })
            }
            className="w-full"
          />
        </div>

        {/* Service text input */}
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

        {/* Sort dropdown */}
        <select
          aria-label={Translate.txt('filterPanel.sort.rating')}
          value={filters.sort || 'rating'}
          onChange={(e) =>
            updateFilters({ ...filters, sort: e.target.value as any })
          }
          className="input-base"
        >
          <option value="rating">{Translate.txt('filterPanel.sort.rating')}</option>
          <option value="distance">{Translate.txt('filterPanel.sort.distance')}</option>
          <option value="popularity">{Translate.txt('filterPanel.sort.popularity')}</option>
        </select>

        {/* Search-near-me toggle */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!filters.searchNearMe}
            onChange={handleGeoToggle}
            aria-label={Translate.txt('filterPanel.searchNearMe')}
          />
          <Translate t="filterPanel.searchNearMe" />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
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

        {/* Tier toggles */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.proTier === 'signature'}
              onChange={() => handleTierChange('signature')}
              className="accent-yellow-400"
              aria-label={Translate.txt('filterPanel.signature')}
            />
            <Translate t="filterPanel.signature" />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
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
