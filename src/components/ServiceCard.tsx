"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SendServiceRequest from "./SendServiceRequest";
import { Service } from "../src/types/service";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps): JSX.Element {
  const [showRequest, setShowRequest] = useState<boolean>(false);

  return (
    <motion.div 
      className="card-brutalist card-brutalist-interactive spacing-brutalist-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <h3 className="heading-brutalist-sm mb-4">{service.serviceName}</h3>
      <p className="text-brutalist-mono mb-6 opacity-80">{service.description}</p>
      <div className="mb-4">
        <p className="text-brutalist-mono mb-2">
          <span className="text-brutalist">PRICE:</span> ${service.price}
        </p>
        <p className="text-brutalist-mono opacity-60">
          BY: {service.displayName}
        </p>
      </div>
      <motion.button
        onClick={() => setShowRequest(!showRequest)}
        className={`w-full ${showRequest ? 'btn-brutalist-secondary' : 'btn-brutalist'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {showRequest ? "CLOSE" : "REQUEST SERVICE"}
      </motion.button>

      <AnimatePresence>
        {showRequest && (
          <motion.div 
            className="mt-6 pt-6 border-t-2 border-white"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <SendServiceRequest
              serviceId={service.id}
              recipientId={service.email}
              recipientRole="provider"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
