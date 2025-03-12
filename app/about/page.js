"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6 text-center"
    >
      <h1 className="text-4xl font-bold">About AuditoryX Open Network</h1>
      <p className="mt-4 text-lg text-gray-400 max-w-xl">
        AuditoryX Open Network is a **global platform** connecting **artists, producers, engineers, and creatives worldwide**.
      </p>

      <p className="mt-4 text-lg text-gray-400 max-w-xl">
        Whether you’re looking to **collaborate, sell beats, book production services, or buy a feature from top artists**, AuditoryX provides the **tools, resources, and industry access** to elevate your career.
      </p>

      <Link href="/apply">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 px-6 py-3 bg-blue-500 rounded-md hover:bg-blue-600 transition text-lg"
        >
          Get Started Now 🚀
        </motion.button>
      </Link>
    </motion.div>
  );
}
