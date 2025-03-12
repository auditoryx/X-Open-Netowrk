import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
        <Link href="/" className="text-2xl font-bold text-white">
          Auditory<span className="text-blue-500">X</span>
        </Link>
        <div className="flex space-x-6 text-sm">
          <Link href="/about" className="hover:text-blue-400 transition">About</Link>
          <Link href="/services" className="hover:text-blue-400 transition">Services</Link>
          <Link href="/apply" className="hover:text-blue-400 transition">Apply</Link>
          <Link href="/contact" className="hover:text-blue-400 transition">Contact</Link>
        </div>
        <div className="flex space-x-4">
          <a href="https://twitter.com/auditoryx" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition">
            🐦 Twitter
          </a>
          <a href="https://instagram.com/auditoryx" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition">
            📸 Instagram
          </a>
        </div>
      </div>
      <div className="mt-8 text-center text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} AuditoryX. All Rights Reserved.
      </div>
    </footer>
  );
}
