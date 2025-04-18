"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import CreativeDropdown from "./components/CreativeDropdown";
import AuthModal from "./components/AuthModal";

export default function Home() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6"
    >
      <motion.h1 
        initial={{ opacity: 0, scale: 0.8 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.7 }}
        className="text-5xl font-extrabold tracking-tight text-center"
      >
        Auditory<span className="text-blue-500">X</span> Open Network
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3, duration: 0.7 }}
        className="mt-4 text-lg text-gray-400 leading-relaxed text-center max-w-2xl"
      >
        Powering the Future of Music Collaboration. Instantly Connect, Create, and Monetize.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.6, duration: 0.7 }}
        className="mt-6 flex flex-wrap justify-center gap-4"
      >
        <Link href="/apply/artist">
          <button className="btn btn-primary">I AM AN ARTIST</button>
        </Link>
        <CreativeDropdown />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay: 0.9, duration: 0.7 }}
        className="mt-8 flex space-x-4"
      >
        <img src="/images/feature1.png" alt="Feature" className="w-16 h-16 opacity-90" />
        <img src="/images/feature2.png" alt="Feature" className="w-16 h-16 opacity-90" />
        <img src="/images/feature3.png" alt="Feature" className="w-16 h-16 opacity-90" />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 1.2, duration: 0.7 }}
        className="mt-10"
      >
        <AuthModal />
      </motion.div>
    </motion.div>
  );
}
