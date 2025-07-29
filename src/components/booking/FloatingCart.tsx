'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ShoppingCart, X, Plus } from 'lucide-react';

interface FloatingCartProps {
  onBooking?: () => void;
  creatorName?: string;
  servicePrice?: number;
  className?: string;
}

interface CartItem {
  id: string;
  serviceName: string;
  price: number;
  creatorName: string;
}

export default function FloatingCart({ 
  onBooking, 
  creatorName, 
  servicePrice,
  className = '' 
}: FloatingCartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Show floating button when user scrolls past hero
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 400;
      setIsVisible(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToCart = () => {
    if (creatorName && servicePrice) {
      const newItem: CartItem = {
        id: Date.now().toString(),
        serviceName: 'Service',
        price: servicePrice,
        creatorName,
      };
      setCartItems(prev => [...prev, newItem]);
      setIsExpanded(true);
    }
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className={`fixed bottom-6 right-6 z-50 ${className}`}
        >
          {/* Expanded Cart */}
          <AnimatePresence>
            {isExpanded && cartItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="mb-4 bg-neutral-900 border border-white/10 rounded-lg p-4 min-w-80 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Cart ({cartItems.length})
                  </h3>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-neutral-800 rounded p-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {item.serviceName}
                        </p>
                        <p className="text-xs text-gray-400">
                          by {item.creatorName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          ${item.price}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-white">Total:</span>
                    <span className="font-bold text-lg text-brand-400">
                      ${totalPrice}
                    </span>
                  </div>
                  <button
                    onClick={onBooking}
                    className="w-full bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white font-medium py-2 rounded-lg transition-all"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Action Button */}
          <motion.button
            onClick={cartItems.length > 0 ? () => setIsExpanded(!isExpanded) : addToCart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white p-4 rounded-full shadow-lg backdrop-blur-sm border border-white/10 transition-all"
          >
            <div className="flex items-center gap-2">
              {cartItems.length > 0 ? (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span className="bg-white text-brand-600 text-xs font-bold px-2 py-1 rounded-full min-w-[20px]">
                    {cartItems.length}
                  </span>
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Book</span>
                </>
              )}
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}