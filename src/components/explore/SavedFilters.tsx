'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
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
        value={selected}
        onChange={e => handleSelect(e.target.value)}
        className="input-base"
      >
        <option value="">Saved Presets</option>
        {presets.map(p => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Preset name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="input-base flex-1"
        />
        <button onClick={savePreset} className="btn btn-primary">
          Save
        </button>
        {selected && (
          <button onClick={deletePresetHandler} className="btn btn-secondary">
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
