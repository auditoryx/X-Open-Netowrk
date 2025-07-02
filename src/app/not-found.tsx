'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, HomeIcon, SearchIcon } from '@heroicons/react/24/outline';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white px-4">
      {/* 404 Animation */}
      <div className="text-center mb-8">
        <div className="relative">
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-pulse">
            404
          </h1>
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-semibold mt-4 mb-2">
          Oops! Page Not Found
        </h2>
        
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          The page you're looking for seems to have taken a different creative direction. 
          Let's get you back on track!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Go Back
        </button>
        
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <HomeIcon className="w-5 h-5" />
          Home
        </Link>
        
        <Link
          href="/search"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
        >
          <SearchIcon className="w-5 h-5" />
          Explore Creators
        </Link>
      </div>

      {/* Popular Links */}
      <div className="text-center">
        <p className="text-gray-500 mb-4">Popular destinations:</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
            Dashboard
          </Link>
          <Link href="/booking" className="text-blue-400 hover:text-blue-300 transition-colors">
            Book a Session
          </Link>
          <Link href="/about" className="text-blue-400 hover:text-blue-300 transition-colors">
            About
          </Link>
          <Link href="/help" className="text-blue-400 hover:text-blue-300 transition-colors">
            Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
