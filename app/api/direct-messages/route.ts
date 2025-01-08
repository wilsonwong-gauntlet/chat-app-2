import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { pusherServer } from '@/lib/pusher'
import { generateDownloadURL } from '@/lib/s3'

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

    const { content, receiverId, fileKey, fileName } = await req.json()
    console.log('Received DM data:', { content, receiverId, fileKey, fileName })

    if (!receiverId) {
      return new NextResponse('Receiver ID missing', { status: 400 })
    }

    let fileUrl = null
    if (fileKey) {
      fileUrl = await generateDownloadURL(fileKey)
      console.log('Generated file URL:', fileUrl)
    }

    const message = await prisma.directMessage.create({
      data: {
        content: content || '',
        fileUrl,
        fileName,
        fileKey,
        senderId: userId,
        receiverId,
      },
      include: {
        sender: true,
        reactions: true,
      }
    })

    console.log('Created DM:', message)

    // Trigger Pusher events for both sender and receiver
    const channelName = `private-user-${receiverId}`
    await pusherServer.trigger(channelName, 'new-message', message)

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error creating direct message:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 