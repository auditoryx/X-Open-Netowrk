'use client';

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { getAllCreators } from '@/lib/firestore/getAllCreators';
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
        center: [139.6917, 35.6895], // Tokyo
        zoom: 2.5,
      });
    }

    const loadPins = async () => {
      const creators = await getAllCreators();

      creators.forEach((c) => {
        if (c.locationLat && c.locationLng) {
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <strong>${c.displayName}</strong><br/>
            ${c.role} ${c.verified ? '✔️' : ''}<br/>
            <a href="/profile/${c.uid}" target="_blank" class="underline">View Profile</a>
          `);

          new mapboxgl.Marker({ color: c.verified ? '#3B82F6' : '#aaa' })
            .setLngLat([c.locationLng, c.locationLat])
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
