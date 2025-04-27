import { withRoleProtection } from '@/lib/utils/withRoleProtection';

function ArtistDashboardPage() {
  return (
    <div>
      <h1>Welcome Artist</h1>
    </div>
  );
}

export default withRoleProtection(ArtistDashboardPage, ['artist']);
