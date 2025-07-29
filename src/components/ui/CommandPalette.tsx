'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, User, Calendar, MessageSquare, Settings, Home } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Command {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'navigation' | 'actions' | 'search';
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    // Navigation
    {
      id: 'nav-home',
      title: 'Go to Home',
      description: 'Navigate to homepage',
      icon: <Home className="w-4 h-4" />,
      action: () => router.push('/'),
      category: 'navigation'
    },
    {
      id: 'nav-explore',
      title: 'Explore Creators',
      description: 'Browse and filter creators',
      icon: <Search className="w-4 h-4" />,
      action: () => router.push('/explore'),
      category: 'navigation'
    },
    {
      id: 'nav-dashboard',
      title: 'Dashboard',
      description: 'Go to your dashboard',
      icon: <User className="w-4 h-4" />,
      action: () => router.push('/dashboard'),
      category: 'navigation'
    },
    {
      id: 'nav-bookings',
      title: 'My Bookings',
      description: 'View your bookings',
      icon: <Calendar className="w-4 h-4" />,
      action: () => router.push('/dashboard/bookings'),
      category: 'navigation'
    },
    {
      id: 'nav-messages',
      title: 'Messages',
      description: 'View conversations',
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => router.push('/dashboard/messages'),
      category: 'navigation'
    },
    {
      id: 'nav-settings',
      title: 'Settings',
      description: 'Account settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => router.push('/dashboard/settings'),
      category: 'navigation'
    },
    // Actions
    {
      id: 'action-new-booking',
      title: 'New Booking',
      description: 'Start a new booking',
      icon: <Calendar className="w-4 h-4" />,
      action: () => router.push('/explore'),
      category: 'actions'
    },
  ];

  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    (command.description && command.description.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = (command: Command) => {
    command.action();
    onClose();
    setQuery('');
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          handleSelect(filteredCommands[selectedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-lg mx-4 z-50"
          >
            <div className="bg-neutral-900 border border-white/10 rounded-lg shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <Command className="w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                />
                <kbd className="text-xs text-gray-400 bg-neutral-800 px-2 py-1 rounded">
                  ESC
                </kbd>
              </div>

              {/* Commands List */}
              <div className="max-h-80 overflow-y-auto">
                {filteredCommands.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    No commands found
                  </div>
                ) : (
                  <div className="py-2">
                    {filteredCommands.map((command, index) => (
                      <button
                        key={command.id}
                        onClick={() => handleSelect(command)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-800 transition-colors ${
                          index === selectedIndex ? 'bg-neutral-800' : ''
                        }`}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div className="text-gray-400">
                          {command.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium">
                            {command.title}
                          </div>
                          {command.description && (
                            <div className="text-sm text-gray-400 truncate">
                              {command.description}
                            </div>
                          )}
                        </div>
                        <kbd className="text-xs text-gray-400 bg-neutral-800 px-2 py-1 rounded">
                          ↵
                        </kbd>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}