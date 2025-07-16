"use client";
import { useState } from "react";
import Link from "next/link";

export default function HeroSection(): JSX.Element {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  return (
    <section className="text-center py-20 bg-neutral-dark text-neutral-light">
      <h1 className="text-5xl font-bold">
        Auditory<span className="text-blue-500">X</span> Open Network
      </h1>
      <p className="text-lg text-neutral-400 mt-4">
        The premier platform connecting artists, engineers, videographers, studios, and creatives worldwide.
      </p>

      <div className="mt-6 flex justify-center space-x-4">
        <Link href="/book" className="btn btn-primary">
          I AM AN ARTIST
        </Link>
        
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="btn btn-secondary"
          >
            I AM A CREATIVE ▼
          </button>

          {dropdownOpen && (
            <div className="absolute mt-2 bg-neutral-dark text-neutral-light rounded-lg shadow-lg w-48">
              <Link href="/apply?role=producer" className="block px-4 py-2 hover:bg-neutral-800">🎹 Producer</Link>
              <Link href="/apply?role=engineer" className="block px-4 py-2 hover:bg-neutral-800">🎚 Engineer</Link>
              <Link href="/apply?role=videographer" className="block px-4 py-2 hover:bg-neutral-800">📽 Videographer</Link>
              <Link href="/apply?role=photographer" className="block px-4 py-2 hover:bg-neutral-800">📸 Photographer</Link>
              <Link href="/apply?role=graphic-designer" className="block px-4 py-2 hover:bg-neutral-800">🎨 Graphic Designer</Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
