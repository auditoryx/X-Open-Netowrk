"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <main className="bg-black text-white min-h-screen px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-16">
        <header>
          <h1 className="text-5xl font-extrabold tracking-tight">
            Auditory<span className="text-blue-500">X</span>
          </h1>
          <nav className="flex gap-8 mt-2 text-sm font-medium">
            <Link href="/about">About</Link>
            <Link href="/services">Services</Link>
            <Link href="/apply">Apply</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </header>

        <section>
          <h2 className="text-4xl font-bold">AuditoryX Open Network</h2>
          <p className="text-gray-400 mt-2 text-lg">
            Powering the Future of Music Collaboration. Instantly Connect, Create, and Monetize.
          </p>
          <div className="flex gap-4 mt-6 flex-wrap">
            <button className="btn btn-primary">I AM AN ARTIST</button>
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="btn btn-secondary">
                I AM A CREATIVE ▾
              </button>
              {dropdownOpen && (
                <div className="absolute bg-gray-900 p-2 mt-2 rounded-lg shadow-lg">
                  <a href="#" className="block px-3 py-1 hover:bg-gray-800 rounded">Engineer</a>
                  <a href="#" className="block px-3 py-1 hover:bg-gray-800 rounded">Producer</a>
                  <a href="#" className="block px-3 py-1 hover:bg-gray-800 rounded">Studio</a>
                  <a href="#" className="block px-3 py-1 hover:bg-gray-800 rounded">Videographer</a>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <img src="/images/feature1.png" alt="Feature 1" className="rounded-lg" />
          <img src="/images/feature2.png" alt="Feature 2" className="rounded-lg" />
          <img src="/images/feature3.png" alt="Feature 3" className="rounded-lg" />
        </section>

        <section className="max-w-md">
          <h3 className="text-2xl font-semibold">Login</h3>
          <form className="mt-4 flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              className="bg-gray-900 p-3 rounded-md text-white border border-gray-700"
            />
            <input
              type="password"
              placeholder="Password"
              className="bg-gray-900 p-3 rounded-md text-white border border-gray-700"
            />
            <button type="submit" className="btn btn-primary w-full">Login</button>
          </form>
          <p className="text-sm mt-3 text-gray-400">
            Need an account? <Link href="/signup" className="text-blue-400 underline">Sign up</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
