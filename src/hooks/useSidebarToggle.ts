'use client';
import { useState } from 'react';

export function useSidebarToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);
  return { isOpen, toggle, close };
}
