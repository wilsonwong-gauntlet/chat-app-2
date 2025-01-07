import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ChatArea from '@/components/ChatArea'

export default async function Home() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <ChatArea />
    </div>
  )
}

