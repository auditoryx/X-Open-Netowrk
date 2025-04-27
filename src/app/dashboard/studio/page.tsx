import { withRoleProtection } from '@/lib/utils/withRoleProtection';

function StudioDashboardPage() {
  return (
    <div>
      <h1>Welcome Studio</h1>
    </div>
  );
}

export default withRoleProtection(StudioDashboardPage, ['studio']);
