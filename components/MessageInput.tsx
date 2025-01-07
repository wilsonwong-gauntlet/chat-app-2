'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  channelId: string
}

export default function MessageInput({ channelId }: Props) {
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSending) return

    setIsSending(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          channelId,
        }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      setContent('')
      router.refresh()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          disabled={isSending}
          className="flex-1 p-2 border rounded-md disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSending}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  )
}

