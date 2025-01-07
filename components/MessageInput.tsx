'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bold, 
  Italic, 
  Link, 
  List, 
  Smile, 
  Paperclip,
  Send
} from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'

interface Props {
  channelId?: string
  receiverId?: string
  isDM?: boolean
}

export default function MessageInput({ channelId, receiverId, isDM }: Props) {
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSending) return

    setIsSending(true)
    try {
      const endpoint = isDM ? '/api/direct-messages' : '/api/messages'
      const body = isDM ? { content, receiverId } : { content, channelId }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const insertTextFormat = (format: string) => {
    const input = document.getElementById('messageInput') as HTMLTextAreaElement
    const start = input.selectionStart
    const end = input.selectionEnd
    const selectedText = content.substring(start, end)
    
    let newText = ''
    switch(format) {
      case 'bold':
        newText = `**${selectedText}**`
        break
      case 'italic':
        newText = `_${selectedText}_`
        break
      case 'link':
        newText = `[${selectedText}](url)`
        break
      case 'list':
        newText = `\n- ${selectedText}`
        break
      default:
        newText = selectedText
    }
    
    const newContent = content.substring(0, start) + newText + content.substring(end)
    setContent(newContent)
  }

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload logic here
    const files = e.target.files
    if (files && files.length > 0) {
      // Implement file upload logic
      console.log('Files selected:', files)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-md p-2 bg-white">
      {/* Formatting toolbar */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <button type="button" onClick={() => insertTextFormat('bold')} className="p-1 hover:bg-gray-100 rounded">
          <Bold size={16} />
        </button>
        <button type="button" onClick={() => insertTextFormat('italic')} className="p-1 hover:bg-gray-100 rounded">
          <Italic size={16} />
        </button>
        <button type="button" onClick={() => insertTextFormat('link')} className="p-1 hover:bg-gray-100 rounded">
          <Link size={16} />
        </button>
        <button type="button" onClick={() => insertTextFormat('list')} className="p-1 hover:bg-gray-100 rounded">
          <List size={16} />
        </button>
        <div className="relative">
          <button 
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Smile size={16} />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-full">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setContent(prev => prev + emojiData.emoji)
                  setShowEmojiPicker(false)
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Message input area */}
      <div className="flex items-end gap-2 mt-2">
        <textarea
          id="messageInput"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={isSending}
          className="flex-1 resize-none outline-none min-h-[40px] max-h-[200px] disabled:opacity-50"
          rows={1}
        />
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
          <button 
            type="button"
            onClick={handleFileClick}
            disabled={isSending}
            className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
          >
            <Paperclip size={16} />
          </button>
          <button
            type="submit"
            disabled={!content.trim() || isSending}
            className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
          >
            <Send size={16} className={content.trim() && !isSending ? 'text-blue-500' : 'text-gray-400'} />
          </button>
        </div>
      </div>
    </form>
  )
}
