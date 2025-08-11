'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AnimatedCheckbox from './AnimatedCheckbox';

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
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={selectedServices.includes(service.id)}
            onToggle={() => handleServiceToggle(service.id)}
            variant={variant}
            showPricing={showPricing}
            multiSelect={multiSelect}
            variants={itemVariants}
          />
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

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onToggle: () => void;
  variant: 'grid' | 'list';
  showPricing: boolean;
  multiSelect: boolean;
  variants: any;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isSelected,
  onToggle,
  variant,
  showPricing,
  multiSelect,
  variants,
}) => {
  const cardClasses = variant === 'grid'
    ? 'p-6 h-full'
    : 'p-4 flex items-start';

  const cardVariants = {
    unselected: {
      backgroundColor: 'rgba(17, 24, 39, 0.5)',
      borderColor: 'rgba(75, 85, 99, 0.3)',
      scale: 1
    },
    selected: {
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      borderColor: '#8B5CF6',
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    hover: {
      scale: 1.03,
      backgroundColor: 'rgba(75, 85, 99, 0.1)',
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      variants={variants}
      className="relative"
    >
      <motion.div
        variants={cardVariants}
        animate={isSelected ? 'selected' : 'unselected'}
        whileHover={!isSelected ? 'hover' : undefined}
        whileTap={{ scale: 0.98 }}
        onClick={onToggle}
        className={`
          relative cursor-pointer border-2 rounded-xl
          transition-all duration-200
          ${cardClasses}
        `}
      >
        {/* Popular Badge */}
        {service.popular && (
          <motion.div
            className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            Popular
          </motion.div>
        )}

        <div className={`flex ${variant === 'grid' ? 'flex-col h-full' : 'flex-row items-start'}`}>
          {/* Checkbox */}
          <div className={`${variant === 'grid' ? 'mb-4' : 'mr-4 mt-1'}`}>
            <AnimatedCheckbox
              id={`service-${service.id}`}
              checked={isSelected}
              onChange={onToggle}
              variant={isSelected ? 'success' : 'default'}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-2">
              {service.title}
            </h3>
            <p className="text-gray-400 text-sm mb-3">
              {service.description}
            </p>

            {/* Service Details */}
            <div className={`
              flex items-center justify-between text-sm
              ${variant === 'grid' ? 'mt-auto' : ''}
            `}>
              <div className="space-y-1">
                {service.duration && (
                  <div className="text-gray-500">
                    Duration: {service.duration}
                  </div>
                )}
              </div>
              
              {showPricing && service.price && (
                <motion.div
                  className="text-right"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="text-2xl font-bold text-brand-400">
                    ${service.price}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-brand-500/5 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default ServiceSelector;