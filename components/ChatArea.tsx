'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

type Message = {
  id: string
  content: string
  userId: string
  createdAt: string
}

export default function ChatArea() {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    // Fetch messages from API
    const fetchMessages = async () => {
      const response = await fetch('/api/messages')
      const data = await response.json()
      setMessages(data)
    }

    fetchMessages()
  }, [])

  const handleSendMessage = async (content: string) => {
    if (!user) return

    const newMessage = {
      content,
      userId: user.id,
      createdAt: new Date().toISOString(),
    }

    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMessage),
    })

    if (response.ok) {
      const savedMessage = await response.json()
      setMessages([...messages, savedMessage])
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <MessageList messages={messages} />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  )
}

