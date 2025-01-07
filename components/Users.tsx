'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { User } from '@/types'

interface Props {
  initialUsers: User[]
  currentUserId: string
}

const getDisplayName = (user: User) => ({
  firstName: user.firstName || 'Anonymous',
  lastName: user.lastName || ''
 })
 
 export default function Users({ initialUsers, currentUserId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedUserId = searchParams.get('dm')
 
  const users = initialUsers.filter(user => user.id !== currentUserId)
 
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Direct Messages</h2>
      <div className="space-y-2">
        {users.map((user) => {
          const { firstName, lastName } = getDisplayName(user)
          return (
            <button
              key={user.id}
              onClick={() => router.push(`/?dm=${user.id}`)}
              className={`w-full text-left p-2 rounded-md flex items-center gap-2 ${
                user.id === selectedUserId
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-200'
              }`}
            >
              <img
                src={user.avatar || '/default-avatar.png'}
                alt={`${firstName} ${lastName}`}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-sm font-medium">
                  {firstName} {lastName}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
 }