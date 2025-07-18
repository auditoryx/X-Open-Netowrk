'use client';

import dynamic from 'next/dynamic';
import withAdminProtection from '@/middleware/withAdminProtection';

const ModerationPanel = dynamic(() => import('../components/ModerationPanel'), {
  ssr: false,
});

function DisputesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Open Disputes</h1>
      <ModerationPanel />
    </div>
  );
}

export default withAdminProtection(DisputesPage);
