import React from 'react';
export default function Card({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`bg-panel rounded-xl shadow-sm ring-1 ring-neutral-800 ${className}`} />;
}
