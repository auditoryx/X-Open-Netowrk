import { describe, it, expect } from 'vitest';
import { cityToCoords } from '../cityToCoords';

describe('cityToCoords', () => {
  it('should contain major cities with correct coordinates', () => {
    expect(cityToCoords['tokyo']).toEqual([139.6917, 35.6895]);
    expect(cityToCoords['seoul']).toEqual([126.978, 37.5665]);
    expect(cityToCoords['paris']).toEqual([2.3522, 48.8566]);
    expect(cityToCoords['london']).toEqual([-0.1276, 51.5074]);
  });

  it('should support multiple naming conventions for same city', () => {
    expect(cityToCoords['new york']).toEqual([-74.006, 40.7128]);
    expect(cityToCoords['nyc']).toEqual([-74.006, 40.7128]);
    expect(cityToCoords['la']).toEqual([-118.2437, 34.0522]);
    expect(cityToCoords['losangeles']).toEqual([-118.2437, 34.0522]);
  });

  it('should have valid longitude and latitude ranges', () => {
    Object.values(cityToCoords).forEach(([longitude, latitude]) => {
      expect(longitude).toBeGreaterThanOrEqual(-180);
      expect(longitude).toBeLessThanOrEqual(180);
      expect(latitude).toBeGreaterThanOrEqual(-90);
      expect(latitude).toBeLessThanOrEqual(90);
    });
  });

  it('should contain expected number of cities', () => {
    const cities = Object.keys(cityToCoords);
    expect(cities.length).toBeGreaterThan(10);
    expect(cities).toContain('tokyo');
    expect(cities).toContain('beijing');
    expect(cities).toContain('sydney');
  });

  it('should handle undefined city lookups', () => {
    expect(cityToCoords['unknown_city']).toBeUndefined();
    expect(cityToCoords['not_a_city']).toBeUndefined();
  });
});