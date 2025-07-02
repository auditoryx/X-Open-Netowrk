import React, { useEffect, useState, useCallback } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { useAutoScrollChat } from '../../hooks/useAutoScrollChat';
import { bulkUpdateSeenStatus } from '../../lib/firestore/updateSeenStatus';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  mediaUrl?: string;
  timestamp: any;
  seen?: boolean;
  seenBy?: string[];
}

interface ChatThreadProps {
  messages: Message[];
  currentUserId: string;
  bookingId: string;
  className?: string;
  onImageLoad?: () => void;
}

const ChatThread: React.FC<ChatThreadProps> = ({
  messages,
  currentUserId,
  bookingId,
  className = '',
  onImageLoad
}) => {
  const [unreadMessageIds, setUnreadMessageIds] = useState<string[]>([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const {
    scrollTargetRef,
    scrollToBottom,
    isAtBottom
  } = useAutoScrollChat({
    messages,
    enabled: true,
    behavior: 'smooth'
  });

  // Track unread messages
  useEffect(() => {
    const unreadIds = messages
      .filter(msg => 
        msg.senderId !== currentUserId && 
        (!msg.seenBy || !msg.seenBy.includes(currentUserId))
      )
      .map(msg => msg.id);
    
    setUnreadMessageIds(unreadIds);
  }, [messages, currentUserId]);

  // Mark messages as seen when they come into view
  useEffect(() => {
    if (unreadMessageIds.length === 0) return;

    const markAsSeen = async () => {
      try {
        await bulkUpdateSeenStatus(bookingId, unreadMessageIds, currentUserId);
      } catch (error) {
        console.error('Failed to mark messages as seen:', error);
      }
    };

    // Mark as seen with a slight delay to ensure user actually sees them
    const timeoutId = setTimeout(markAsSeen, 1000);
    return () => clearTimeout(timeoutId);
  }, [unreadMessageIds, bookingId, currentUserId]);

  // Show/hide scroll to bottom button
  useEffect(() => {
    const container = scrollTargetRef.current?.parentElement;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom = isAtBottom();
      setShowScrollButton(!isNearBottom && messages.length > 5);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length, isAtBottom]);

  const handleImageLoad = useCallback(() => {
    // Scroll to bottom when images load to maintain chat position
    if (isAtBottom()) {
      setTimeout(() => scrollToBottom(), 100);
    }
    onImageLoad?.();
  }, [isAtBottom, scrollToBottom, onImageLoad]);

  if (messages.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full text-gray-500 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-sm font-medium">No messages yet</p>
          <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full ${className}`}>
      {/* Messages container */}
      <div className="h-full overflow-y-auto scroll-smooth px-4 py-2">
        <div className="space-y-1">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              isLastMessage={index === messages.length - 1}
              showSeenIndicator={true}
              onImageLoad={handleImageLoad}
            />
          ))}
        </div>
        
        {/* Scroll target */}
        <div ref={scrollTargetRef} className="h-1" />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 z-10"
          aria-label="Scroll to bottom"
        >
          <ChevronDownIcon className="w-5 h-5" />
        </button>
      )}

      {/* Unread messages indicator */}
      {unreadMessageIds.length > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg animate-bounce">
          {unreadMessageIds.length} new message{unreadMessageIds.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default ChatThread;
