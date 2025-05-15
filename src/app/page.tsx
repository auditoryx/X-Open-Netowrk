'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-16">

        {/* HERO SECTION */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold">AuditoryX</h1>
          <p className="text-lg text-gray-300">
            The global platform for creators to connect, collaborate, and get paid.
          </p>
          <div className="flex justify-center gap-4 pt-6">
            <Link href="/explore" className="border px-6 py-2 rounded hover:bg-white hover:text-black">
              Explore Creatives
            </Link>
            <Link href="/apply" className="border px-6 py-2 rounded hover:bg-white hover:text-black">
              Apply as a Creator
            </Link>
          </div>
        </section>

        {/* WHAT YOU CAN DO */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-neutral-900 border p-6 rounded-xl space-y-2">
            <h2 className="text-xl font-semibold">🎤 Buy Features from Artists</h2>
            <p className="text-sm text-gray-400">Book a verse, hook, or exclusive song directly from your favorite artists.</p>
          </div>
          <div className="bg-neutral-900 border p-6 rounded-xl space-y-2">
            <h2 className="text-xl font-semibold">🎥 Book Videographers</h2>
            <p className="text-sm text-gray-400">Hire video editors, cinematographers, and visual directors worldwide.</p>
          </div>
          <div className="bg-neutral-900 border p-6 rounded-xl space-y-2">
            <h2 className="text-xl font-semibold">🏷️ List Your Studio</h2>
            <p className="text-sm text-gray-400">Let artists book studio time in your space. Manage calendar & payments easily.</p>
          </div>
          <div className="bg-neutral-900 border p-6 rounded-xl space-y-2">
            <h2 className="text-xl font-semibold">🧪 Become an AuditoryX Engineer</h2>
            <p className="text-sm text-gray-400">Get hired for remote or in-person mixing, mastering, vocal tuning & more.</p>
          </div>
          <div className="bg-neutral-900 border p-6 rounded-xl space-y-2">
            <h2 className="text-xl font-semibold">🎼 Sell Beats</h2>
            <p className="text-sm text-gray-400">Join the beat marketplace and earn from exclusive or non-exclusive licensing.</p>
          </div>
          <div className="bg-neutral-900 border p-6 rounded-xl space-y-2">
            <h2 className="text-xl font-semibold">🌍 Get Discovered Globally</h2>
            <p className="text-sm text-gray-400">AuditoryX connects creators by location, service type, and rating.</p>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-center">How AuditoryX Works</h2>
          <ol className="space-y-3 text-gray-300 text-sm max-w-2xl mx-auto list-decimal list-inside">
            <li>Creators apply to join AuditoryX by role (artist, engineer, videographer, studio, etc.)</li>
            <li>Admins review and approve based on profile, work quality, and availability</li>
            <li>Approved creators list their services with pricing, samples, and availability calendar</li>
            <li>Clients browse, filter by location, role, tags, and book instantly</li>
            <li>Chat, sign contracts, and collaborate through the platform</li>
            <li>Funds are held in escrow and released after the work is delivered</li>
          </ol>
        </section>

        {/* FINAL CTA */}
        <section className="pt-12 text-center">
          <h3 className="text-xl font-semibold">Join the future of creative work.</h3>
          <p className="text-sm text-gray-400 mb-4">Whether you’re a creator or a collaborator — AuditoryX is built for you.</p>
          <div className="flex justify-center gap-4">
            <Link href="/apply" className="border px-6 py-2 rounded hover:bg-white hover:text-black">
              Apply Now
            </Link>
            <Link href="/explore" className="border px-6 py-2 rounded hover:bg-white hover:text-black">
              Discover Creators
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
