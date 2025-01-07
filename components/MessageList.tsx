'use client'

import { useEffect, useState } from 'react'
import { pusherClient } from '@/lib/pusher'
import  MessageReactions  from './MessageReactions'

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
  user: User
}

interface MessageListProps {
  initialMessages: Message[]
  channelId: string
  currentUserId: string
}

export default function MessageList({ initialMessages, channelId, currentUserId }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)

  useEffect(() => {
    const channel = pusherClient.subscribe(`channel-${channelId}`)
    
    channel.bind('new-message', (newMessage: Message) => {
      setMessages((current) => [...current, newMessage])
    })

    return () => {
      pusherClient.unsubscribe(`channel-${channelId}`)
    }
  }, [channelId])

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
            alt={`${message.user.firstName} ${message.user.lastName}`}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{message.user.firstName} {message.user.lastName}</span>
              <span className="text-sm text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <p className="mt-1">{message.content}</p>
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

