import Link from "next/link";

export default function Hero() {
  return (
    <section className="text-center bg-brutalist-black border-brutalist-thick border-b-4 spacing-brutalist-xl">
      <h1 className="heading-brutalist-xl mb-8">
        AUDITORYX
      </h1>
      <p className="heading-brutalist-md mb-12">
        OPEN NETWORK
      </p>
      <p className="text-brutalist mb-16 max-w-3xl mx-auto">
        THE PREMIER PLATFORM CONNECTING ARTISTS, ENGINEERS, AND CREATIVES WORLDWIDE.
      </p>
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <Link href="/apply/artist" className="btn-brutalist">
          I AM AN ARTIST
        </Link>
        <Link href="/apply/creative" className="btn-brutalist-secondary">
          I AM A CREATIVE
        </Link>
      </div>
    </section>
  );
}
