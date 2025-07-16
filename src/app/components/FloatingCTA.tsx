"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function FloatingCTA(): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed bottom-6 right-6 md:right-12 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg text-lg transition"
    >
      <Link href="/apply">
        Apply Now 🚀
      </Link>
    </motion.div>
  );
}
