import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a test user (using a fixed ID for seeding)
  const user = await prisma.user.upsert({
    where: { id: 'seed_user' },
    update: {
      name: 'Seed User',
      email: 'seed@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seed',
    },
    create: {
      id: 'seed_user',
      name: 'Seed User',
      email: 'seed@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seed',
    },
  })

  // Create a general channel if it doesn't exist
  const generalChannel = await prisma.channel.upsert({
    where: { name: 'general' },
    update: {},
    create: {
      name: 'general',
      description: 'General discussion channel',
      isPrivate: false,
    },
  })

  // Ensure seed user is a member of the general channel
  await prisma.membership.upsert({
    where: {
      userId_channelId: {
        userId: user.id,
        channelId: generalChannel.id,
      },
    },
    update: {},
    create: {
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