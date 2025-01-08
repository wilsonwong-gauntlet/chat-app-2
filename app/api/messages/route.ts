import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '../../../lib/prisma'
import { pusherServer } from '@/lib/pusher'
import { generateDownloadURL } from '@/lib/s3'

export async function GET(req: Request) {
  const { userId } = await auth()
  const { searchParams } = new URL(req.url)
  const channelId = searchParams.get('channelId')

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  if (!channelId) {
    return new NextResponse('Channel ID is required', { status: 400 })
  }

  try {
    // First get the channel to check if it's private
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { isPrivate: true }
    })

    if (!channel) {
      return new NextResponse('Channel not found', { status: 404 })
    }

    // First verify user has access to this channel
    if (channel.isPrivate) {
      const membership = await prisma.channelMember.findFirst({
        where: {
          userId,
          channelId,
        },
      })

      if (!membership) {
        return new NextResponse('Not authorized to access this channel', { status: 403 })
      }
    }

    // Then fetch messages
    const messages = await prisma.message.findMany({
      where: {
        channelId,
      },
      include: {
        user: true,
        reactions: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { content, channelId, fileKey, fileName } = await req.json()
    console.log('Received message data:', { content, channelId, fileKey, fileName })

    if (!channelId) {
      return new NextResponse('Channel ID missing', { status: 400 })
    }

    let fileUrl = null
    if (fileKey) {
      fileUrl = await generateDownloadURL(fileKey)
      console.log('Generated file URL:', fileUrl)
    }

    const message = await prisma.message.create({
      data: {
        content: content || '',
        fileUrl,
        fileName,
        fileKey,
        userId,
        channelId,
      },
      include: {
        user: true,
        reactions: true,
      }
    })
    
    console.log('Created message:', message)

    await pusherServer.trigger(`channel-${channelId}`, 'new-message', message)

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error creating message:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

