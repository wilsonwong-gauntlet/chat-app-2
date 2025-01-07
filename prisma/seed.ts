import { prisma } from '../lib/prisma'

const userData = [
  {
    email: 'alice@example.com',
    firstName: 'Alice',
    lastName: 'Johnson',
    avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Alice',
  },
  {
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Smith',
    avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Bob',
  },
  // ... add more users as needed
]

async function main() {
  // Create or get a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {
      firstName: 'Test',
      lastName: 'User',
    },
    create: {
      id: 'test_user_id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=TestUser',
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