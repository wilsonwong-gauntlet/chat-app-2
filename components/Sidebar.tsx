import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

interface Channel {
  id: string
  name: string
  description: string | null
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
}

interface Props {
  currentChannelId: string
}

export default async function Sidebar({ currentChannelId }: Props) {
  const { userId } = await auth()

  if (!userId) return null

  const channels = await prisma.channel.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      isPrivate: true,
      members: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  return (
    <div className="w-64 bg-gray-100 p-4">
      <h2 className="text-lg font-semibold mb-4">Channels</h2>
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
  )
}

