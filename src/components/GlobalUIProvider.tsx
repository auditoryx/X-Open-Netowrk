'use client';

import React from 'react';
import CommandPalette, { useCommandPalette } from '@/components/ui/CommandPalette';

export default function GlobalUIProvider({ children }: { children: React.ReactNode }) {
  const commandPalette = useCommandPalette();

  return (
    <>
      {children}
      <CommandPalette 
        isOpen={commandPalette.isOpen} 
        onClose={commandPalette.close} 
      />
    </>
  );
}