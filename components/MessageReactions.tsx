'use client';

import { Message } from '@/types';
import { useState } from 'react';

interface MessageReactionsProps {
  message: Message;
  onReact: (messageId: string, emoji: string) => void;
  emojiOptions: string[];
}

export default function MessageReactions({ message, onReact, emojiOptions }: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleReaction = (emoji: string) => {
    onReact(message.id, emoji);
    setShowPicker(false);
  };

  return (
    <div className="opacity-0 group-hover:opacity-100 absolute right-4 top-1/2 -translate-y-1/2">
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path d="M2 10a2 2 0 100-4 2 2 0 000 4z" />
            <path d="M18 10a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
        
        {showPicker && (
          <div className="absolute right-0 bottom-full mb-2 bg-white shadow-lg rounded-lg p-2 flex gap-1 z-10">
            {emojiOptions.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="hover:bg-gray-100 p-2 rounded"
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