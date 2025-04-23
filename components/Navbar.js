import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full px-6 py-4 border-b border-gray-800 flex items-center justify-between">
      <h1 className="text-2xl font-extrabold text-white">
        Auditory<span className="text-blue-500">X</span>
      </h1>
      <nav className="flex gap-8 text-sm font-medium text-white">
        <Link href="/about">About</Link>
        <Link href="/services">Services</Link>
        <Link href="/apply">Apply</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </header>
  );
}
