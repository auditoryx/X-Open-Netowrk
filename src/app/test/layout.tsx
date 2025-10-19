'use client';

import { XPNotificationProvider } from '@/providers/XPNotificationProvider';

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <XPNotificationProvider>
      {children}
    </XPNotificationProvider>
  );
}
