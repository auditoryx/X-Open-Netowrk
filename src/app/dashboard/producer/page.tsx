import { withRoleProtection } from '@/lib/utils/withRoleProtection';

function ProducerDashboardPage() {
  return (
    <div>
      <h1>Welcome Producer</h1>
    </div>
  );
}

export default withRoleProtection(ProducerDashboardPage, ['producer']);
