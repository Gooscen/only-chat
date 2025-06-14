import React, { createContext, useContext, useEffect, useState } from 'react';
import { Chat, Message, User } from '../types';
import { chatService } from '../services/chatService';
import { useAuth } from './AuthContext';

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  onlineUsers: User[];
  loading: boolean;
  sendMessage: (content: string, type?: 'text' | 'file' | 'image') => Promise<void>;
  sendFileMessage: (file: File) => Promise<void>;
  createChat: (participants: string[], isGroup?: boolean, name?: string) => Promise<Chat>;
  selectChat: (chatId: string) => void;
  searchUsers: (query: string) => Promise<User[]>;
  addFriend: (userId: string) => Promise<void>;
  getFriends: () => Promise<User[]>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      initializeChats();
      chatService.initializeWebSocket(user.id, handleNewMessage, handleUserOnline, handleUserOffline);
    }

    return () => {
      chatService.disconnect();
    };
  }, [user]);

  const initializeChats = async () => {
    try {
      setLoading(true);
      const userChats = await chatService.getUserChats();
      setChats(userChats);
    } catch (error) {
      console.error('Error initializing chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    
    // Update chat's last message
    setChats(prev => prev.map(chat => 
      chat.id === message.chatId 
        ? { ...chat, lastMessage: message, updatedAt: message.createdAt }
        : chat
    ));
  };

  const handleUserOnline = (user: User) => {
    setOnlineUsers(prev => {
      if (!prev.find(u => u.id === user.id)) {
        return [...prev, user];
      }
      return prev;
    });
  };

  const handleUserOffline = (userId: string) => {
    setOnlineUsers(prev => prev.filter(u => u.id !== userId));
  };

  const sendMessage = async (content: string, type: 'text' | 'file' | 'image' = 'text') => {
    if (!currentChat || !user) return;

    const message = await chatService.sendMessage(currentChat.id, content, type);
    handleNewMessage(message);
  };

  const sendFileMessage = async (file: File) => {
    if (!currentChat || !user) return;

    const message = await chatService.sendFileMessage(currentChat.id, file);
    handleNewMessage(message);
  };

  const createChat = async (participants: string[], isGroup = false, name?: string) => {
    const chat = await chatService.createChat(participants, isGroup, name);
    setChats(prev => [chat, ...prev]);
    return chat;
  };

  const selectChat = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
      const chatMessages = await chatService.getChatMessages(chatId);
      setMessages(chatMessages);
    }
  };

  const searchUsers = async (query: string) => {
    return await chatService.searchUsers(query);
  };

  const addFriend = async (userId: string) => {
    await chatService.addFriend(userId);
  };

  const getFriends = async () => {
    return await chatService.getFriends();
  };

  const value = {
    chats,
    currentChat,
    messages,
    onlineUsers,
    loading,
    sendMessage,
    sendFileMessage,
    createChat,
    selectChat,
    searchUsers,
    addFriend,
    getFriends,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}