<<<<<<< HEAD
export default function ArtistDashboard() {
  return <div style={{ padding: '2rem' }}><h1>🎤 Artist Dashboard</h1><p>Welcome, artist!</p></div>;
=======
"use client";
import ServiceForm from "../../../components/ServiceForm";
import ClientBookings from "../../../components/ClientBookings";

export default function ArtistDashboard() {
  return (
    <main className="p-10 text-white space-y-10">
      <h1 className="text-3xl font-bold">Artist Dashboard</h1>
      <ServiceForm />
      <ClientBookings />
    </main>
  );
>>>>>>> 3126253 (chore: finalize migration prep for rebase)
}
