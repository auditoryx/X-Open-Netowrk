'use client';

import Link from 'next/link';

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-12">

        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold">What You Can Do on AuditoryX</h1>
          <p className="text-gray-400 text-lg">
            Whether you’re looking to book talent or get booked — AuditoryX gives you the tools to create, connect, and get paid.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: '🎤 Book or Sell Artist Features',
              desc: 'Buy verses or hooks from verified artists — or list your own services and get booked.',
            },
            {
              title: '🎧 Hire or Work as a Producer',
              desc: 'Browse exclusive beats or offer your production services through our beat marketplace.',
            },
            {
              title: '🎛️ Hire or Become an Engineer',
              desc: 'Book engineers for mixing & mastering — or get discovered for your engineering skills.',
            },
            {
              title: '🎥 Book or List Videographers',
              desc: 'Need a video shoot? Find local videographers or offer your own editing/camera work.',
            },
            {
              title: '🏢 Book or List Studios',
              desc: 'Book studio sessions or list your own recording space with availability & pricing.',
            },
            {
              title: '🌍 Global Booking Network',
              desc: 'Get discovered by location, role, and credibility. Connect worldwide, not just in your city.',
            },
          ].map((s, idx) => (
            <div
              key={idx}
              className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-2 hover:border-white/20 transition"
            >
              <h2 className="text-xl font-semibold">{s.title}</h2>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </div>
          ))}
        </section>

        <section className="text-center pt-12 space-y-4">
          <h2 className="text-2xl font-bold">Ready to get started?</h2>
          <p className="text-gray-400">List your services or book someone new today.</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/apply"
              className="border px-6 py-2 rounded hover:bg-white hover:text-black transition"
            >
              Apply as a Creator
            </Link>
            <Link
              href="/explore"
              className="border px-6 py-2 rounded hover:bg-white hover:text-black transition"
            >
              Explore Creatives
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
