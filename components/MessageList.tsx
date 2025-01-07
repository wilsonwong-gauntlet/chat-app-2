'use client'

import { useEffect, useState } from 'react'
import { pusherClient } from '@/lib/pusher'

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
}

export default function MessageList({ initialMessages, channelId }: MessageListProps) {
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

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="flex items-start gap-3">
          <img
            src={message.user.avatar || '/default-avatar.png'}
            alt={`${message.user.firstName} ${message.user.lastName}`}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{message.user.firstName} {message.user.lastName}</span>
              <span className="text-sm text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <p className="mt-1">{message.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

