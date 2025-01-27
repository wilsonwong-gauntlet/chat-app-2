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

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

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

      channel.bind('message-updated', (updatedMessage: Message | DirectMessage) => {
        setMessages((current) =>
          current.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
      });

      return () => {
        channel.unbind('new-dm')
        channel.unbind('message-updated')
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
        channel.unbind('new-message')
        channel.unbind('message-updated')
        pusherClient.unsubscribe(`channel-${channelId}`);
      }
    }
  }, [channelId, userId, isDM, currentUserId, router])

  useEffect(() => {
    setMessages(initialMessages.map(msg => ({
      ...msg,
      reactions: msg.reactions || []
    })));
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, initialMessages])

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
          <div key={message.id} className="flex items-start gap-3 group relative hover:bg-gray-50 p-2 rounded-lg">
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
              {message.reactions?.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {EMOJI_OPTIONS.map(emoji => {
                    const count = message.reactions?.filter(r => r.emoji === emoji).length ?? 0;
                    if (count === 0) return null;
                    return (
                      <span key={emoji} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                        {emoji} {count}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
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
              emojiOptions={EMOJI_OPTIONS}
              currentUserId={user?.id}
            />
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
} 