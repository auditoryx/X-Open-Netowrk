'use client';

import { useState } from 'react';

export function useSidebarToggle() {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen(!open);
  const close = () => setOpen(false);

  return { open, toggle, close };
}
