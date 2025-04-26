"use client";
import ServiceManager from "../../../components/ServiceManager";

export default function ManageServices() {
  return (
    <main className="p-10 text-white bg-black min-h-screen space-y-6">
      <h1 className="text-3xl font-bold">Manage Your Services</h1>
      <ServiceManager />
    </main>
  );
}
