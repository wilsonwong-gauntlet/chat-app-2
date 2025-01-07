import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Messages from './Messages'
import MessageInput from './MessageInput'

interface Props {
  userId: string
}

export default async function DirectMessageArea({ userId }: Props) {
  const { userId: currentUserId } = await auth()

  if (!currentUserId) {
    redirect('/sign-in')
  }

  const otherUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      lastName: true,
      avatar: true,
      email: true,
    },
  })

  if (!otherUser) {
    redirect('/')
  }

  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { 
          senderId: currentUserId, 
          receiverId: userId 
        },
        { 
          senderId: userId, 
          receiverId: currentUserId 
        },
      ],
    },
    include: {
      sender: true,
      receiver: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <img
            src={otherUser.avatar || '/default-avatar.png'}
            alt={`${otherUser.firstName} ${otherUser.lastName}`}
            className="w-8 h-8 rounded-full"
          />
          <h2 className="text-xl font-semibold">{otherUser.email}</h2>
        </div>
      </div>
      <Messages 
        initialMessages={messages} 
        userId={userId} 
        isDM 
        currentUserId={currentUserId}
      />
      <MessageInput receiverId={userId} isDM />
    </div>
  )
} 