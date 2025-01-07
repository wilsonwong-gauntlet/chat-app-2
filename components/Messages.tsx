'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { pusherClient } from '@/lib/pusher'
import type { Message, DirectMessage } from '@/types'

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
      channel.bind('new-message', () => {
        router.refresh()
      })

      return () => {
        channel.unbind('new-message')
        pusherClient.unsubscribe(`channel-${channelId}`)
      }
    }
  }, [channelId, userId, isDM, currentUserId, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [initialMessages])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {initialMessages.map((message) => {
        const user = 'sender' in message ? message.sender : message.user
        return (
          <div key={message.id} className="flex items-start mb-4">
            <img
              src={user.avatar || '/default-avatar.png'}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-8 h-8 rounded-full mr-2"
            />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <span className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
} 