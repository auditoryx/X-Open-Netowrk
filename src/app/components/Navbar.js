"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full py-4 px-8 flex justify-between items-center bg-black text-white border-b border-gray-800 shadow-lg z-50 animate-fadeIn">
      {/* Logo */}
      <Link href="/">
        <h1 className="text-3xl font-poppins font-bold cursor-pointer transition-all duration-300 hover:scale-105">
          Auditory<span className="text-blue-500">X</span>
        </h1>
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex space-x-8">
        <NavItem href="/about" label="About" />
        <NavItem href="/services" label="Services" />
        <NavItem href="/apply" label="Apply" />
        <NavItem href="/contact" label="Contact" />
      </div>

      {/* Mobile Menu Placeholder */}
      <div className="md:hidden">
        {/* Future Mobile Menu Button */}
      </div>
    </nav>
  );
}

function NavItem({ href, label }) {
  return (
    <Link href={href} className="text-lg font-inter text-gray-300 hover:text-white transition-all duration-300 hover:scale-105">
      {label}
    </Link>
  );
}
