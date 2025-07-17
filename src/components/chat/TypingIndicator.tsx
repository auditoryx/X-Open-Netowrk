'use client';

import React, { useEffect, useState } from 'react';
import { RealtimeService, TypingIndicator as TypingIndicatorType } from '@/lib/firebase/realtimeService';

interface TypingIndicatorProps {
  chatId: string;
  currentUserId: string;
  className?: string;
}

export default function TypingIndicator({ chatId, currentUserId, className = '' }: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<TypingIndicatorType[]>([]);
  const [realtimeService] = useState(() => new RealtimeService());

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToTyping(chatId, (users) => {
      // Filter out current user
      const otherUsers = users.filter(u => u.userId !== currentUserId && u.isTyping);
      setTypingUsers(otherUsers);
    });

    return () => {
      unsubscribe();
    };
  }, [chatId, currentUserId, realtimeService]);

  if (typingUsers.length === 0) {
    return null;
  }

  const renderTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName || 'Someone'} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].userName || 'Someone'} and ${typingUsers[1].userName || 'someone else'} are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  };

  return (
    <div className={`flex items-center gap-2 p-2 text-sm text-gray-500 ${className}`}>
      {/* Animated typing dots */}
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
        <div 
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" 
          style={{ animationDelay: '0.1s' }} 
        />
        <div 
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" 
          style={{ animationDelay: '0.2s' }} 
        />
      </div>
      
      {/* Typing text */}
      <span className="text-gray-600 italic">
        {renderTypingText()}
      </span>
    </div>
  );
}

// Alternative minimal version for inline use
export function TypingIndicatorMinimal({ 
  chatId, 
  currentUserId,
  className = ''
}: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<TypingIndicatorType[]>([]);
  const [realtimeService] = useState(() => new RealtimeService());

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToTyping(chatId, (users) => {
      const otherUsers = users.filter(u => u.userId !== currentUserId && u.isTyping);
      setTypingUsers(otherUsers);
    });

    return () => {
      unsubscribe();
    };
  }, [chatId, currentUserId, realtimeService]);

  if (typingUsers.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex gap-1">
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" />
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
      </div>
      <span className="text-xs text-gray-400">
        {typingUsers.length === 1 ? 'typing' : `${typingUsers.length} typing`}
      </span>
    </div>
  );
}