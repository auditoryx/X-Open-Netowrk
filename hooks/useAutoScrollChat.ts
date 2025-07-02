import { useEffect, useRef } from 'react';

interface UseAutoScrollChatOptions {
  messages: any[];
  enabled?: boolean;
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
}

/**
 * Custom hook for auto-scrolling chat to the latest message
 * @param options Configuration options for auto-scroll behavior
 * @returns ref to attach to the scroll target element
 */
export const useAutoScrollChat = ({
  messages,
  enabled = true,
  behavior = 'smooth',
  block = 'end'
}: UseAutoScrollChatOptions) => {
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  const messagesLengthRef = useRef(messages.length);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Track user scrolling to prevent auto-scroll when user is reading older messages
  useEffect(() => {
    const scrollContainer = scrollTargetRef.current?.parentElement;
    if (!scrollContainer) return;

    const handleScroll = () => {
      isUserScrollingRef.current = true;
      
      // Clear previous timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Reset user scrolling flag after 2 seconds of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 2000);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (!enabled || !scrollTargetRef.current) return;

    const hasNewMessages = messages.length > messagesLengthRef.current;
    const scrollContainer = scrollTargetRef.current.parentElement;
    
    if (hasNewMessages && scrollContainer) {
      // Check if user is near the bottom (within 100px)
      const isNearBottom = 
        scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 100;
      
      // Only auto-scroll if user is near bottom or not actively scrolling
      if (isNearBottom || !isUserScrollingRef.current) {
        scrollTargetRef.current.scrollIntoView({
          behavior,
          block
        });
      }
    }

    messagesLengthRef.current = messages.length;
  }, [messages, enabled, behavior, block]);

  // Initial scroll on mount
  useEffect(() => {
    if (enabled && scrollTargetRef.current && messages.length > 0) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        scrollTargetRef.current?.scrollIntoView({
          behavior: 'auto', // Instant scroll on initial load
          block
        });
      }, 100);
    }
  }, [enabled, block]); // Only run on mount and when enabled changes

  /**
   * Manually scroll to bottom (useful for "scroll to bottom" button)
   */
  const scrollToBottom = () => {
    scrollTargetRef.current?.scrollIntoView({
      behavior,
      block
    });
  };

  /**
   * Check if the chat is scrolled to the bottom
   */
  const isAtBottom = (): boolean => {
    const scrollContainer = scrollTargetRef.current?.parentElement;
    if (!scrollContainer) return true;
    
    return scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 10;
  };

  return {
    scrollTargetRef,
    scrollToBottom,
    isAtBottom,
    isUserScrolling: isUserScrollingRef.current
  };
};
