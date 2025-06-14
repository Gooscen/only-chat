export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'file' | 'image' | 'system';
  fileName?: string;
  fileUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Chat {
  id: string;
  name?: string;
  isGroup: boolean;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface WebSocketMessage {
  type: 'message' | 'user_online' | 'user_offline' | 'typing';
  data: any;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}