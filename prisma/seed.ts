import { prisma } from '../lib/prisma'

async function main() {
  // Create or get a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: 'test_user_id',
      name: 'Test User',
      email: 'test@example.com',
    },
  })

  // Create or update general channel
  const generalChannel = await prisma.channel.upsert({
    where: {
      name: "general",
    },
    update: {},
    create: {
      name: "general",
      isPrivate: false,
    },
  })

  // Add initial member (if needed)
  await prisma.channelMember.upsert({
    where: {
      userId_channelId: {
        userId: user.id,
        channelId: generalChannel.id,
      }
    },
    update: {
      isAdmin: true,
    },
    create: {
      userId: user.id,
      channelId: generalChannel.id,
      isAdmin: true,
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 