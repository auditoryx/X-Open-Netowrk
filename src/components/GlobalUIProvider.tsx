'use client';

import React from 'react';
import CommandPalette, { useCommandPalette } from '@/components/ui/CommandPalette';
import PageTransition from '@/components/ui/PageTransition';

export default function GlobalUIProvider({ children }: { children: React.ReactNode }) {
  const commandPalette = useCommandPalette();

  return (
    <>
      <PageTransition isLoading={false}>
        {children}
      </PageTransition>
      <CommandPalette 
        isOpen={commandPalette.isOpen} 
        onClose={commandPalette.close} 
      />
    </>
  );
}