'use client'

import { useEffect, useState } from 'react'
import { pusherClient } from '@/lib/pusher'
import  MessageReactions  from './MessageReactions'
import { FileAttachment } from './FileAttachment'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
}

interface Message {
  id: string
  content: string
  userId: string
  channelId: string
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar: string | null
  }
  fileUrl: string | null
  fileName: string | null
  fileKey: string | null
  reactions: any[]
}

interface MessageListProps {
  initialMessages: Message[]
  channelId: string
  currentUserId: string
}

export default function MessageList({ initialMessages, channelId, currentUserId }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.map(msg => ({
      ...msg,
      createdAt: new Date(msg.createdAt),
      updatedAt: new Date(msg.updatedAt)
    }))
  )

  useEffect(() => {
    console.log('Initial messages:', initialMessages)
    
    const channel = pusherClient.subscribe(`channel-${channelId}`)
    
    channel.bind('new-message', (newMessage: Message) => {
      console.log('Received new message:', newMessage)
      setMessages((current) => [...current, {
        ...newMessage,
        createdAt: new Date(newMessage.createdAt),
        updatedAt: new Date(newMessage.updatedAt)
      }])
    })

    return () => {
      pusherClient.unsubscribe(`channel-${channelId}`)
    }
  }, [channelId, initialMessages])

  console.log('Current messages:', messages)

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch('/api/messages/react', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          emoji,
          userId: currentUserId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add reaction');
      }

      // Optionally update the UI optimistically or refresh messages
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="flex items-start gap-3 group">
          <img
            src={message.user.avatar || '/default-avatar.png'}
            alt={`${message.user.firstName || 'User'} ${message.user.lastName || ''}`}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {message.user.firstName || message.user.email.split('@')[0]}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString()}
              </span>
            </div>
            
            {message.content && message.content.trim() !== '' && (
              <p className="mt-1">{message.content}</p>
            )}
            
            {message.fileUrl && message.fileName && (
              <div className="mt-2 p-2 bg-gray-100 rounded-md flex items-center gap-2 max-w-xs hover:bg-gray-200 transition-colors">
                <svg
                  className="w-8 h-8 text-gray-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {message.fileName}
                  </p>
                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    Download
                  </a>
                </div>
              </div>
            )}
            
            <MessageReactions 
              message={message}
              onReact={handleReaction}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

