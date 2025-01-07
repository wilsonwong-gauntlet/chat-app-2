import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { syncUser } from '@/lib/utils'
import Sidebar from '@/components/Sidebar'
import ChatArea from '@/components/ChatArea'
import DirectMessageArea from '@/components/DirectMessageArea'

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Home({ searchParams }: PageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Sync user data from Clerk
  const user = await syncUser()
  if (!user) {
    redirect('/sign-in')
  }

  // Get all users for DM functionality
  const users = await prisma.user.findMany({
    orderBy: {
      firstName: "asc",
    },
  })

  // Get or create general channel
  const generalChannel = await prisma.channel.upsert({
    where: { name: 'general' },
    update: {},
    create: {
      name: 'general',
      isPrivate: false,
    },
  })

  // Ensure user is a member of the general channel
  await prisma.channelMember.upsert({
    where: {
      userId_channelId: {
        userId: user.id,
        channelId: generalChannel.id,
      },
    },
    update: {
      isAdmin: true,
    },
    create: {
      userId: user.id,
      channelId: generalChannel.id,
      isAdmin: true,
    },
  })

  const channelId = typeof searchParams.channel === 'string' 
    ? searchParams.channel 
    : generalChannel.id

  const dmUserId = typeof searchParams.dm === 'string' 
    ? searchParams.dm 
    : undefined

  return (
    <div className="flex h-screen">
      <Sidebar 
        currentChannelId={!dmUserId ? channelId : undefined} 
        users={users} 
      />
      {dmUserId ? (
        <DirectMessageArea userId={dmUserId} />
      ) : (
        <ChatArea channelId={channelId} />
      )}
    </div>
  )
}

