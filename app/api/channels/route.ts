import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get all public channels and private channels where user is a member
    const channels = await prisma.channel.findMany({
      where: {
        OR: [
          { isPrivate: false },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    })

    return NextResponse.json(channels)
  } catch (error) {
    console.log('[CHANNELS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    const { name, isPrivate } = await req.json()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const channel = await prisma.channel.create({
      data: {
        name,
        isPrivate,
        members: {
          create: {
            userId,
            isAdmin: true,
          },
        },
      },
      include: {
        members: true,
      },
    })

    return NextResponse.json(channel)
  } catch (error) {
    console.log('[CHANNELS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

