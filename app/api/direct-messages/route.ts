import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { pusherServer } from '@/lib/pusher'

export async function GET(req: Request) {
  const { userId } = await auth()
  const { searchParams } = new URL(req.url)
  const otherId = searchParams.get('userId')

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  if (!otherId) {
    return new NextResponse('Other user ID is required', { status: 400 })
  }

  try {
    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherId },
          { senderId: otherId, receiverId: userId },
        ],
      },
      include: {
        sender: true,
        receiver: true,
        reactions: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching direct messages:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { content, receiverId } = await req.json()

    const message = await prisma.directMessage.create({
      data: {
        content,
        senderId: userId,
        receiverId,
      },
      include: {
        sender: true,
        receiver: true,
        reactions: true,
      },
    })

    // Trigger Pusher event for real-time updates
    await pusherServer.trigger(`private-user-${receiverId}`, 'new-dm', message)

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error creating direct message:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 