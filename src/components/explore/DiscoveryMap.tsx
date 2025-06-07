import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics/track';
import mapboxgl from 'mapbox-gl';
import { useInfiniteQuery } from '@tanstack/react-query';
import { cityToCoords } from '@/lib/utils/cityToCoords';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type Props = {
  filters: any;
};

export default function DiscoveryMap({ filters }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const featuresRef = useRef<any[]>([]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['map-creators', filters],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '20', ...filters });
      if (pageParam) params.append('cursor', pageParam as string);
      track('search', { ...filters, page: pageParam ?? 1 });
      const res = await fetch(`/api/search?${params.toString()}`);
      return res.json();
    },
    getNextPageParam: last => last.nextCursor ?? undefined,
  });

  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 100 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

  // reset markers when filters change
  useEffect(() => {
    featuresRef.current = [];
  }, [filters]);

  // update markers when new data pages load
  useEffect(() => {
    if (!map.current || !data) return;

    const lastPage = data.pages[data.pages.length - 1];
    const features: any[] = [];
    lastPage.results.forEach((c: any) => {
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
    featuresRef.current = [...featuresRef.current, ...features];

    const geojson = {
      type: 'FeatureCollection',
      features: featuresRef.current,
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
          track('map_marker_click', {
            uid: props.uid,
            name: props.name,
            role: props.role,
            coordinates: feature.geometry.coordinates,
          });
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
  }, [data, filters]);

  return <div ref={mapContainer} className="w-full h-full" />;
}
