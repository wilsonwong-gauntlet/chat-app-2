import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Messages from './Messages'
import MessageInput from './MessageInput'

export default async function ChatArea({ channelId }: { channelId: string }) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Verify channel access
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: { 
      name: true,
      isPrivate: true,
    },
  })

  if (!channel) {
    redirect('/')
  }

  // For private channels, verify membership
  if (channel.isPrivate) {
    const membership = await prisma.channelMember.findFirst({
      where: {
        userId,
        channelId,
      },
    })
  
    if (!membership && channel.isPrivate) {
      redirect('/')
    }
  }

  const messages = await prisma.message.findMany({
    where: {
      channelId,
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold">#{channel?.name}</h2>
      </div>
      <Messages initialMessages={messages} channelId={channelId} />
      <MessageInput channelId={channelId} />
    </div>
  )
}

