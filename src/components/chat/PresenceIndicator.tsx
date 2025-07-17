'use client';

import React, { useEffect, useState } from 'react';
import { RealtimeService, PresenceData } from '@/lib/firebase/realtimeService';

interface PresenceIndicatorProps {
  userId: string;
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PresenceIndicator({ 
  userId, 
  showText = false, 
  className = '',
  size = 'md'
}: PresenceIndicatorProps) {
  const [presence, setPresence] = useState<PresenceData | null>(null);
  const [realtimeService] = useState(() => new RealtimeService());

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToPresence([userId], (presenceData) => {
      const userPresence = presenceData.find(p => p.userId === userId);
      setPresence(userPresence || null);
    });

    return () => {
      unsubscribe();
    };
  }, [userId, realtimeService]);

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const getStatusColor = () => {
    if (!presence) return 'bg-gray-400';
    
    if (presence.isOnline) {
      return 'bg-green-500';
    }
    
    // Check if user was online recently (within 5 minutes)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    if (presence.lastSeen > fiveMinutesAgo) {
      return 'bg-yellow-500';
    }
    
    return 'bg-gray-400';
  };

  const getStatusText = () => {
    if (!presence) return 'Unknown';
    
    if (presence.isOnline) {
      return 'Online';
    }
    
    const now = Date.now();
    const lastSeen = presence.lastSeen;
    const diffMinutes = Math.floor((now - lastSeen) / (60 * 1000));
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const formatLastSeen = () => {
    if (!presence || presence.isOnline) return null;
    
    const lastSeenDate = new Date(presence.lastSeen);
    const now = new Date();
    
    // If it's today, show time
    if (lastSeenDate.toDateString() === now.toDateString()) {
      return `last seen at ${lastSeenDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
    
    // If it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastSeenDate.toDateString() === yesterday.toDateString()) {
      return `last seen yesterday at ${lastSeenDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
    
    // If it's this week
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (lastSeenDate > weekAgo) {
      return `last seen ${lastSeenDate.toLocaleDateString([], { 
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }
    
    // Older than a week
    return `last seen ${lastSeenDate.toLocaleDateString()}`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div 
          className={`${sizeClasses[size]} rounded-full ${getStatusColor()} ${
            presence?.isOnline ? 'animate-pulse' : ''
          }`}
        />
        {presence?.isOnline && (
          <div 
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full ${getStatusColor()} animate-ping opacity-75`}
          />
        )}
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-sm text-gray-900">
            {getStatusText()}
          </span>
          {!presence?.isOnline && (
            <span className="text-xs text-gray-500">
              {formatLastSeen()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Simplified version for avatars
export function PresenceAvatar({ 
  userId, 
  avatarUrl, 
  userName, 
  size = 'md',
  className = ''
}: {
  userId: string;
  avatarUrl?: string;
  userName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const [presence, setPresence] = useState<PresenceData | null>(null);
  const [realtimeService] = useState(() => new RealtimeService());

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToPresence([userId], (presenceData) => {
      const userPresence = presenceData.find(p => p.userId === userId);
      setPresence(userPresence || null);
    });

    return () => {
      unsubscribe();
    };
  }, [userId, realtimeService]);

  const sizeClasses = {
    sm: { avatar: 'w-8 h-8', indicator: 'w-2 h-2', position: 'bottom-0 right-0' },
    md: { avatar: 'w-10 h-10', indicator: 'w-3 h-3', position: 'bottom-0 right-0' },
    lg: { avatar: 'w-12 h-12', indicator: 'w-4 h-4', position: 'bottom-0 right-0' }
  };

  const getStatusColor = () => {
    if (!presence) return 'bg-gray-400';
    return presence.isOnline ? 'bg-green-500' : 'bg-gray-400';
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size].avatar} rounded-full overflow-hidden bg-gray-200`}>
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={userName || 'User avatar'} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
            {userName?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
      </div>
      
      {/* Presence indicator */}
      <div 
        className={`absolute ${sizeClasses[size].position} ${sizeClasses[size].indicator} rounded-full ${getStatusColor()} border-2 border-white`}
      />
    </div>
  );
}

// Multi-user presence for group chats
export function MultiUserPresence({ 
  userIds, 
  maxVisible = 3,
  className = ''
}: {
  userIds: string[];
  maxVisible?: number;
  className?: string;
}) {
  const [presenceData, setPresenceData] = useState<PresenceData[]>([]);
  const [realtimeService] = useState(() => new RealtimeService());

  useEffect(() => {
    if (userIds.length === 0) return;

    const unsubscribe = realtimeService.subscribeToPresence(userIds, (data) => {
      setPresenceData(data);
    });

    return () => {
      unsubscribe();
    };
  }, [userIds, realtimeService]);

  const onlineUsers = presenceData.filter(p => p.isOnline);
  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const remainingCount = Math.max(0, onlineUsers.length - maxVisible);

  if (onlineUsers.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex -space-x-1">
        {visibleUsers.map(user => (
          <PresenceAvatar
            key={user.userId}
            userId={user.userId}
            avatarUrl={user.userAvatar}
            userName={user.userName}
            size="sm"
          />
        ))}
        {remainingCount > 0 && (
          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
            <span className="text-xs text-gray-600">+{remainingCount}</span>
          </div>
        )}
      </div>
      
      <span className="text-sm text-gray-500">
        {onlineUsers.length === 1 ? '1 online' : `${onlineUsers.length} online`}
      </span>
    </div>
  );
}