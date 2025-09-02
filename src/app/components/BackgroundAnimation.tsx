"use client";

import { motion } from "framer-motion";

export default function BackgroundAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black"
    >
      <motion.div
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          backgroundSize: ["200% 200%", "400% 400%", "200% 200%"],
        }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Infinity,
        }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0)_0%,_rgba(17,24,39,0.2)_100%)]"
      />
    </motion.div>
  );
}
