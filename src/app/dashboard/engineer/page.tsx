import { withRoleProtection } from '@/lib/utils/withRoleProtection';

function EngineerDashboardPage() {
  return (
    <div>
      <h1>Welcome Engineer</h1>
    </div>
  );
}

export default withRoleProtection(EngineerDashboardPage, ['engineer']);
