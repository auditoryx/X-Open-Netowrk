'use client';

import { useEffect, useRef, useState } from 'react';
import { Translate } from '@/i18n/Translate';
import Image from 'next/image';

export default function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (name: string, lat: number, lng: number) => void;
  id?: string;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (query.length < 2 || !token) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const fetchResults = async () => {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${token}&autocomplete=true&types=place`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        setResults(data.features || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchResults();
    return () => controller.abort();
  }, [query, token]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleSelect = (item: any) => {
    setQuery(item.place_name);
    onChange(item.place_name);
    onSelect(item.place_name, item.center[1], item.center[0]);
    if (token) {
      const url =
        `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(` +
        `${item.center[0]},${item.center[1]})/300x150?access_token=${token}`;
      setMapUrl(url);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        id={id}
        aria-label={<Translate t="filterPanel.locationPlaceholder" /> as unknown as string}
        type="text"
        value={query}
        placeholder={<Translate t="filterPanel.locationPlaceholder" /> as unknown as string}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
        onFocus={() => setOpen(true)}
        className="input-base"
      />
      {open && results.length > 0 && (
        <ul role="listbox" className="absolute z-10 bg-white text-black border border-gray-300 rounded mt-1 max-h-60 overflow-auto w-full">
          {results.map((r) => (
            <li
              key={r.id}
              tabIndex={0}
              role="option"
              aria-selected={false}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(r)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(r)}
              className="px-3 py-2 hover:bg-gray-200 cursor-pointer text-sm"
            >
              {r.place_name}
            </li>
          ))}
        </ul>
      )}
      {mapUrl && (
        <Image src={mapUrl} alt="Map preview" className="mt-2 rounded" />
      )}
    </div>
  );
}
