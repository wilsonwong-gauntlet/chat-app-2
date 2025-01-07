import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const channels = await prisma.channel.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      },
    })

    return NextResponse.json(channels)
  } catch (error) {
    console.error('Error fetching channels:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

