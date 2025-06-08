export type ExploreFilters = {
  role?: string;
  location?: string;
  service?: string;
  proTier?: 'standard' | 'verified' | 'signature';
  availableNow?: boolean;
  searchNearMe?: boolean;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sort?: 'rating' | 'distance' | 'popularity';
};

export function filtersToQueryString(filters: ExploreFilters): string {
  const query = new URLSearchParams();
  if (filters.role) query.set('role', filters.role);
  if (filters.location) query.set('location', filters.location);
  if (filters.service) query.set('service', filters.service);
  if (filters.proTier) query.set('proTier', filters.proTier);
  if (filters.searchNearMe) query.set('searchNearMe', 'true');
  if (filters.availableNow) query.set('availableNow', '1');
  if (filters.lat !== undefined) query.set('lat', String(filters.lat));
  if (filters.lng !== undefined) query.set('lng', String(filters.lng));
  if (filters.radiusKm !== undefined) query.set('radiusKm', String(filters.radiusKm));
  if (filters.sort) query.set('sort', filters.sort);
  return query.toString();
}
