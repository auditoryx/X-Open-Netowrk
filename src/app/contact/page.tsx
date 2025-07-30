'use client';

import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
            <div className="max-w-3xl mx-auto px-6 py-16 text-center space-y-8">
        <h1 className="text-4xl font-bold">Contact AuditoryX</h1>
        <p className="text-lg text-gray-400">
          Got a question, partnership idea, or want to join the movement?
        </p>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
          <p className="text-gray-300">
            📧 For support or general inquiries:  
            <br />
            <a href="mailto:support@auditoryx.com" className="underline text-white">
              support@auditoryx.com
            </a>
          </p>

          <p className="text-gray-300">
            📸 Follow us on Instagram:  
            <br />
            <Link
              href="https://instagram.com/auditory.x"
              target="_blank"
              className="underline text-blue-400"
            >
              @auditory.x
            </Link>
          </p>

          <p className="text-gray-300">
            🗺️ For press, partnerships, or collaborations, reach out directly to our team.
          </p>
        </div>

        <p className="text-sm text-gray-500">
          We usually reply within 24–48 hours.
        </p>
        
        <button
          onClick={() => console.log('Smoke test: Contact page tested')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
          data-testid="smoke"
        >
          Test Contact Page
        </button>
      </div>
    </div>
  );
}
