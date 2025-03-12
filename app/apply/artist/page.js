"use client";

export default function ApplyArtistPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
      <h1 className="text-4xl font-bold text-center">Apply as an Artist</h1>
      <p className="mt-4 text-lg text-gray-400 text-center max-w-lg">
        Join AuditoryX as an artist and gain access to exclusive collaborations, production, music distribution, and marketing support.
      </p>

      <form className="mt-6 flex flex-col space-y-4 w-full max-w-md">
        <input type="text" placeholder="Your Name" className="p-3 bg-gray-800 rounded-md text-white w-full" required />
        <input type="email" placeholder="Your Email" className="p-3 bg-gray-800 rounded-md text-white w-full" required />
        <input type="text" placeholder="Your Artist Name" className="p-3 bg-gray-800 rounded-md text-white w-full" required />
        <input type="text" placeholder="Spotify/Apple Music Link" className="p-3 bg-gray-800 rounded-md text-white w-full" required />
        <textarea placeholder="Tell us about your music and career goals" className="p-3 bg-gray-800 rounded-md text-white w-full h-32" required />
        <button type="submit" className="w-full px-6 py-3 bg-blue-500 rounded-md hover:bg-blue-600">
          Submit Application
        </button>
      </form>
    </div>
  );
}
