'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { pusherClient } from '@/lib/pusher'
import { useUser } from '@clerk/nextjs'
import type { Message, DirectMessage } from '@/types'
import MessageReactions from './MessageReactions'

interface MessagesProps {
  initialMessages: (Message | DirectMessage)[]
  channelId?: string
  userId?: string
  isDM?: boolean
  currentUserId: string
}

export default function Messages({ 
  initialMessages, 
  channelId, 
  userId, 
  isDM,
  currentUserId 
}: MessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user } = useUser()

  const [messages, setMessages] = useState<(Message | DirectMessage)[]>(initialMessages)

  useEffect(() => {
    if (isDM && currentUserId) {
      const channel = pusherClient.subscribe(`private-user-${currentUserId}`)
      
      channel.bind('new-dm', () => {
        router.refresh()
      })

      return () => {
        channel.unbind('new-dm')
        pusherClient.unsubscribe(`private-user-${currentUserId}`)
      }
    } else if (channelId) {
      const channel = pusherClient.subscribe(`channel-${channelId}`)
      
      channel.bind('new-message', (newMessage: Message) => {
        setMessages((current) => [...current, newMessage]);
      });

      channel.bind('message-updated', (updatedMessage: Message) => {
        setMessages((current) =>
          current.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
      });

      return () => {
        pusherClient.unsubscribe(`channel-${channelId}`);
      }
    }
  }, [channelId, userId, isDM, currentUserId, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/messages/react', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          emoji,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add reaction');
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const user = 'sender' in message ? message.sender : message.user
        return (
          <div key={message.id} className="flex items-start gap-3 group">
            <img
              src={user.avatar || '/default-avatar.png'}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {user.firstName} {user.lastName}
                </span>
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
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
} 