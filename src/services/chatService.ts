import { Chat, Message, User } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { authService } from './authService';

class ChatService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<(message: Message) => void> = new Set();
  private userOnlineHandlers: Set<(user: User) => void> = new Set();
  private userOfflineHandlers: Set<(userId: string) => void> = new Set();

  initializeWebSocket(
    userId: string,
    onMessage: (message: Message) => void,
    onUserOnline: (user: User) => void,
    onUserOffline: (userId: string) => void
  ) {
    // Simulate WebSocket connection
    this.messageHandlers.add(onMessage);
    this.userOnlineHandlers.add(onUserOnline);
    this.userOfflineHandlers.add(onUserOffline);

    // Simulate some online users
    setTimeout(() => {
      const mockUsers = this.getMockUsers().slice(0, 3);
      mockUsers.forEach(user => onUserOnline(user));
    }, 1000);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
    this.userOnlineHandlers.clear();
    this.userOfflineHandlers.clear();
  }

  async getUserChats(): Promise<Chat[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const chats = this.getStoredChats();
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) return [];

    // Filter chats where current user is a participant
    return chats.filter(chat => 
      chat.participants.some(p => p.id === currentUser.id)
    );
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    const messages = this.getStoredMessages();
    return messages.filter(m => m.chatId === chatId).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  async sendMessage(chatId: string, content: string, type: 'text' | 'file' | 'image' = 'text'): Promise<Message> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    const message: Message = {
      id: uuidv4(),
      chatId,
      senderId: currentUser.id,
      senderName: currentUser.username,
      senderAvatar: currentUser.avatar,
      content,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Store message
    const messages = this.getStoredMessages();
    messages.push(message);
    localStorage.setItem('chatflow_messages', JSON.stringify(messages));

    // Simulate WebSocket broadcast
    setTimeout(() => {
      this.messageHandlers.forEach(handler => handler(message));
    }, 100);

    return message;
  }

  async sendFileMessage(chatId: string, file: File): Promise<Message> {
    // Simulate file upload
    const fileUrl = URL.createObjectURL(file);
    const type = file.type.startsWith('image/') ? 'image' : 'file';

    return this.sendMessage(chatId, fileUrl, type as 'file' | 'image');
  }

  async createChat(participants: string[], isGroup = false, name?: string): Promise<Chat> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('User not authenticated');

    const allUsers = this.getMockUsers();
    const chatParticipants = allUsers.filter(u => 
      participants.includes(u.id) || u.id === currentUser.id
    );

    const chat: Chat = {
      id: uuidv4(),
      name: isGroup ? name : undefined,
      isGroup,
      participants: chatParticipants,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const chats = this.getStoredChats();
    chats.push(chat);
    localStorage.setItem('chatflow_chats', JSON.stringify(chats));

    return chat;
  }

  async searchUsers(query: string): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const users = this.getMockUsers();
    const currentUser = authService.getCurrentUser();
    
    return users.filter(user => 
      user.id !== currentUser?.id &&
      (user.username.toLowerCase().includes(query.toLowerCase()) ||
       user.email.toLowerCase().includes(query.toLowerCase()))
    );
  }

  async addFriend(userId: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Friend added:', userId);
  }

  async getFriends(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.getMockUsers().slice(0, 5);
  }

  private getStoredChats(): Chat[] {
    try {
      const chats = localStorage.getItem('chatflow_chats');
      return chats ? JSON.parse(chats) : this.getDefaultChats();
    } catch {
      return this.getDefaultChats();
    }
  }

  private getStoredMessages(): Message[] {
    try {
      const messages = localStorage.getItem('chatflow_messages');
      return messages ? JSON.parse(messages) : this.getDefaultMessages();
    } catch {
      return this.getDefaultMessages();
    }
  }

  private getMockUsers(): User[] {
    return [
      {
        id: 'user-1',
        username: 'Alice Johnson',
        email: 'alice@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        isOnline: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-2',
        username: 'Bob Smith',
        email: 'bob@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
        isOnline: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-3',
        username: 'Carol Davis',
        email: 'carol@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
        isOnline: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ai-assistant',
        username: 'AI Assistant',
        email: 'ai@chatflow.com',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AI',
        isOnline: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  private getDefaultChats(): Chat[] {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return [];

    const mockUsers = this.getMockUsers();
    
    return [
      {
        id: 'chat-1',
        isGroup: false,
        participants: [currentUser, mockUsers[0]],
        unreadCount: 2,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'chat-2',
        name: 'Team Discussion',
        isGroup: true,
        participants: [currentUser, ...mockUsers.slice(0, 3)],
        unreadCount: 0,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'chat-ai',
        isGroup: false,
        participants: [currentUser, mockUsers.find(u => u.id === 'ai-assistant')!],
        unreadCount: 0,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
  }

  private getDefaultMessages(): Message[] {
    return [
      {
        id: 'msg-1',
        chatId: 'chat-1',
        senderId: 'user-1',
        senderName: 'Alice Johnson',
        senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        content: 'Hey! How are you doing?',
        type: 'text',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'msg-2',
        chatId: 'chat-1',
        senderId: 'user-1',
        senderName: 'Alice Johnson',
        senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        content: 'Did you see the new project updates?',
        type: 'text',
        isRead: false,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 'msg-3',
        chatId: 'chat-ai',
        senderId: 'ai-assistant',
        senderName: 'AI Assistant',
        senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AI',
        content: 'Hello! I\'m your AI assistant. How can I help you today?',
        type: 'text',
        isRead: true,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
  }
}

export const chatService = new ChatService();