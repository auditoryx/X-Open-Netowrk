"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CreativeDropdown(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-3 bg-gray-700 rounded-md hover:bg-gray-600 transition"
      >
        I AM A CREATIVE ▼
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="absolute left-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg overflow-hidden z-10"
        >
          <Link href="/apply/creative?role=producer">
            <div className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Producer</div>
          </Link>
          <Link href="/apply/creative?role=engineer">
            <div className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Engineer</div>
          </Link>
          <Link href="/apply/creative?role=videographer">
            <div className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Videographer</div>
          </Link>
          <Link href="/apply/creative?role=designer">
            <div className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Designer</div>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
