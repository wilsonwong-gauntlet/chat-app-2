import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
  try {
    const { messageId, emoji, userId } = await request.json();

    // First try to find a message
    let message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { channel: true }
    });

    let isDM = false;
    if (!message) {
      // If not a regular message, try to find a DM
      const directMessage = await prisma.directMessage.findUnique({
        where: { id: messageId }
      });
      if (directMessage) {
        isDM = true;
      } else {
        throw new Error('Message not found');
      }
    }

    // Check if user has already reacted with this emoji
    const existingReaction = await prisma.reaction.findFirst({
      where: {
        userId,
        emoji,
        ...(isDM 
          ? { directMessageId: messageId }
          : { messageId: messageId }
        ),
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
          emoji,
          userId,
          ...(isDM 
            ? { directMessageId: messageId }
            : { messageId: messageId }
          ),
        },
      });
    }

    // Get updated message with reactions
    const updatedMessage = isDM 
      ? await prisma.directMessage.findUnique({
          where: { id: messageId },
          include: {
            sender: true,
            receiver: true,
            reactions: true,
          },
        })
      : await prisma.message.findUnique({
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

    // Trigger appropriate Pusher event
    if (isDM) {
      const dm = updatedMessage as any;
      await pusherServer.trigger(
        `private-user-${dm.senderId}`,
        'message-updated',
        updatedMessage
      );
      await pusherServer.trigger(
        `private-user-${dm.receiverId}`,
        'message-updated',
        updatedMessage
      );
    } else {
      const msg = updatedMessage as any;
      await pusherServer.trigger(
        `channel-${msg.channelId}`,
        'message-updated',
        updatedMessage
      );
    }

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Error handling reaction:', error);
    return NextResponse.json({ error: 'Failed to handle reaction' }, { status: 500 });
  }
}