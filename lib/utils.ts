import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function syncUser() {
  const { userId } = await auth()
  if (!userId) return null

  const clerkUser = await currentUser()
  if (!clerkUser) return null

  return prisma.user.upsert({
    where: { id: userId },
    update: {
      name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      avatar: clerkUser.imageUrl,
    },
    create: {
      id: userId,
      name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      avatar: clerkUser.imageUrl,
    },
  })
}
