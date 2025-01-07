import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
  try {
    const { messageId, emoji, userId } = await request.json();

    // Check if user has already reacted with this emoji
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        messageId,
        userId,
        emoji,
      },
    });

    if (existingReaction) {
      // Remove reaction if it exists
      await prisma.reaction.delete({
        where: {
          id: existingReaction.id,
        },
      });
    } else {
      // Add new reaction
      await prisma.reaction.create({
        data: {
          messageId,
          userId,
          emoji,
        },
      });
    }

    // Get updated message with reactions
    const updatedMessage = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        user: true,
        reactions: true,
        channel: true,
      },
    });

    if (!updatedMessage) {
      throw new Error('Message not found');
    }

    // Trigger Pusher event to update reactions in real-time
    await pusherServer.trigger(
      `channel-${updatedMessage.channelId}`,
      'message-updated',
      updatedMessage
    );

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error handling reaction:', error);
    return NextResponse.json({ error: 'Failed to handle reaction' }, { status: 500 });
  }
}