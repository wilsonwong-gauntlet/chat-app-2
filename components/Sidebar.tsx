'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

type Channel = {
  id: string
  name: string
}

export default function Sidebar() {
  const { user } = useUser()
  const [channels, setChannels] = useState<Channel[]>([])

  useEffect(() => {
    // Fetch channels from API
    const fetchChannels = async () => {
      const response = await fetch('/api/channels')
      const data = await response.json()
      setChannels(data)
    }

    fetchChannels()
  }, [])

  return (
    <div className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-4">Channels</h2>
      <ul>
        {channels.map((channel) => (
          <li key={channel.id}>
            <Link href={`/channel/${channel.id}`}>{channel.name}</Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <p>{user?.firstName} {user?.lastName}</p>
        <Link href="/sign-out">Sign Out</Link>
      </div>
    </div>
  )
}

