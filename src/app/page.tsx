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

      <main className="min-h-screen bg-brutalist-black text-white">
        <div className="mx-auto max-w-7xl">

          {/* HERO */}
          <section className="text-center bg-brutalist-black border-b-4 border-white spacing-brutalist-xl">
            <h1 className="heading-brutalist-xl mb-8">
              The Global Creative Network Built for Music
            </h1>
            <p className="text-brutalist mb-16 max-w-4xl mx-auto">
              BOOK TALENT, SELL YOUR SERVICES, AND GET PAID.
            </p>
            <div className="flex flex-col items-center gap-8">
              {/* Primary CTA */}
              <Link 
                href="/explore" 
                className="btn-brutalist-lg"
              >
                🔍 EXPLORE 10K+ CREATORS
              </Link>
              <p className="text-brutalist-mono opacity-60">NO SIGNUP REQUIRED • BROWSE FREELY</p>
              
              {/* Secondary CTA */}
              <Link 
                href="/apply" 
                className="btn-brutalist-secondary"
              >
                I'M A CREATOR →
              </Link>
            </div>
          </section>

          {/* FEATURE TILES */}
          <section className="grid-brutalist grid-cols-1 md:grid-cols-2 lg:grid-cols-3 spacing-brutalist-lg">
            {[
              {
                title: '🎤 BOOK FEATURES FROM ARTISTS',
                desc: 'GET VERSES FROM THOUXANBANFAUNI, UNOTHEACTIVIST, AND 500+ VERIFIED ARTISTS. FROM $800-$5K PER FEATURE.',
              },
              {
                title: '🎥 HIRE TOP VIDEOGRAPHERS',
                desc: 'WORK WITH COLE BENNETT, ZACH HURTH, AND ELITE DIRECTORS. MUSIC VIDEOS STARTING AT $2K.',
              },
              {
                title: '🏢 BOOK PREMIUM STUDIOS',
                desc: 'RECORD AT TREE SOUND, STANKONIA, AND 200+ PRO STUDIOS. $100-500/HOUR WITH ENGINEER INCLUDED.',
              },
              {
                title: '🎚 WORLD-CLASS ENGINEERS',
                desc: 'MIX WITH ALEX TUMAY, LUCA PRETOLESI, AND GRAMMY-WINNING ENGINEERS. $500-2K PER SONG.',
              },
              {
                title: '🎼 EXCLUSIVE BEATS',
                desc: 'BUY FROM METRO BOOMIN, OOGIE MANE, AND RISING PRODUCERS. EXCLUSIVE RIGHTS $300-10K.',
              },
              {
                title: '🌍 GLOBAL NETWORK',
                desc: 'ACCESS 10K+ CREATORS ACROSS 50+ COUNTRIES. ATLANTA, LA, NYC, LONDON, TOKYO, AND BEYOND.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="card-brutalist spacing-brutalist-md hover-brutal"
              >
                <h2 className="heading-brutalist-sm mb-4">{f.title}</h2>
                <p className="text-brutalist-mono opacity-80">{f.desc}</p>
              </div>
            ))}
          </section>

          {/* HOW IT WORKS */}
          <section className="spacing-brutalist-lg">
            <h2 className="heading-brutalist-lg text-center mb-12">HOW AUDITORYX WORKS</h2>
            <div className="card-brutalist spacing-brutalist-md max-w-4xl mx-auto">
              <ol className="space-y-6">
                {[
                  'CREATORS APPLY BY ROLE (ARTIST, ENGINEER, VIDEOGRAPHER, STUDIO, ETC.)',
                  'ADMINS REVIEW AND APPROVE BASED ON QUALITY AND AVAILABILITY',
                  'APPROVED CREATORS LIST SERVICES WITH PRICING, SAMPLES, CALENDAR',
                  'CLIENTS BROWSE, FILTER, AND BOOK INSTANTLY',
                  'CHAT, SIGN CONTRACTS, AND COLLABORATE THROUGH THE PLATFORM',
                  'FUNDS ARE HELD IN ESCROW AND RELEASED ON DELIVERY'
                ].map((step, index) => (
                  <li key={index} className="text-brutalist-mono flex items-start gap-4">
                    <span className="text-brutalist font-black text-2xl">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* RECENT ACTIVITY */}
          <section className="card-brutalist spacing-brutalist-md text-center">
            <h3 className="heading-brutalist-sm mb-8">🔥 LIVE ACTIVITY</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 bg-white rounded-none"></div>
                <span className="text-brutalist-mono">23 CREATORS JOINED TODAY</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 bg-white rounded-none"></div>
                <span className="text-brutalist-mono">156 BOOKINGS THIS WEEK</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 bg-white rounded-none"></div>
                <span className="text-brutalist-mono">$2.3M PAID OUT THIS MONTH</span>
              </div>
            </div>
          </section>

          {/* FEATURED CREATORS (real data) */}
          <section className="spacing-brutalist-lg">
            <h2 className="heading-brutalist-lg mb-12">FEATURED CREATORS</h2>
            <div className="grid-brutalist grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {/* Oogie Mane - Producer */}
              <Link href="/profile/oogie-mane" className="card-brutalist card-brutalist-interactive spacing-brutalist-md">
                <div className="mb-6 h-16 w-16 bg-white flex items-center justify-center text-black font-black text-xl">
                  OM
                </div>
                <p className="heading-brutalist-sm mb-2">OOGIE MANE</p>
                <p className="text-brutalist-mono mb-2">PRODUCER • ATLANTA, GA</p>
                <p className="text-brutalist-mono mb-4 opacity-60">TRAP, HIP-HOP, DRILL</p>
                <div className="flex justify-between mb-4">
                  <p className="text-brutalist-mono">⭐ 4.9 (247)</p>
                  <p className="text-brutalist">FROM $500</p>
                </div>
                <p className="text-brutalist-mono opacity-80">🎵 "KNOWN FOR HARD-HITTING 808S"</p>
              </Link>

              {/* ThouxanBanFauni - Artist */}
              <Link href="/profile/thouxanbanfauni" className="card-brutalist card-brutalist-interactive spacing-brutalist-md">
                <div className="mb-6 h-16 w-16 bg-white flex items-center justify-center text-black font-black text-lg">
                  TBF
                </div>
                <p className="heading-brutalist-sm mb-2">THOUXANBANFAUNI</p>
                <p className="text-brutalist-mono mb-2">ARTIST • VIRGINIA</p>
                <p className="text-brutalist-mono mb-4 opacity-60">HIP-HOP, CLOUD RAP, UNDERGROUND</p>
                <div className="flex justify-between mb-4">
                  <p className="text-brutalist-mono">⭐ 4.8 (189)</p>
                  <p className="text-brutalist">FROM $1,200</p>
                </div>
                <p className="text-brutalist-mono opacity-80">🎤 "MELODIC FLOWS & UNIQUE STYLE"</p>
              </Link>

              {/* UnoTheActivist - Artist */}
              <Link href="/profile/unotheactivist" className="card-brutalist card-brutalist-interactive spacing-brutalist-md">
                <div className="mb-6 h-16 w-16 bg-white flex items-center justify-center text-black font-black text-lg">
                  UTA
                </div>
                <p className="heading-brutalist-sm mb-2">UNOTHEACTIVIST</p>
                <p className="text-brutalist-mono mb-2">ARTIST • ATLANTA, GA</p>
                <p className="text-brutalist-mono mb-4 opacity-60">HIP-HOP, TRAP, EXPERIMENTAL</p>
                <div className="flex justify-between mb-4">
                  <p className="text-brutalist-mono">⭐ 4.9 (312)</p>
                  <p className="text-brutalist">FROM $1,500</p>
                </div>
                <p className="text-brutalist-mono opacity-80">🔥 "INNOVATIVE SOUND & ENERGY"</p>
              </Link>

              {/* Cole Bennett - Videographer */}
              <Link href="/profile/cole-bennett" className="card-brutalist card-brutalist-interactive spacing-brutalist-md">
                <div className="mb-6 h-16 w-16 bg-white flex items-center justify-center text-black font-black text-lg">
                  CB
                </div>
                <p className="heading-brutalist-sm mb-2">COLE BENNETT</p>
                <p className="text-brutalist-mono mb-2">VIDEOGRAPHER • CHICAGO, IL</p>
                <p className="text-brutalist-mono mb-4 opacity-60">MUSIC VIDEOS, CREATIVE DIRECTION</p>
                <div className="flex justify-between mb-4">
                  <p className="text-brutalist-mono">⭐ 5.0 (156)</p>
                  <p className="text-brutalist">FROM $5,000</p>
                </div>
                <p className="text-brutalist-mono opacity-80">🎬 "LYRICAL LEMONADE FOUNDER"</p>
              </Link>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section className="spacing-brutalist-lg">
            <h2 className="heading-brutalist-lg text-center mb-12">WHAT CREATORS ARE SAYING</h2>
            <div className="grid-brutalist grid-cols-1 md:grid-cols-3">
              <div className="card-brutalist spacing-brutalist-md">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white flex items-center justify-center text-black font-black text-sm">
                    OM
                  </div>
                  <div>
                    <p className="text-brutalist">OOGIE MANE</p>
                    <p className="text-brutalist-mono opacity-60">PRODUCER</p>
                  </div>
                </div>
                <p className="text-brutalist-mono mb-4 opacity-80">
                  "AUDITORYX CHANGED MY LIFE. I WENT FROM MAKING $200/MONTH TO $15K+ JUST FROM THE PLATFORM. THE CLIENTS ARE SERIOUS AND THE PAYMENT SYSTEM IS BULLETPROOF."
                </p>
                <div className="text-brutalist">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>

              <div className="card-brutalist spacing-brutalist-md">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white flex items-center justify-center text-black font-black text-sm">
                    TBF
                  </div>
                  <div>
                    <p className="text-brutalist">THOUXANBANFAUNI</p>
                    <p className="text-brutalist-mono opacity-60">ARTIST</p>
                  </div>
                </div>
                <p className="text-brutalist-mono mb-4 opacity-80">
                  "FINALLY A PLATFORM THAT GETS IT. NO MIDDLEMEN, DIRECT BOOKINGS, AND I CAN FOCUS ON MY ART WHILE THE MONEY FLOWS. BUILT DIFFERENT."
                </p>
                <div className="text-brutalist">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>

              <div className="card-brutalist spacing-brutalist-md">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white flex items-center justify-center text-black font-black text-sm">
                    TS
                  </div>
                  <div>
                    <p className="text-brutalist">TREE SOUND STUDIOS</p>
                    <p className="text-brutalist-mono opacity-60">STUDIO OWNER</p>
                  </div>
                </div>
                <p className="text-brutalist-mono mb-4 opacity-80">
                  "OUR STUDIO BOOKINGS DOUBLED SINCE JOINING. AUDITORYX BRINGS US QUALITY ARTISTS AND HANDLES ALL THE SCHEDULING AND PAYMENTS SEAMLESSLY."
                </p>
                <div className="text-brutalist">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
            </div>
          </section>

          {/* BROWSE BY ROLE */}
          <section className="spacing-brutalist-lg">
            <h2 className="heading-brutalist-lg text-center mb-12">BROWSE BY ROLE</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
              {[
                { icon: '🎤', role: 'ARTIST' },
                { icon: '🎧', role: 'PRODUCER' },
                { icon: '🎚️', role: 'ENGINEER' },
                { icon: '🎥', role: 'VIDEOGRAPHER' },
                { icon: '🏢', role: 'STUDIO' },
              ].map(({ icon, role }) => (
                <Link
                  key={role}
                  href={`/explore?role=${role.toLowerCase()}`}
                  className="card-brutalist card-brutalist-interactive spacing-brutalist-md text-center"
                >
                  <span className="block text-4xl mb-4">{icon}</span>
                  <span className="text-brutalist">{role}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* BROWSE BY LOCATION */}
          <section className="spacing-brutalist-lg">
            <h2 className="heading-brutalist-lg text-center mb-12">POPULAR LOCATIONS</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                'ATLANTA', 'LA', 'NYC', 'MIAMI', 'CHICAGO', 
                'NASHVILLE', 'LONDON', 'TOKYO', 'SEOUL', 'TORONTO'
              ].map(city => (
                <Link
                  key={city}
                  href={`/explore?location=${city}`}
                  className="btn-brutalist-secondary"
                >
                  {city}
                </Link>
              ))}
            </div>
          </section>

          {/* APPLY BANNER */}
          <section className="card-brutalist spacing-brutalist-lg text-center">
            <h3 className="heading-brutalist-md mb-6">WANT TO OFFER SERVICES ON AUDITORYX?</h3>
            <p className="text-brutalist-mono mb-8 opacity-80">APPLY AS A CREATOR AND START GETTING BOOKED.</p>
            <Link href="/apply" className="btn-brutalist">
              📍 APPLY NOW
            </Link>
          </section>

        </div>
      </main>
    </>
  );
}
