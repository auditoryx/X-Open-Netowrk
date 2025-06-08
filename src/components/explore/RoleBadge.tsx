'use client';
import React from 'react';
import { roleBadges, RoleKey } from '@/constants/roleBadges';

export function RoleBadge({
  role,
  profile,
}: {
  role: string;
  profile: Record<string, any>;
}) {
  const cfg = roleBadges[role as RoleKey];
  if (!cfg) return null;
  const key = cfg.label.toLowerCase();
  const value = profile?.[key];
  if (value === undefined || value === null || value === '') return null;
  return React.createElement(
    'span',
    { className: 'inline-block text-xs text-gray-400 mb-1' },
    `${cfg.icon} ${value} ${cfg.label}`
  );
}
