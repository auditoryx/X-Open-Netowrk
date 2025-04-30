'use client';

export default function BookingStatusCard({ status }: { status: string }) {
  const statusColor = {
    pending: 'text-yellow-500',
    confirmed: 'text-green-500',
    completed: 'text-blue-500',
    cancelled: 'text-red-500',
  }[status] || 'text-gray-500';

  return (
    <div className="p-4 border rounded flex items-center justify-between">
      <span>Status:</span>
      <span className={`font-bold ${statusColor}`}>{status.toUpperCase()}</span> 
    </div>
  );
}
