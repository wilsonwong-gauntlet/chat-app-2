import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { syncUser } from '@/lib/utils'
import Sidebar from '@/components/Sidebar'
import ChatArea from '@/components/ChatArea'

export default async function Home({
  searchParams,
}: {
  searchParams: { channel?: string }
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Sync user data from Clerk
  const user = await syncUser()
  if (!user) {
    redirect('/sign-in')
  }

  // Get or create general channel
  const generalChannel = await prisma.channel.upsert({
    where: { name: 'general' },
    update: {},
    create: {
      name: 'general',
      description: 'General discussion channel',
      isPrivate: false,
    },
  })

  // Ensure user is a member of the general channel
  await prisma.membership.upsert({
    where: {
      userId_channelId: {
        userId: user.id,
        channelId: generalChannel.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      channelId: generalChannel.id,
    },
  })

  const channelId = searchParams.channel || generalChannel.id

  return (
    <div className="flex h-screen">
      <Sidebar currentChannelId={channelId} />
      <ChatArea channelId={channelId} />
    </div>
  )
}

