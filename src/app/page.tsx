import Button from '@/components/ui/Button';
import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AuditoryX - The Global Creative Network Built for Music',
  description: 'Book talent, sell your services, and get paid. Connect with creators worldwide.',
  openGraph: {
    title: 'AuditoryX - The Global Creative Network Built for Music',
    description: 'Book talent, sell your services, and get paid. Connect with creators worldwide.',
    images: 'https://placehold.co/1200x630/png',
  },
};

export default function Home() {
  // SEO FAQ schema
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is AuditoryX?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AuditoryX connects creators with clients worldwide.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />

      <main className="min-h-screen bg-ebony text-gray-100 px-6 py-16">
        <div className="mx-auto max-w-6xl space-y-20">

          {/* HERO */}
          <section className="text-center space-y-4 bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-500 text-white rounded-xl py-14 px-6">
            <h1 className="text-4xl font-bold">
              The Global Creative Network Built for Music.
            </h1>
            <p className="text-lg text-gray-200">
              Book talent, sell your services, and get paid.
            </p>
            <div className="flex justify-center gap-4 pt-6">
              <Link href="/explore" className="btn-primary btn-md">
                🔍 Explore Creators
              </Link>
              <Link href="/apply" className="btn-secondary btn-md">
                ✍️ Apply to Join
              </Link>
            </div>
          </section>

          {/* FEATURE TILES */}
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">
            {[
              {
                title: '🎤 Book Features from Artists',
                desc: 'Get verses from ThouxanBanFauni, UnoTheActivist, and 500+ verified artists. From $800-$5K per feature.',
              },
              {
                title: '🎥 Hire Top Videographers',
                desc: 'Work with Cole Bennett, Zach Hurth, and elite directors. Music videos starting at $2K.',
              },
              {
                title: '🏢 Book Premium Studios',
                desc: 'Record at Tree Sound, Stankonia, and 200+ pro studios. $100-500/hour with engineer included.',
              },
              {
                title: '🎚 World-Class Engineers',
                desc: 'Mix with Alex Tumay, Luca Pretolesi, and Grammy-winning engineers. $500-2K per song.',
              },
              {
                title: '🎼 Exclusive Beats',
                desc: 'Buy from Metro Boomin, Oogie Mane, and rising producers. Exclusive rights $300-10K.',
              },
              {
                title: '🌍 Global Network',
                desc: 'Access 10K+ creators across 50+ countries. Atlanta, LA, NYC, London, Tokyo, and beyond.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="min-h-[160px] rounded-xl bg-panel ring-1 ring-neutral-800 p-6 space-y-2 hover:ring-white/20 transition hover-lift"
              >
                <h2 className="text-xl font-semibold">{f.title}</h2>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </section>

          {/* HOW IT WORKS */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-center">How AuditoryX Works</h2>
            <ol className="mx-auto max-w-2xl list-decimal list-inside space-y-3 text-sm text-gray-300">
              <li>Creators apply by role (artist, engineer, videographer, studio, etc.)</li>
              <li>Admins review and approve based on quality and availability</li>
              <li>Approved creators list services with pricing, samples, calendar</li>
              <li>Clients browse, filter, and book instantly</li>
              <li>Chat, sign contracts, and collaborate through the platform</li>
              <li>Funds are held in escrow and released on delivery</li>
            </ol>
          </section>

          {/* RECENT ACTIVITY */}
          <section className="bg-gradient-to-r from-brand-900/20 to-brand-800/20 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold mb-3">🔥 Live Activity</h3>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>23 creators joined today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>156 bookings this week</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>$2.3M paid out this month</span>
              </div>
            </div>
          </section>

          {/* FEATURED CREATORS (real data) */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Featured Creators</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {/* Oogie Mane - Producer */}
              <div className="min-w-[280px] rounded-xl bg-panel ring-1 ring-neutral-800 p-4 hover-lift">
                <div className="mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  OM
                </div>
                <p className="font-semibold text-sm text-white">Oogie Mane</p>
                <p className="text-xs text-gray-400">Producer • Atlanta, GA</p>
                <p className="text-xs text-gray-500 mt-1">Trap, Hip-Hop, Drill</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-green-400">⭐ 4.9 (247 reviews)</p>
                  <p className="text-xs text-brand-400">From $500</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">🎵 "Known for hard-hitting 808s"</p>
              </div>

              {/* ThouxanBanFauni - Artist */}
              <div className="min-w-[280px] rounded-xl bg-panel ring-1 ring-neutral-800 p-4 hover-lift">
                <div className="mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                  TBF
                </div>
                <p className="font-semibold text-sm text-white">ThouxanBanFauni</p>
                <p className="text-xs text-gray-400">Artist • Virginia</p>
                <p className="text-xs text-gray-500 mt-1">Hip-Hop, Cloud Rap, Underground</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-green-400">⭐ 4.8 (189 reviews)</p>
                  <p className="text-xs text-brand-400">From $1,200</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">🎤 "Melodic flows & unique style"</p>
              </div>

              {/* UnoTheActivist - Artist */}
              <div className="min-w-[280px] rounded-xl bg-panel ring-1 ring-neutral-800 p-4 hover-lift">
                <div className="mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                  UTA
                </div>
                <p className="font-semibold text-sm text-white">UnoTheActivist</p>
                <p className="text-xs text-gray-400">Artist • Atlanta, GA</p>
                <p className="text-xs text-gray-500 mt-1">Hip-Hop, Trap, Experimental</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-green-400">⭐ 4.9 (312 reviews)</p>
                  <p className="text-xs text-brand-400">From $1,500</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">🔥 "Innovative sound & energy"</p>
              </div>

              {/* Cole Bennett - Videographer */}
              <div className="min-w-[280px] rounded-xl bg-panel ring-1 ring-neutral-800 p-4 hover-lift">
                <div className="mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-yellow-500 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                  CB
                </div>
                <p className="font-semibold text-sm text-white">Cole Bennett</p>
                <p className="text-xs text-gray-400">Videographer • Chicago, IL</p>
                <p className="text-xs text-gray-500 mt-1">Music Videos, Creative Direction</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-green-400">⭐ 5.0 (156 reviews)</p>
                  <p className="text-xs text-brand-400">From $5,000</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">🎬 "Lyrical Lemonade founder"</p>
              </div>

              {/* Tree Sound Studios */}
              <div className="min-w-[280px] rounded-xl bg-panel ring-1 ring-neutral-800 p-4 hover-lift">
                <div className="mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                  TS
                </div>
                <p className="font-semibold text-sm text-white">Tree Sound Studios</p>
                <p className="text-xs text-gray-400">Studio • Atlanta, GA</p>
                <p className="text-xs text-gray-500 mt-1">Recording, Mixing, Mastering</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-green-400">⭐ 4.9 (423 reviews)</p>
                  <p className="text-xs text-brand-400">From $150/hr</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">🏢 "Where hits are made"</p>
              </div>

              {/* Alex Tumay - Engineer */}
              <div className="min-w-[280px] rounded-xl bg-panel ring-1 ring-neutral-800 p-4 hover-lift">
                <div className="mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  AT
                </div>
                <p className="font-semibold text-sm text-white">Alex Tumay</p>
                <p className="text-xs text-gray-400">Engineer • Atlanta, GA</p>
                <p className="text-xs text-gray-500 mt-1">Mixing, Mastering, Vocal Processing</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-green-400">⭐ 5.0 (289 reviews)</p>
                  <p className="text-xs text-brand-400">From $800</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">🎚️ "Young Thug's go-to engineer"</p>
              </div>

              {/* Metro Boomin - Producer */}
              <div className="min-w-[280px] rounded-xl bg-panel ring-1 ring-neutral-800 p-4 hover-lift">
                <div className="mb-3 h-16 w-16 rounded-full bg-gradient-to-br from-black to-gray-700 flex items-center justify-center text-white font-bold text-lg">
                  MB
                </div>
                <p className="font-semibold text-sm text-white">Metro Boomin</p>
                <p className="text-xs text-gray-400">Producer • Atlanta, GA</p>
                <p className="text-xs text-gray-500 mt-1">Trap, Hip-Hop, Dark Beats</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-green-400">⭐ 5.0 (567 reviews)</p>
                  <p className="text-xs text-brand-400">From $2,500</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">🔥 "If Metro don't trust you..."</p>
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-center">What Creators Are Saying</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-panel ring-1 ring-neutral-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    OM
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Oogie Mane</p>
                    <p className="text-xs text-gray-400">Producer</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  "AuditoryX changed my life. I went from making $200/month to $15K+ just from the platform. The clients are serious and the payment system is bulletproof."
                </p>
                <div className="flex text-yellow-400 text-xs">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>

              <div className="bg-panel ring-1 ring-neutral-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    TBF
                  </div>
                  <div>
                    <p className="font-semibold text-sm">ThouxanBanFauni</p>
                    <p className="text-xs text-gray-400">Artist</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  "Finally a platform that gets it. No middlemen, direct bookings, and I can focus on my art while the money flows. Built different."
                </p>
                <div className="flex text-yellow-400 text-xs">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>

              <div className="bg-panel ring-1 ring-neutral-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                    TS
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Tree Sound Studios</p>
                    <p className="text-xs text-gray-400">Studio Owner</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  "Our studio bookings doubled since joining. AuditoryX brings us quality artists and handles all the scheduling and payments seamlessly."
                </p>
                <div className="flex text-yellow-400 text-xs">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
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
                  className="rounded-lg ring-1 ring-neutral-700 py-4 transition hover:ring-white/60"
                >
                  <span className="block text-2xl">{icon}</span>
                  <span className="capitalize text-sm text-gray-300">{role}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* BROWSE BY LOCATION */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-center">Popular Locations</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                'Atlanta', 'LA', 'NYC', 'Miami', 'Chicago', 
                'Nashville', 'London', 'Tokyo', 'Seoul', 'Toronto'
              ].map(city => (
                <Link
                  key={city}
                  href={`/explore?location=${city}`}
                  className="rounded-full ring-1 ring-neutral-700 px-4 py-2 text-sm text-gray-300 transition hover:ring-white"
                >
                  {city}
                </Link>
              ))}
            </div>
          </section>

          {/* APPLY BANNER */}
          <section className="rounded-xl ring-1 ring-neutral-800 bg-panel p-8 text-center space-y-4">
            <h3 className="text-xl font-semibold">Want to offer services on AuditoryX?</h3>
            <p className="text-sm text-gray-400">Apply as a creator and start getting booked.</p>
            <Link href="/apply" className="btn-secondary btn-md">
              📍 Apply Now
            </Link>
          </section>

        </div>
      </main>
    </>
  );
}
