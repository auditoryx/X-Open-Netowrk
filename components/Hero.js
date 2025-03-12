import Link from "next/link";

export default function Hero() {
  return (
    <section className="text-center text-white py-24 bg-gradient-to-b from-black to-gray-900">
      <h1 className="text-5xl font-bold">
        Auditory<span className="text-blue-500">X</span> Open Network
      </h1>
      <p className="mt-4 text-lg text-gray-400">
        The premier platform connecting artists, engineers, and creatives worldwide.
      </p>
      <div className="mt-6 space-x-4">
        <Link href="/apply/artist" className="px-6 py-3 text-lg font-medium bg-blue-500 rounded-md hover:bg-blue-600 transition">
          I AM AN ARTIST
        </Link>
        <Link href="/apply/creative" className="px-6 py-3 text-lg font-medium bg-gray-700 rounded-md hover:bg-gray-600 transition">
          I AM A CREATIVE ▼
        </Link>
      </div>
    </section>
  );
}
