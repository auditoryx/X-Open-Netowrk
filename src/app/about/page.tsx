'use client';


export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-20 space-y-10">
        <h1 className="text-4xl font-bold text-center">Our Mission</h1>

        <p className="text-gray-300 text-lg leading-relaxed">
          AuditoryX was built for the creators the industry left behind — the ones doing everything themselves.
          We’re here for the artists tired of selling features through DMs, for the producers posting beats on
          Instagram stories hoping someone bites, and for the engineers, videographers, and studios who never get credit.
        </p>

        <p className="text-gray-300 text-lg leading-relaxed">
          The music industry has been gatekept for too long. Success shouldn’t depend on who you know, how many followers you have,
          or if you&apos;re part of the right clique. We believe opportunity should be **accessible**, **fair**, and **global**.
        </p>

        <p className="text-gray-300 text-lg leading-relaxed">
          That’s why we created the <strong>AuditoryX Open Network</strong> — a platform where creators can be creators. 
          Where you can list services, get booked, and grow — without chasing DMs, relying on middlemen, or selling yourself through algorithms.
        </p>

        <h2 className="text-2xl font-semibold pt-6">What We Stand For</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>Let artists be artists — not marketers, schedulers, or negotiators.</li>
          <li>Put power in the hands of creators, not platforms or managers.</li>
          <li>Build a trusted global network for music — across roles, cities, and styles.</li>
          <li>Make professional collaboration accessible — from Tokyo to Atlanta to Paris.</li>
        </ul>

        <div className="border-t border-neutral-800 pt-8">
          <p className="text-gray-400 italic text-sm text-center">
            This is just the beginning. AuditoryX isn’t just a platform — it’s a movement.
          </p>
        </div>
      </div>
    </div>
  );
}
