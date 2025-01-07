import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await auth()
    if (!session || !session.userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const userId = session.userId
    const { memberId } = await req.json();

    // Check if the user is an admin of the channel
    const isAdmin = await prisma.channelMember.findFirst({
      where: {
        userId,
        channelId: params.channelId,
        isAdmin: true,
      },
    });

    if (!isAdmin) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const member = await prisma.channelMember.create({
      data: {
        userId: memberId,
        channelId: params.channelId,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.log("[CHANNEL_MEMBERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 