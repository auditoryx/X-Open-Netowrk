import React from 'react';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { CheckIcon, CheckCheckIcon } from 'lucide-react';
import { hasUserSeenMessage, getSeenCount } from '../../lib/firestore/updateSeenStatus';

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

interface MessageBubbleProps {
  message: Message;
  currentUserId: string;
  isLastMessage?: boolean;
  showSeenIndicator?: boolean;
  onImageLoad?: () => void;
}

/**
 * Formats timestamp with relative time for recent messages
 */
const formatMessageTimestamp = (timestamp: any): string => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  
  // If message is from today, show relative time
  if (isToday(date)) {
    const distance = formatDistanceToNow(date, { addSuffix: true });
    // For very recent messages, show more precise time
    if (distance.includes('less than')) {
      return 'just now';
    }
    return distance;
  }
  
  // If message is from yesterday
  if (isYesterday(date)) {
    return `Yesterday ${format(date, 'HH:mm')}`;
  }
  
  // For older messages, show full date
  return format(date, 'MMM d, HH:mm');
};

/**
 * Renders seen status indicator
 */
const SeenIndicator: React.FC<{
  message: Message;
  currentUserId: string;
  isLastMessage: boolean;
}> = ({ message, currentUserId, isLastMessage }) => {
  const seenCount = getSeenCount(message);
  const isSentByCurrentUser = message.senderId === currentUserId;
  
  if (!isSentByCurrentUser || !isLastMessage) return null;
  
  return (
    <div className="flex items-center gap-1 text-xs">
      {seenCount > 0 ? (
        <>
          <CheckCheckIcon className="w-3 h-3 text-blue-500" />
          <span className="text-blue-500">Seen</span>
        </>
      ) : (
        <>
          <CheckIcon className="w-3 h-3 text-gray-400" />
          <span className="text-gray-400">Sent</span>
        </>
      )}
    </div>
  );
};

/**
 * Renders media attachment
 */
const MediaAttachment: React.FC<{
  mediaUrl: string;
  onLoad?: () => void;
}> = ({ mediaUrl, onLoad }) => {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(mediaUrl);
  const isAudio = /\.(mp3|wav|ogg|m4a)$/i.test(mediaUrl);
  
  if (isImage) {
    return (
      <div className="mt-2">
        <img
          src={mediaUrl}
          alt="Shared image"
          className="max-w-xs rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onLoad={onLoad}
          onClick={() => window.open(mediaUrl, '_blank')}
        />
      </div>
    );
  }
  
  if (isAudio) {
    return (
      <div className="mt-2">
        <audio controls className="max-w-xs">
          <source src={mediaUrl} />
          Your browser does not support audio playback.
        </audio>
      </div>
    );
  }
  
  // Generic file attachment
  return (
    <div className="mt-2">
      <a
        href={mediaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        View Attachment
      </a>
    </div>
  );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUserId,
  isLastMessage = false,
  showSeenIndicator = true,
  onImageLoad
}) => {
  const isSentByCurrentUser = message.senderId === currentUserId;
  const userHasSeen = hasUserSeenMessage(message, currentUserId);
  
  return (
    <div
      className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}
      style={{
        animationDelay: '0.1s',
        animationFillMode: 'both'
      }}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
          isSentByCurrentUser
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        }`}
      >
        {/* Sender name for incoming messages */}
        {!isSentByCurrentUser && (
          <div className="text-xs font-medium text-gray-600 mb-1">
            {message.senderName}
          </div>
        )}
        
        {/* Message content */}
        {message.content && (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        )}
        
        {/* Media attachment */}
        {message.mediaUrl && (
          <MediaAttachment
            mediaUrl={message.mediaUrl}
            onLoad={onImageLoad}
          />
        )}
        
        {/* Timestamp and seen indicator */}
        <div className={`flex items-center justify-between mt-2 gap-2 ${
          isSentByCurrentUser ? 'flex-row-reverse' : 'flex-row'
        }`}>
          <div className={`text-xs ${
            isSentByCurrentUser ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {formatMessageTimestamp(message.timestamp)}
          </div>
          
          {showSeenIndicator && (
            <SeenIndicator
              message={message}
              currentUserId={currentUserId}
              isLastMessage={isLastMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
