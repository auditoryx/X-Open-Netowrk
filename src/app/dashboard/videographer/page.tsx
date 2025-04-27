import { withRoleProtection } from '@/lib/utils/withRoleProtection';

function VideographerDashboardPage() {
  return (
    <div>
      <h1>Welcome Videographer</h1>
    </div>
  );
}

export default withRoleProtection(VideographerDashboardPage, ['videographer']);
