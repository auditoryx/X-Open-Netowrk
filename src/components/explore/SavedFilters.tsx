'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Translate } from '@/i18n/Translate';
import {
  createFilterPreset,
  fetchFilterPresets,
  deleteFilterPreset,
  SavedFilter,
} from '@/lib/firestore/savedFilters';

export default function SavedFilters({
  filters,
  setFilters,
}: {
  filters: any;
  setFilters: (f: any) => void;
}) {
  const { user } = useAuth();
  const [presets, setPresets] = useState<SavedFilter[]>([]);
  const [selected, setSelected] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchFilterPresets(user.uid).then(setPresets);
  }, [user]);

  const applyPreset = (id: string) => {
    const preset = presets.find(p => p.id === id);
    if (!preset) return;
    setFilters({ ...filters, ...preset.filters });
  };

  const savePreset = async () => {
    if (!user || !name.trim()) return;
    await createFilterPreset(user.uid, name.trim(), filters);
    const list = await fetchFilterPresets(user.uid);
    setPresets(list);
    setName('');
  };

  const deletePresetHandler = async () => {
    if (!user || !selected) return;
    await deleteFilterPreset(user.uid, selected);
    const list = await fetchFilterPresets(user.uid);
    setPresets(list);
    setSelected('');
  };

  const handleSelect = (id: string) => {
    setSelected(id);
    if (id) applyPreset(id);
  };

  return (
    <div className="space-y-2">
      <select
        aria-label={<Translate t="savedFilters.savedPresets" /> as unknown as string}
        value={selected}
        onChange={e => handleSelect(e.target.value)}
        className="input-base"
      >
        <option value="">
          <Translate t="savedFilters.savedPresets" />
        </option>
        {presets.map(p => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <input
          aria-label={<Translate t="savedFilters.presetName" /> as unknown as string}
          type="text"
          placeholder={<Translate t="savedFilters.presetName" /> as unknown as string}
          value={name}
          onChange={e => setName(e.target.value)}
          className="input-base flex-1"
        />
        <button onClick={savePreset} className="btn btn-primary" aria-label={<Translate t="savedFilters.save" /> as unknown as string}>
          <Translate t="savedFilters.save" />
        </button>
        {selected && (
          <button onClick={deletePresetHandler} className="btn btn-secondary" aria-label={<Translate t="savedFilters.delete" /> as unknown as string}>
            <Translate t="savedFilters.delete" />
          </button>
        )}
      </div>
    </div>
  );
}
