'use client';

import { useEffect, useRef, useMemo } from 'react';
import { track } from '@/lib/analytics/track';
import mapboxgl from 'mapbox-gl';
import { useInfiniteQuery } from '@tanstack/react-query';
import { cityToCoords } from '@/lib/utils/cityToCoords';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLanguage } from '@/context/LanguageContext';
import en from '@/i18n/en.json';
import jp from '@/i18n/jp.json';
import kr from '@/i18n/kr.json';
import { roleBadges, RoleKey } from '@/constants/roleBadges';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type Props = {
  filters: any;
};

type Page = { results: any[]; nextCursor?: string };

export default function DiscoveryMap({ filters }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const featuresRef = useRef<any[]>([]);
  const { language } = useLanguage();
  const translations: Record<string, Record<string, string>> = { en, jp, kr };

  /* ───────────────────────── QUERY ───────────────────────── */
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<Page>({
    queryKey: ['map-creators', filters],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '20', ...filters });
      if (pageParam) params.append('cursor', pageParam as string);
      track('search', { ...filters, page: pageParam ?? 1 });
      const res = await fetch(`/api/search?${params.toString()}`);
      return res.json();
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  /* ─────────────────── Infinite scroll trigger ─────────────────── */
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /* ─────────────────────── Map init ─────────────────────── */
  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/dark-v10',
        center: [139.6917, 35.6895], // Tokyo default
        zoom: 2,
        dragPan: true,
        touchPitch: false,
        touchZoomRotate: false,
      });
    }
  }, []);

  /* Reset markers on filter change */
  useEffect(() => {
    featuresRef.current = [];
  }, [filters]);

  /* ─────────────────── Marker / cluster updates ─────────────────── */
  useEffect(() => {
    if (!map.current || !data) return;

    const lastPage = data.pages[data.pages.length - 1];
    const newFeatures: any[] = [];

    lastPage.results.forEach((c: any) => {
      let { locationLat: lat, locationLng: lng } = c;

      if (!lat || !lng) {
        const key = c.location?.toLowerCase()?.replace(/\s+/g, '') || '';
        const fb = cityToCoords[key];
        if (fb) {
          [lng, lat] = fb;
        }
      }

      if (lat && lng) {
        newFeatures.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lng, lat] },
          properties: {
            uid: c.uid,
            name: c.displayName || 'Unnamed',
            role: c.role,
            verified: !!c.verified,
          },
        });
      }
    });

    featuresRef.current = [...featuresRef.current, ...newFeatures];

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: featuresRef.current,
    };

    if (map.current.getSource('creators')) {
      (map.current.getSource('creators') as mapboxgl.GeoJSONSource).setData(geojson);
    } else {
      map.current.on('load', () => {
        if (map.current!.getSource('creators')) return;

        map.current!.addSource('creators', {
          type: 'geojson',
          data: geojson,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        /* Cluster circles */
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

        /* Cluster count labels */
        map.current!.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'creators',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-size': 12,
          },
          paint: { 'text-color': '#ffffff' },
        });

        /* Single points */
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

        /* Cluster click → zoom */
        map.current!.on('click', 'clusters', (e) => {
          const clusterFeature = map.current!
            .queryRenderedFeatures(e.point, { layers: ['clusters'] })[0];
          const clusterId = clusterFeature.properties?.cluster_id;
          const src = map.current!.getSource('creators') as any;
          src.getClusterExpansionZoom(clusterId, (_err: any, zoom: number) => {
            map.current!.easeTo({
              center: clusterFeature.geometry.coordinates as [number, number],
              zoom,
            });
          });
        });

        /* Single point click → popup + analytics */
        map.current!.on('click', 'unclustered-point', (e) => {
          const feature = e.features?.[0];
          if (!feature) return;
          const props = feature.properties as any;

          /* Analytics */
          track('map_marker_click', {
            uid: props.uid,
            name: props.name,
            role: props.role,
            coordinates: feature.geometry.coordinates,
          });

          const viewLabel =
            translations[language]?.['common.viewProfile'] || 'View Profile';

          const badgeCfg = roleBadges[props.role as RoleKey];
          const key = badgeCfg?.label.toLowerCase();
          const metric = key ? (props as any)[key] : null;
          const badgeHtml =
            badgeCfg && metric
              ? `${badgeCfg.icon} ${metric} ${badgeCfg.label}<br/>`
              : '';

          const html =
            `<div style="font-size:14px">` +
            `<strong>${props.name}</strong><br/>` +
            `${props.role}${props.verified ? ' ✔️' : ''}<br/>` +
            badgeHtml +
            `<a href="/profile/${props.uid}" target="_blank" class="underline text-blue-400">${viewLabel}</a>` +
            `</div>`;

          new mapboxgl.Popup()
            .setLngLat(feature.geometry.coordinates as any)
            .setHTML(html)
            .addTo(map.current!);
        });

        /* Cursor styles */
        ['clusters', 'unclustered-point'].forEach((layer) => {
          map.current!.on('mouseenter', layer, () => {
            map.current!.getCanvas().style.cursor = 'pointer';
          });
          map.current!.on('mouseleave', layer, () => {
            map.current!.getCanvas().style.cursor = '';
          });
        });
      });
    }
  }, [data, filters, language, translations]);

  const memoizedTranslations = useMemo(() => {
    return translations;
  }, [language, translations]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full"
      role="application"
      tabIndex={0}
      aria-label={
        memoizedTranslations[language]?.['explore.mapLabel'] || 'Creator map'
      }
    />
  );
}
