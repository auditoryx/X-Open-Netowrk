'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-20">

        {/* HERO */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold">The Global Creative Network Built for Music.</h1>
          <p className="text-lg text-gray-300">
            Connect with producers, engineers, videographers, and studios — book services, sell your own, and get paid.
          </p>
          <div className="flex justify-center gap-4 pt-6">
            <Link href="/explore" className="border px-6 py-2 rounded hover:bg-white hover:text-black transition">
              🔍 Explore Creators
            </Link>
            <Link href="/apply" className="border px-6 py-2 rounded hover:bg-white hover:text-black transition">
              ✍️ Apply to Join
            </Link>
          </div>
        </section>

        {/* FEATURE TILES */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">
          {[
            {
              title: '🎤 Buy Features from Artists',
              desc: 'Book a verse, hook, or exclusive song directly from your favorite artists.',
            },
            {
              title: '🎥 Book Videographers',
              desc: 'Hire video editors, cinematographers, and visual directors worldwide.',
            },
            {
              title: '🏢 List Your Studio',
              desc: 'Let artists book studio time in your space. Manage calendar & payments easily.',
            },
            {
              title: '🎚 Become an AuditoryX Engineer',
              desc: 'Get hired for remote or in-person mixing, mastering, vocal tuning & more.',
            },
            {
              title: '🎼 Sell Beats',
              desc: 'Join the beat marketplace and earn from exclusive or non-exclusive licensing.',
            },
            {
              title: '🌍 Get Discovered Globally',
              desc: 'AuditoryX connects creators by location, service type, and rating.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-2 hover:border-white/20 transition">
              <h2 className="text-xl font-semibold">{f.title}</h2>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </div>
          ))}
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

        {/* GLOBAL SHOWCASE - placeholder until dynamic */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Featured Creators</h2>
          <div className="overflow-x-auto flex gap-4 pb-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="min-w-[220px] bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <div className="h-12 w-12 rounded-full bg-white mb-2"></div>
                <p className="text-sm font-semibold">Creator {i + 1}</p>
                <p className="text-xs text-gray-400">Producer • Tokyo</p>
                <p className="text-xs text-green-400 mt-1">⭐ 4.8</p>
              </div>
            ))}
          </div>
        </section>

        {/* BROWSE BY ROLE */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Browse by Role</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
            {[
              { icon: '🎤', role: 'artist' },
              { icon: '🎧', role: 'producer' },
              { icon: '🎚️', role: 'engineer' },
              { icon: '🎥', role: 'videographer' },
              { icon: '🏢', role: 'studio' },
            ].map(({ icon, role }) => (
              <Link
                key={role}
                href={`/explore?role=${role}`}
                className="border border-neutral-700 rounded-lg py-4 hover:border-white/60 transition"
              >
                <span className="block text-2xl">{icon}</span>
                <span className="text-sm capitalize text-gray-300">{role}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* BROWSE BY LOCATION */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-center">Popular Locations</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['Tokyo', 'LA', 'Seoul', 'London', 'NYC'].map((city) => (
              <Link
                key={city}
                href={`/explore?location=${city}`}
                className="px-4 py-2 border border-neutral-700 rounded-full hover:border-white transition text-sm text-gray-300"
              >
                {city}
              </Link>
            ))}
          </div>
        </section>

        {/* APPLY TO JOIN BANNER */}
        <section className="bg-neutral-900 rounded-xl p-8 text-center space-y-4 border border-neutral-800">
          <h3 className="text-xl font-semibold">Want to offer services on AuditoryX?</h3>
          <p className="text-sm text-gray-400">
            Apply as a creator and start getting booked.
          </p>
          <Link
            href="/apply"
            className="inline-block border px-6 py-2 rounded hover:bg-white hover:text-black transition"
          >
            📍 Apply Now
          </Link>
        </section>

      </div>
    </main>
  );
}
