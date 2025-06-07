import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { cityToCoords } from '@/lib/utils/cityToCoords';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type Props = {
  filters: any;
};

export default function DiscoveryMap({ filters }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // initialize map on first render
  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/dark-v10',
        center: [139.6917, 35.6895],
        zoom: 2,
      });
    }
  }, []);

  // load markers when filters change
  useEffect(() => {
    if (!map.current) return;

    const load = async () => {
      const params = new URLSearchParams();
      if (filters.role) params.set('role', filters.role);
      if (filters.location) params.set('location', filters.location);
      if (filters.service) params.set('service', filters.service);
      if (filters.keyword) params.set('q', filters.keyword);
      if (filters.proTier) params.set('proTier', filters.proTier);
      if (filters.searchNearMe) {
        params.set('searchNearMe', 'true');
        if (filters.lat) params.set('lat', String(filters.lat));
        if (filters.lng) params.set('lng', String(filters.lng));
      }
      const res = await fetch('/api/search?' + params.toString());
      const creators = await res.json();
      const features: any[] = [];

      creators.forEach((c: any) => {
        let lat = c.locationLat;
        let lng = c.locationLng;
        if (!lat || !lng) {
          const key = c.location?.toLowerCase()?.replace(/\s+/g, '') || '';
          const fb = cityToCoords[key];
          if (fb) {
            lng = fb[0];
            lat = fb[1];
          }
        }
        if (lat && lng) {
          features.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [lng, lat] },
            properties: {
              uid: c.uid,
              name: c.displayName || 'Unnamed',
              role: c.role,
              verified: c.verified || false,
            },
          });
        }
      });

      const geojson = {
        type: 'FeatureCollection',
        features,
      } as GeoJSON.FeatureCollection;

      if (map.current!.getSource('creators')) {
        const src = map.current!.getSource('creators') as mapboxgl.GeoJSONSource;
        src.setData(geojson);
      } else {
        map.current!.on('load', () => {
          if (map.current!.getSource('creators')) return;
          map.current!.addSource('creators', {
            type: 'geojson',
            data: geojson,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50,
          });

          map.current!.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'creators',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': '#3B82F6',
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                15,
                10,
                20,
                30,
                25,
              ],
            },
          });

          map.current!.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'creators',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-size': 12,
            },
            paint: {
              'text-color': '#ffffff',
            },
          });

          map.current!.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'creators',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': '#ffffff',
              'circle-radius': 6,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#000000',
            },
          });

          map.current!.on('click', 'clusters', (e) => {
            const features = map
              .current!
              .queryRenderedFeatures(e.point, { layers: ['clusters'] });
            const clusterId = features[0].properties?.cluster_id;
            const src = map.current!.getSource('creators') as any;
            src.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
              if (err) return;
              map.current!.easeTo({
                center: features[0].geometry.coordinates as [number, number],
                zoom,
              });
            });
          });

          map.current!.on('click', 'unclustered-point', (e) => {
            const feature = e.features?.[0];
            if (!feature) return;
            const props = feature.properties as any;
            const html = `<div style="font-size:14px">` +
              `<strong>${props.name}</strong><br/>` +
              `${props.role}${props.verified ? ' ✔️' : ''}<br/>` +
              `<a href="/profile/${props.uid}" target="_blank" class="underline text-blue-400">View Profile</a>` +
              `</div>`;
            new mapboxgl.Popup()
              .setLngLat(feature.geometry.coordinates as any)
              .setHTML(html)
              .addTo(map.current!);
          });

          map.current!.on('mouseenter', 'clusters', () => {
            map.current!.getCanvas().style.cursor = 'pointer';
          });
          map.current!.on('mouseleave', 'clusters', () => {
            map.current!.getCanvas().style.cursor = '';
          });
          map.current!.on('mouseenter', 'unclustered-point', () => {
            map.current!.getCanvas().style.cursor = 'pointer';
          });
          map.current!.on('mouseleave', 'unclustered-point', () => {
            map.current!.getCanvas().style.cursor = '';
          });
        });
      }
    };

    load();
  }, [filters]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
