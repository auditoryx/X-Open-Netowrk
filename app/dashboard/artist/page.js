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
}