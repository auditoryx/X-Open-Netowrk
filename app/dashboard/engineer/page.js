<<<<<<< HEAD
export default function EngineerDashboard() {
  return <div style={{ padding: '2rem' }}><h1>🎚 Engineer Dashboard</h1><p>Welcome, engineer!</p></div>;
=======
import ProviderBookings from "../../../components/ProviderBookings";

export default function EngineerDashboard() {
  return (
    <main className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Engineer Dashboard</h1>
      <ProviderBookings />
    </main>
  );
>>>>>>> 3126253 (chore: finalize migration prep for rebase)
}
