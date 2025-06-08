'use client';

import { useEffect, useRef, useState } from 'react';
import { Translate } from '@/i18n/Translate';

export default function LocationAutocomplete({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (name: string, lat: number, lng: number) => void;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
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
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
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
    </div>
  );
}
