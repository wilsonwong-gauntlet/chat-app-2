'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { pusherClient } from '@/lib/pusher'

interface User {
  id: string
  name: string
  email: string
  avatar: string | null
}

interface Message {
  id: string
  content: string
  userId: string
  channelId: string
  createdAt: Date
  user: User
}

interface MessagesProps {
  initialMessages: Message[]
  channelId: string
}

export default function Messages({ initialMessages, channelId }: MessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const channel = pusherClient.subscribe(`channel-${channelId}`)
    
    channel.bind('new-message', () => {
      router.refresh()
    })

    return () => {
      channel.unbind('new-message')
      pusherClient.unsubscribe(`channel-${channelId}`)
    }
  }, [channelId, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [initialMessages])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {initialMessages.map((message) => (
        <div key={message.id} className="flex items-start gap-3">
          <img
            src={message.user.avatar || '/default-avatar.png'}
            alt={message.user.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{message.user.name}</span>
              <span className="text-sm text-gray-500">
                {new Date(message.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <p className="mt-1">{message.content}</p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
} 