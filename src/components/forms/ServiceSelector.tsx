'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ServiceCard from '../ServiceCard';

interface Service {
  id: string;
  title: string;
  description: string;
  price?: number;
  duration?: string;
  popular?: boolean;
}

interface ServiceSelectorProps {
  services: Service[];
  selectedServices: string[];
  onSelectionChange: (serviceIds: string[]) => void;
  multiSelect?: boolean;
  variant?: 'grid' | 'list';
  showPricing?: boolean;
  className?: string;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  selectedServices,
  onSelectionChange,
  multiSelect = true,
  variant = 'grid',
  showPricing = true,
  className = '',
}) => {
  const handleServiceToggle = (serviceId: string) => {
    if (multiSelect) {
      const newSelection = selectedServices.includes(serviceId)
        ? selectedServices.filter(id => id !== serviceId)
        : [...selectedServices, serviceId];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([serviceId]);
    }
  };

  const containerClasses = variant === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
    : 'space-y-3';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`${className}`}
    >
      <div className={containerClasses}>
        {services.map((service) => (
          <motion.div key={service.id} variants={itemVariants}>
            <ServiceCard
              service={service}
              isSelected={selectedServices.includes(service.id)}
              onToggle={() => handleServiceToggle(service.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* Selection Summary */}
      {selectedServices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-brand-500/10 border border-brand-500/20 rounded-lg"
        >
          <h4 className="text-brand-500 font-semibold mb-2">
            Selected Services ({selectedServices.length})
          </h4>
          <div className="space-y-1">
            {selectedServices.map(serviceId => {
              const service = services.find(s => s.id === serviceId);
              return service ? (
                <div key={serviceId} className="text-sm text-gray-300 flex justify-between">
                  <span>{service.title}</span>
                  {showPricing && service.price && (
                    <span className="text-brand-400">${service.price}</span>
                  )}
                </div>
              ) : null;
            })}
          </div>
          {showPricing && (
            <div className="mt-3 pt-2 border-t border-brand-500/20">
              <div className="flex justify-between font-semibold text-brand-400">
                <span>Total:</span>
                <span>
                  ${selectedServices.reduce((total, serviceId) => {
                    const service = services.find(s => s.id === serviceId);
                    return total + (service?.price || 0);
                  }, 0)}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ServiceSelector;
