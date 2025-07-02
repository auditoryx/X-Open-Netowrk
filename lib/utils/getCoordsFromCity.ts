/**
 * Utility function to convert city names to coordinates
 * Uses a local database of popular cities for faster lookup
 * Falls back to Mapbox Geocoding API for less common locations
 */

interface Coordinates {
  lat: number;
  lng: number;
}

// Common cities with their coordinates for quick lookup
const CITY_COORDS: Record<string, Coordinates> = {
  'new york': { lat: 40.7128, lng: -74.0060 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'berlin': { lat: 52.5200, lng: 13.4050 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'toronto': { lat: 43.6532, lng: -79.3832 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'shanghai': { lat: 31.2304, lng: 121.4737 },
  'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
  'dubai': { lat: 25.2048, lng: 55.2708 },
  'cape town': { lat: -33.9249, lng: 18.4241 },
  'mexico city': { lat: 19.4326, lng: -99.1332 },
  'amsterdam': { lat: 52.3676, lng: 4.9041 },
  'seoul': { lat: 37.5665, lng: 126.9780 },
  'lagos': { lat: 6.5244, lng: 3.3792 },
  'johannesburg': { lat: -26.2041, lng: 28.0473 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'miami': { lat: 25.7617, lng: -80.1918 },
  'austin': { lat: 30.2672, lng: -97.7431 },
  'nashville': { lat: 36.1627, lng: -86.7816 },
  'atlanta': { lat: 33.7490, lng: -84.3880 },
  'san francisco': { lat: 37.7749, lng: -122.4194 }
};

/**
 * Get coordinates from a city name
 * 
 * @param city - Name of the city
 * @returns Promise with coordinates {lat, lng} or null if not found
 */
export async function getCoordsFromCity(city: string): Promise<Coordinates | null> {
  if (!city) return null;
  
  // Normalize city name for lookup
  const normalizedCity = city.toLowerCase().trim();
  
  // Check if we have it in our local database
  if (CITY_COORDS[normalizedCity]) {
    return CITY_COORDS[normalizedCity];
  }
  
  // For partial matches (e.g., "New York, NY" should match "new york")
  const partialMatch = Object.keys(CITY_COORDS).find(key => normalizedCity.includes(key));
  if (partialMatch) {
    return CITY_COORDS[partialMatch];
  }
  
  // Fall back to Mapbox Geocoding API for less common locations
  try {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) throw new Error('Mapbox token is not defined');
    
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?access_token=${mapboxToken}&limit=1`
    );
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching coordinates for city:', city, error);
    return null;
  }
}

/**
 * Get city name from coordinates using reverse geocoding
 * 
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise with city name or null if not found
 */
export async function getCityFromCoords(lat: number, lng: number): Promise<string | null> {
  try {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) throw new Error('Mapbox token is not defined');
    
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&types=place`
    );
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features[0].text;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching city name from coordinates:', lat, lng, error);
    return null;
  }
}
