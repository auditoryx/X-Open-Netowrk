import React from 'react';
export default function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center px-3 py-1 rounded-full bg-brand/10 text-brand text-sm ${className}`}>{children}</span>;
}
