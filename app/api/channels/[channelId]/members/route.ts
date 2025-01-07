import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
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

    // Fetch user data from Clerk
    const clerkUser = await clerkClient.users.getUser(memberId);

    // First, ensure the user exists in our database with updated Clerk data
    await prisma.user.upsert({
      where: { id: memberId },
      update: {
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        emailAddress: clerkUser.emailAddresses[0]?.emailAddress,
        username: clerkUser.username,
      },
      create: {
        id: memberId,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        emailAddress: clerkUser.emailAddresses[0]?.emailAddress,
        username: clerkUser.username,
      },
    });

    // Then create the channel member
    const member = await prisma.channelMember.create({
      data: {
        userId: memberId,
        channelId: params.channelId,
      },
      include: {
        user: true, // Include the user data in the response
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.log("[CHANNEL_MEMBERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 