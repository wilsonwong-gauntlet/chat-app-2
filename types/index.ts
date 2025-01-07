export interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  content: string
  userId: string
  channelId: string
  createdAt: Date
  updatedAt: Date
  user: User
}

export interface DirectMessage {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: Date
  updatedAt: Date
  sender: User
  receiver: User
} 