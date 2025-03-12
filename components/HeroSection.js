"use client";
import { useState } from "react";
import Link from "next/link";

export default function HeroSection() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <section className="text-center py-20 bg-black text-white">
      <h1 className="text-5xl font-bold">
        Auditory<span className="text-blue-500">X</span> Open Network
      </h1>
      <p className="text-lg text-gray-400 mt-4">
        The premier platform connecting artists, engineers, videographers, studios, and creatives worldwide.
      </p>

      <div className="mt-6 flex justify-center space-x-4">
        <Link href="/book" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg">
          I AM AN ARTIST
        </Link>
        
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)} 
            className="px-6 py-3 bg-gray-700 hover:bg-gray-800 transition text-white rounded-lg"
          >
            I AM A CREATIVE ▼
          </button>

          {dropdownOpen && (
            <div className="absolute mt-2 bg-gray-800 text-white rounded-lg shadow-lg w-48">
              <Link href="/apply?role=producer" className="block px-4 py-2 hover:bg-gray-700">🎹 Producer</Link>
              <Link href="/apply?role=engineer" className="block px-4 py-2 hover:bg-gray-700">🎚 Engineer</Link>
              <Link href="/apply?role=videographer" className="block px-4 py-2 hover:bg-gray-700">📽 Videographer</Link>
              <Link href="/apply?role=photographer" className="block px-4 py-2 hover:bg-gray-700">📸 Photographer</Link>
              <Link href="/apply?role=graphic-designer" className="block px-4 py-2 hover:bg-gray-700">🎨 Graphic Designer</Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
