import { useUser } from '@clerk/nextjs'

type Message = {
  id: string
  content: string
  userId: string
  createdAt: string
}

type Props = {
  messages: Message[]
}

export default function MessageList({ messages }: Props) {
  const { user } = useUser()

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`mb-4 ${
            message.userId === user?.id ? 'text-right' : 'text-left'
          }`}
        >
          <div
            className={`inline-block p-2 rounded-lg ${
              message.userId === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {message.content}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {new Date(message.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}

