'use client';

import React, { useEffect, useRef } from 'react';
import { getAllCreators } from '@/lib/firestore/getAllCreators';
import { cityToCoords } from '@/lib/utils/cityToCoords';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function GlobalMapPage() {
  const mapContainer = useRef(null);
  const map = useRef<any>(null);
  const mapboxglRef = useRef<any>(null);

  useEffect(() => {
    const init = async () => {
      if (!mapboxglRef.current) {
        const mbgl = (await import('mapbox-gl')).default;
        mbgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
        mapboxglRef.current = mbgl;
      }

      if (!map.current) {
        map.current = new mapboxglRef.current.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/dark-v10',
          center: [139.6917, 35.6895], // Default to Tokyo
          zoom: 2.5,
        });
      }

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
          const popup = new mapboxglRef.current.Popup({ offset: 25 }).setHTML(`
            <div style="font-size:14px">
              <strong>${c.displayName}</strong><br/>
              ${c.role} ${c.verified ? '✔️' : ''}<br/>
              ${c.price ? `💸 Starting at $${c.price}<br/>` : ''}
              ${c.nextAvailable ? `🗓️ Next Available: ${c.nextAvailable}<br/>` : ''}
              <a href="/profile/${c.uid}" target="_blank" class="underline text-blue-400">🔍 View Profile</a><br/>
              <a href="/book/${c.uid}" target="_blank" class="underline text-green-400">💬 Book Now</a>
            </div>
          `);

          new mapboxglRef.current.Marker({ color: c.verified ? '#3B82F6' : '#aaa' })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map.current!);
        }
      });
    };

    init();
  }, []);

  return (
    <div className="w-full h-screen">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
