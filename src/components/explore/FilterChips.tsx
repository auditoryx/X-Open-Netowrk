'use client';

import React from 'react';
import { X } from 'lucide-react';

interface FilterChip {
  id: string;
  label: string;
  value: string;
  onRemove: () => void;
}

interface FilterChipsProps {
  chips: FilterChip[];
  onClearAll?: () => void;
  className?: string;
}

export default function FilterChips({ chips, onClearAll, className = '' }: FilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {chips.map((chip) => (
        <div
          key={chip.id}
          className="inline-flex items-center gap-2 bg-neutral-800 text-white px-3 py-1 rounded-full text-sm border border-white/10"
        >
          <span className="text-xs font-medium text-gray-400 uppercase">
            {chip.label}:
          </span>
          <span>{chip.value}</span>
          <button
            onClick={chip.onRemove}
            className="text-gray-400 hover:text-white transition-colors ml-1"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      
      {chips.length > 1 && onClearAll && (
        <button
          onClick={onClearAll}
          className="text-sm text-gray-400 hover:text-white transition-colors underline ml-2"
        >
          Clear all
        </button>
      )}
    </div>
  );
}