'use client';

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { getAllCreators } from '@/lib/firestore/getAllCreators';
import { cityToCoords } from '@/lib/utils/cityToCoords';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function GlobalMapPage() {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/dark-v10',
        center: [139.6917, 35.6895], // Default to Tokyo
        zoom: 2.5,
      });
    }

    const loadPins = async () => {
      const creators = await getAllCreators();

      creators.forEach((c) => {
        let lat = c.locationLat;
        let lng = c.locationLng;

        if (!lat || !lng) {
          const fallback = cityToCoords[c.location?.toLowerCase()?.replace(/\s+/g, '') || ''];
          if (fallback) {
            [lng, lat] = fallback;
          }
        }

        if (lat && lng) {
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <strong>${c.displayName}</strong><br/>
            ${c.role} ${c.verified ? '✔️' : ''}<br/>
            <a href="/profile/${c.uid}" target="_blank" class="underline">View Profile</a>
          `);

          new mapboxgl.Marker({ color: c.verified ? '#3B82F6' : '#aaa' })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map.current!);
        }
      });
    };

    loadPins();
  }, []);

  return (
    <div className="w-full h-screen">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
