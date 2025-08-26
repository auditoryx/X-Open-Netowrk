"use client";
import { motion } from "framer-motion";
import type { Service } from "@/types/service";

interface ServiceCardProps {
  service: Service;
  isSelected?: boolean;
  onToggle?: () => void;
}

export default function ServiceCard({ service, isSelected, onToggle }: ServiceCardProps) {
  return (
    <motion.div
      className={`card-brutalist spacing-brutalist-md border ${isSelected ? 'border-blue-500' : 'border-neutral-800'}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onToggle}
      role="button"
      aria-pressed={!!isSelected}
      tabIndex={0}
    >
      <h3 className="heading-brutalist-3">{service.title}</h3>
      <p className="text-neutral-300">{service.description}</p>
      {service.price && <p className="mt-2 font-medium">${service.price}</p>}
    </motion.div>
  );
}
