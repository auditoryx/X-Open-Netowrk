import dynamic from 'next/dynamic';

const AdminDisputeDashboard = dynamic(() => import('@/components/disputes/AdminDisputeDashboard'), { ssr: false });

export default function DisputesAdminPage() {
  return (
    <div className="p-6">
      <AdminDisputeDashboard />
    </div>
  );
}
