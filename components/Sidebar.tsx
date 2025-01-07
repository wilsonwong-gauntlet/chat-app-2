import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import SidebarClient from './SidebarClient'
import type { User } from '@/types'

interface Props {
  currentChannelId?: string
  users: User[]
}

export default async function Sidebar({ currentChannelId, users }: Props) {
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
    <SidebarClient 
      channels={channels}
      currentChannelId={currentChannelId}
      users={users}
      userId={userId}
    />
  )
}

