import { getServerUser } from '@/lib/getServerUser';
import ArtistDashboard from '@/components/roles/ArtistDashboard';
import ProducerDashboard from '@/components/roles/ProducerDashboard';
import StudioDashboard from '@/components/roles/StudioDashboard';
import VideographerDashboard from '@/components/roles/VideographerDashboard';
import EngineerDashboard from '@/components/roles/EngineerDashboard';
import DefaultDashboard from '@/components/roles/DefaultDashboard';

export default async function DashboardPage() {
  const user = await getServerUser();

  if (!user) {
    return <p className="p-6">Please sign in.</p>;
  }

  switch (user.role) {
    case 'artist':
      return <ArtistDashboard />;
    case 'producer':
      return <ProducerDashboard />;
    case 'studio':
      return <StudioDashboard />;
    case 'videographer':
      return <VideographerDashboard />;
    case 'engineer':
      return <EngineerDashboard />;
    default:
      return <DefaultDashboard />;
  }
}
