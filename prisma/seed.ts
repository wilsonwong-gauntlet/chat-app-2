import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a test user with your Clerk user ID
  const user = await prisma.user.upsert({
    where: { id: 'user_2dBwXDVVtPe1kcRgPt6Qh8p9XpN' }, // Replace with your Clerk user ID
    update: {},
    create: {
      id: 'user_2dBwXDVVtPe1kcRgPt6Qh8p9XpN', // Replace with your Clerk user ID
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
    },
  })

  // Create a general channel
  const generalChannel = await prisma.channel.create({
    data: {
      name: 'general',
      description: 'General discussion channel',
      isPrivate: false,
      members: {
        create: {
          userId: user.id,
        },
      },
    },
  })

  // Create some test messages
  await prisma.message.create({
    data: {
      content: 'Hello, world! 👋',
      userId: user.id,
      channelId: generalChannel.id,
    },
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 