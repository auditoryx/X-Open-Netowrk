"use client";

export default function ApplyCreativePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
      <h1 className="text-4xl font-bold text-center">Apply as a Creative</h1>
      <p className="mt-4 text-lg text-gray-400 text-center max-w-lg">
        Join AuditoryX as a producer, engineer, videographer, or designer and connect with artists worldwide for paid collaborations.
      </p>

      <form className="mt-6 flex flex-col space-y-4 w-full max-w-md">
        <input type="text" placeholder="Your Name" className="p-3 bg-gray-800 rounded-md text-white w-full" required />
        <input type="email" placeholder="Your Email" className="p-3 bg-gray-800 rounded-md text-white w-full" required />
        <input type="text" placeholder="Your Specialty (e.g. Producer, Engineer, Videographer)" className="p-3 bg-gray-800 rounded-md text-white w-full" required />
        <input type="text" placeholder="Portfolio Link / Past Work" className="p-3 bg-gray-800 rounded-md text-white w-full" required />
        <textarea placeholder="Tell us about your experience and what you offer" className="p-3 bg-gray-800 rounded-md text-white w-full h-32" required />
        <button type="submit" className="w-full px-6 py-3 bg-gray-500 rounded-md hover:bg-gray-600">
          Submit Application
        </button>
      </form>
    </div>
  );
}
