export interface User {
  id: string
  firstName: string
  lastName: string
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
  reactions?: Reaction[]
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

export interface Reaction {
  emoji: string;
  userId: string;
}