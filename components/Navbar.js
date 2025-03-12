"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolling(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full top-0 left-0 z-50 transition-all ${scrolling ? "bg-black/90 backdrop-blur-lg shadow-lg" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white">
          Auditory<span className="text-blue-500">X</span>
        </Link>
        <div className="hidden md:flex space-x-8">
          <Link href="/about" className="text-white hover:text-blue-400 transition">About</Link>
          <Link href="/services" className="text-white hover:text-blue-400 transition">Services</Link>
          <Link href="/apply" className="text-white hover:text-blue-400 transition">Apply</Link>
          <Link href="/contact" className="text-white hover:text-blue-400 transition">Contact</Link>
        </div>
      </div>
    </nav>
  );
}
