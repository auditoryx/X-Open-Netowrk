"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function ServicesPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6 text-center"
    >
      <h1 className="text-4xl font-bold">Our Services</h1>
      <p className="mt-4 text-lg text-gray-400 max-w-xl">
        Explore our range of services designed to support **artists, producers, and creatives** at every level.
      </p>

      <div className="mt-6 text-left space-y-4 max-w-lg">
        <div>
          🎼 <strong>Beat Marketplace</strong>  
          <p className="text-gray-400">Buy high-quality beats directly from top producers.</p>
        </div>

        <div>
          🎤 <strong>Buy a Feature from an Artist</strong>  
          <p className="text-gray-400">Secure official collaborations with **major & underground artists**.</p>
        </div>

        <div>
          🎚️ <strong>Mixing & Mastering</strong>  
          <p className="text-gray-400">Get your songs professionally mixed and mastered.</p>
        </div>

        <div>
          🎬 <strong>Music Video Services</strong>  
          <p className="text-gray-400">Hire videographers, editors, and creative directors.</p>
        </div>

        <div>
          🎙️ <strong>Studio Bookings</strong>  
          <p className="text-gray-400">Find and book **recording studios** in major cities worldwide.</p>
        </div>
      </div>

      <Link href="/apply">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 px-6 py-3 bg-blue-500 rounded-md hover:bg-blue-600 transition text-lg"
        >
          Get Started 🚀
        </motion.button>
      </Link>
    </motion.div>
  );
}
