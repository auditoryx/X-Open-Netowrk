export const roleBadges = {
  studio: { icon: '🏢', label: 'Rooms' },
  videographer: { icon: '🎥', label: 'Travel' },
  artist: { icon: '🎤', label: 'Genre' },
  producer: { icon: '🎛️', label: 'DAW' },
  engineer: { icon: '🎚️', label: 'Mix' },
} as const;

export type RoleKey = keyof typeof roleBadges;
