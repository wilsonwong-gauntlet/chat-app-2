import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { pusherServer } from '@/lib/pusher'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await req.text()
    const [socketId, channel] = data.split('&').map(str => str.split('=')[1])

    const authResponse = pusherServer.authorizeChannel(socketId, channel, {
      user_id: userId,
    })

    return NextResponse.json(authResponse)
  } catch (error) {
    console.error('Error authorizing Pusher channel:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 