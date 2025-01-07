'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CreateChannelModal } from '@/components/modals/create-channel-modal'
import Users from './Users'
import type { User } from '@/types'

interface Channel {
  id: string
  name: string
  isPrivate: boolean
  members: {
    user: User
  }[]
}

interface Props {
  channels: Channel[]
  currentChannelId?: string
  users: User[]
  userId: string
}

export default function SidebarClient({ channels, currentChannelId, users, userId }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="w-64 bg-gray-100 p-4 flex flex-col">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Channels</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded"
          >
            +
          </button>
        </div>
        <div className="space-y-2">
          {channels.map((channel) => (
            <Link
              key={channel.id}
              href={`/?channel=${channel.id}`}
              className={`block p-2 rounded-md ${
                channel.id === currentChannelId
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-2">#</span>
                <span>{channel.name}</span>
                {channel.isPrivate && (
                  <span className="ml-2 text-xs">🔒</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Users initialUsers={users} currentUserId={userId} />
      <CreateChannelModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
} 