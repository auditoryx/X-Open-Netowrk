'use client';

import { getStatusMeta } from '@/lib/utils/getStatusMeta';

export default function BookingStatusCard({ status }: { status: string }) {
  const { label, color } = getStatusMeta(status);

  return (
    <div className="p-4 border rounded flex items-center justify-between">
      <span>Status:</span>
      <span className={`font-bold ${color}`}>{label}</span> 
    </div>
  );
}
