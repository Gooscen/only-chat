import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Chat } from '../types';
import { Users, Bot } from 'lucide-react';

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
  currentUserId: string;
}

export default function ChatItem({ chat, isActive, onClick, currentUserId }: ChatItemProps) {
  const otherParticipant = chat.participants.find(p => p.id !== currentUserId);
  const isAIChat = otherParticipant?.id === 'ai-assistant';
  
  const displayName = chat.isGroup 
    ? chat.name || 'Group Chat'
    : otherParticipant?.username || 'Unknown User';

  const displayAvatar = chat.isGroup
    ? null
    : otherParticipant?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant?.username}`;

  const lastMessageTime = chat.lastMessage 
    ? formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: true })
    : formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true });

  return (
    <div
      onClick={onClick}
      className={`flex items-center space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
        isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {chat.isGroup ? (
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </div>
        ) : isAIChat ? (
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
        ) : (
          <img
            src={displayAvatar}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        
        {/* Online indicator for direct chats */}
        {!chat.isGroup && otherParticipant?.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
        )}
      </div>

      {/* Chat info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {displayName}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
            {lastMessageTime}
          </span>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {chat.lastMessage 
              ? chat.lastMessage.type === 'image' 
                ? '📷 Image'
                : chat.lastMessage.type === 'file'
                ? '📎 File'
                : chat.lastMessage.content
              : isAIChat 
                ? 'AI Assistant - Ready to help!'
                : 'No messages yet'
            }
          </p>
          
          {/* Unread count */}
          {chat.unreadCount > 0 && (
            <span className="flex-shrink-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-500 rounded-full min-w-[20px]">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}