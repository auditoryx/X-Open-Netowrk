'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Command {
  id: string;
  title: string;
  description: string;
  action: () => void;
  icon?: React.ReactNode;
  category: 'navigation' | 'search' | 'actions';
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const commands: Command[] = [
    {
      id: 'explore',
      title: 'Explore Creators',
      description: 'Browse all creators and services',
      action: () => router.push('/explore'),
      icon: '🔍',
      category: 'navigation'
    },
    {
      id: 'search-artists',
      title: 'Search Artists',
      description: 'Find featured artists',
      action: () => router.push('/explore?role=artist'),
      icon: '🎤',
      category: 'search'
    },
    {
      id: 'search-producers',
      title: 'Search Producers',
      description: 'Find music producers',
      action: () => router.push('/explore?role=producer'),
      icon: '🎧',
      category: 'search'
    },
    {
      id: 'search-engineers',
      title: 'Search Engineers',
      description: 'Find mixing engineers',
      action: () => router.push('/explore?role=engineer'),
      icon: '🎚️',
      category: 'search'
    },
    {
      id: 'search-videographers',
      title: 'Search Videographers',
      description: 'Find video directors',
      action: () => router.push('/explore?role=videographer'),
      icon: '🎥',
      category: 'search'
    },
    {
      id: 'search-studios',
      title: 'Search Studios',
      description: 'Find recording studios',
      action: () => router.push('/explore?role=studio'),
      icon: '🏢',
      category: 'search'
    },
    {
      id: 'apply',
      title: 'Apply as Creator',
      description: 'Join the network',
      action: () => router.push('/apply'),
      icon: '📝',
      category: 'actions'
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Go to your dashboard',
      action: () => router.push('/dashboard'),
      icon: '📊',
      category: 'navigation'
    },
    {
      id: 'profile',
      title: 'My Profile',
      description: 'View your profile',
      action: () => router.push('/profile'),
      icon: '👤',
      category: 'navigation'
    }
  ];

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
        break;
    }
  };

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Command Palette */}
          <motion.div
            className="fixed top-1/4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4 z-50"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="bg-brutalist-black border-4 border-white shadow-brutal-xl">
              {/* Search Input */}
              <div className="flex items-center p-4 border-b-2 border-white">
                <MagnifyingGlassIcon className="w-6 h-6 text-white mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search or type a command..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg font-brutalist-mono"
                />
                <button
                  onClick={onClose}
                  className="ml-3 text-white hover:text-gray-300 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                  <div key={category} className="p-2">
                    <div className="text-brutalist-mono text-xs uppercase tracking-wider text-gray-400 px-2 py-2">
                      {category}
                    </div>
                    {categoryCommands.map((command, index) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      return (
                        <motion.button
                          key={command.id}
                          onClick={() => {
                            command.action();
                            onClose();
                          }}
                          className={`w-full text-left p-3 rounded-none flex items-center gap-3 transition-colors ${
                            selectedIndex === globalIndex
                              ? 'bg-white text-black'
                              : 'hover:bg-gray-800'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="text-xl">{command.icon}</span>
                          <div className="flex-1">
                            <div className="font-brutalist text-sm">{command.title}</div>
                            <div className="text-xs opacity-60">{command.description}</div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                ))}
                
                {filteredCommands.length === 0 && (
                  <div className="p-8 text-center text-gray-400">
                    <span className="text-2xl mb-2 block">🔍</span>
                    <p className="text-brutalist-mono">No results found</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t-2 border-white p-3 bg-gray-900">
                <div className="flex justify-between text-xs text-gray-400 font-mono">
                  <span>↑↓ Navigate</span>
                  <span>↵ Select</span>
                  <span>Esc Close</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for using command palette
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev)
  };
}