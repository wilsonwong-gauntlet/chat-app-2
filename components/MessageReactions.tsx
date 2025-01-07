'use client';

import { Message, Reaction } from '@/types';
import { useState } from 'react';

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

interface MessageReactionsProps {
  message: Message;
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
}

export default function MessageReactions({ message, currentUserId, onReact }: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleReaction = (emoji: string) => {
    onReact(message.id, emoji);
    setShowPicker(false);
  };

  const getReactionCount = (emoji: string) => {
    return message.reactions?.filter(r => r.emoji === emoji).length ?? 0;
  };

  const hasUserReacted = (emoji: string) => {
    return message.reactions?.some(r => r.emoji === emoji && r.userId === currentUserId) ?? false;
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      {/* Show existing reactions */}
      {EMOJI_OPTIONS.map(emoji => {
        const count = getReactionCount(emoji);
        if (count === 0) return null;
        
        return (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className={`px-2 py-1 rounded-full text-sm ${
              hasUserReacted(emoji) ? 'bg-blue-100' : 'bg-gray-100'
            } hover:bg-blue-200 transition-colors`}
          >
            {emoji} {count}
          </button>
        );
      })}
      
      {/* Reaction picker */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          {showPicker ? '✕' : '😊'}
        </button>
        
        {showPicker && (
          <div className="absolute bottom-full mb-2 bg-white shadow-lg rounded-lg p-2 flex gap-1">
            {EMOJI_OPTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="hover:bg-gray-100 p-1 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}