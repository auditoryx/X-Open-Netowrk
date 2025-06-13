'use client';
import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  openGraph: {
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
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
        />
      </Head>

      <main className="min-h-screen bg-black text-white px-6 py-16">
        <div className="mx-auto max-w-6xl space-y-20">

          {/* HERO */}
          <section className="text-center space-y-4 bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-500 text-white rounded-xl py-14 px-6">
            <h1 className="text-4xl font-bold">The Global Creative Network Built for Music.</h1>
            <p className="text-lg text-gray-200">Book talent, sell your services, and get paid.</p>
            <div className="flex justify-center gap-4 pt-6">
              <Link href="/explore" className="btn btn-primary">
                🔍 Explore Creators
              </Link>
              <Link href="/apply" className="btn btn-secondary">
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
              <div
                key={f.title}
                className="min-h-[160px] rounded-xl bg-neutral-900 border border-neutral-800 p-6 space-y-2 hover:border-white/20 transition"
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

          {/* FEATURED CREATORS (placeholder) */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Featured Creators</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="min-w-[220px] rounded-xl bg-neutral-900 border border-neutral-800 p-4"
                >
                  <div className="mb-2 h-12 w-12 rounded-full bg-white" />
                  <p className="font-semibold text-sm">Creator {i + 1}</p>
                  <p className="text-xs text-gray-400">Producer • Tokyo</p>
                  <p className="mt-1 text-xs text-green-400">⭐ 4.8</p>
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
                  className="rounded-lg border border-neutral-700 py-4 transition hover:border-white/60"
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
              {['Tokyo', 'LA', 'Seoul', 'London', 'NYC'].map(city => (
                <Link
                  key={city}
                  href={`/explore?location=${city}`}
                  className="rounded-full border border-neutral-700 px-4 py-2 text-sm text-gray-300 transition hover:border-white"
                >
                  {city}
                </Link>
              ))}
            </div>
          </section>

          {/* APPLY BANNER */}
          <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center space-y-4">
            <h3 className="text-xl font-semibold">Want to offer services on AuditoryX?</h3>
            <p className="text-sm text-gray-400">Apply as a creator and start getting booked.</p>
            <Link
              href="/apply"
              className="inline-block rounded border px-6 py-2 transition hover:bg-white hover:text-black"
            >
              📍 Apply Now
            </Link>
          </section>

        </div>
      </main>
    </>
  );
}
