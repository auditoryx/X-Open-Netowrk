'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  fetchFilterPresets,
  SavedFilter,
} from '@/lib/firestore/savedFilters';
import { track } from '@/lib/analytics/track';
import toast from 'react-hot-toast';

export default function SavedFilters({
  filters,
  setFilters,
  refreshKey,
}: {
  filters: any;
  setFilters: (f: any) => void;
  refreshKey: number;
}) {
  const { user } = useAuth();
  const [presets, setPresets] = useState<SavedFilter[]>([]);

  const load = async () => {
    if (!user) return;
    const list = await fetchFilterPresets(user.uid);
    setPresets(list);
  };

  useEffect(() => {
    load();
  }, [user, refreshKey]);

  const apply = (preset: SavedFilter) => {
    setFilters({ ...filters, ...preset.filters });
    track('saved_filter_apply', { id: preset.id });
    toast.success('Filters applied');
  };

  if (!presets.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map(p => (
        <button
          key={p.id}
          className="btn btn-secondary btn-xs"
          onClick={() => apply(p)}
          aria-label={`Apply ${p.name}`}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}
