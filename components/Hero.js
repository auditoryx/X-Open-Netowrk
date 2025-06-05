import Link from "next/link";

export default function Hero() {
  return (
    <section className="text-center text-neutral-light py-24 bg-gradient-to-b from-neutral-dark to-black">
      <h1 className="text-5xl font-bold">
        Auditory<span className="text-blue-500">X</span> Open Network
      </h1>
      <p className="mt-4 text-lg text-neutral-400">
        The premier platform connecting artists, engineers, and creatives worldwide.
      </p>
      <div className="mt-6 space-x-4">
        <Link href="/apply/artist" className="btn btn-primary text-lg">
          I AM AN ARTIST
        </Link>
        <Link href="/apply/creative" className="btn btn-secondary text-lg">
          I AM A CREATIVE ▼
        </Link>
      </div>
    </section>
  );
}
