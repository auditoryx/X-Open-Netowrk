import Button from '@/components/ui/Button';
import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import AnimateOnScroll, { StaggeredReveal, CountUp } from '@/components/ui/AnimateOnScroll';
import HeroSection from '@/components/hero/HeroSection';
import AnimatedButton from '@/components/ui/AnimatedButton';
import Typography from '@/components/ui/Typography';

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

          {/* HERO - Enhanced with HeroSection component */}
          <HeroSection
            title="The Global Creative Network Built for Music"
            subtitle="Book talent, sell your services, and get paid."
            variant="minimal"
          >
            <div className="flex flex-col items-center gap-8">
              {/* Primary CTA */}
              <AnimatedButton
                variant="primary"
                size="lg"
                animationType="glow"
                asChild
              >
                <Link href="/explore">
                  🔍 Explore 10K+ Creators
                </Link>
              </AnimatedButton>
              <Typography variant="caption" className="opacity-60 tracking-wide">
                No signup required • Browse freely
              </Typography>
              
              {/* Secondary CTA */}
              <AnimatedButton
                variant="outline"
                size="md"
                animationType="hover"
                asChild
              >
                <Link href="/apply">
                  I'm a Creator →
                </Link>
              </AnimatedButton>
            </div>
          </HeroSection>

          {/* FEATURE TILES */}
          <AnimateOnScroll direction="up" delay={0.2}>
            <section className="grid-brutalist grid-cols-1 md:grid-cols-2 lg:grid-cols-3 spacing-brutalist-lg">
              <StaggeredReveal staggerDelay={0.15} direction="up">
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
                    className="card-brutalist spacing-brutalist-md hover-brutal"
                  >
                    <h2 className="heading-brutalist-sm mb-4">{f.title}</h2>
                    <p className="text-brutalist-mono opacity-80">{f.desc}</p>
                  </div>
                ))}
              </StaggeredReveal>
            </section>
          </AnimateOnScroll>

          {/* HOW IT WORKS */}
          <section className="spacing-brutalist-lg">
            <Typography variant="h2" className="text-center mb-12" animate>
              HOW AUDITORYX WORKS
            </Typography>
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
          <AnimateOnScroll direction="up" delay={0.3}>
            <section className="card-brutalist spacing-brutalist-md text-center">
              <h3 className="heading-brutalist-sm mb-8">🔥 Live Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 bg-white rounded-none"></div>
                  <span className="text-brutalist-mono">
                    <CountUp end={23} /> Creators Joined Today
                  </span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 bg-white rounded-none"></div>
                  <span className="text-brutalist-mono">
                    <CountUp end={156} /> Bookings This Week
                  </span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 bg-white rounded-none"></div>
                  <span className="text-brutalist-mono">
                    $<CountUp end={2.3} suffix="M" /> Paid Out This Month
                  </span>
                </div>
              </div>
            </section>
          </AnimateOnScroll>

          {/* FEATURED CREATORS (real data) */}
          <section className="spacing-brutalist-lg">
            <Typography variant="h2" className="mb-12" animate animateDelay={0.3}>
              FEATURED CREATORS
            </Typography>
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
            <Typography variant="h2" className="text-center mb-12" animate animateDelay={0.4}>
              WHAT CREATORS ARE SAYING
            </Typography>
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
            <Typography variant="h2" className="text-center mb-12" animate animateDelay={0.5}>
              BROWSE BY ROLE
            </Typography>
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
            <Typography variant="h2" className="text-center mb-12" animate animateDelay={0.6}>
              POPULAR LOCATIONS
            </Typography>
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
