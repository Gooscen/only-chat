import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Send, 
  Paperclip, 
  Image, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Info
} from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import MessageBubble from './MessageBubble';
import FileUpload from './FileUpload';
import { formatDistanceToNow } from 'date-fns';

interface ChatWindowProps {
  onMenuClick: () => void;
}

export default function ChatWindow({ onMenuClick }: ChatWindowProps) {
  const { currentChat, messages, sendMessage, sendFileMessage } = useChat();
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const otherParticipant = currentChat?.participants.find(p => p.id !== user?.id);
  const isAIChat = otherParticipant?.id === 'ai-assistant';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');
    
    try {
      await sendMessage(messageContent);
      
      // Simulate AI response for AI chats
      if (isAIChat) {
        setTimeout(async () => {
          const aiResponses = [
            "I understand! Let me help you with that.",
            "That's a great question! Here's what I think...",
            "I'm here to assist you. Would you like me to elaborate?",
            "Thanks for sharing that with me. Is there anything specific you'd like to know?",
            "I'm always happy to help! What else can I do for you today?"
          ];
          const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
          await sendMessage(randomResponse);
        }, 1000 + Math.random() * 2000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (file: File) => {
    sendFileMessage(file);
    setShowFileUpload(false);
  };

  if (!currentChat) {
    return null;
  }

  const displayName = currentChat.isGroup 
    ? currentChat.name || 'Group Chat'
    : otherParticipant?.username || 'Unknown User';

  const displayAvatar = currentChat.isGroup
    ? null
    : otherParticipant?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant?.username}`;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="relative">
            {currentChat.isGroup ? (
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {currentChat.participants.length}
                </span>
              </div>
            ) : (
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            
            {!currentChat.isGroup && otherParticipant?.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
            )}
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {displayName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentChat.isGroup 
                ? `${currentChat.participants.length} members`
                : otherParticipant?.isOnline 
                  ? 'Online' 
                  : otherParticipant?.lastSeen 
                    ? `Last seen ${formatDistanceToNow(new Date(otherParticipant.lastSeen), { addSuffix: true })}`
                    : 'Offline'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isAIChat && (
            <>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
                <Video className="w-5 h-5" />
              </button>
            </>
          )}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
            <Info className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                {isAIChat 
                  ? "Start a conversation with your AI assistant!"
                  : "Send a message to start the conversation"
                }
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === user?.id}
              />
            ))}
            {isTyping && (
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm">{otherParticipant?.username} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-2">
              <button
                onClick={() => setShowFileUpload(true)}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isAIChat ? "Ask your AI assistant anything..." : "Type a message..."}
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                style={{ minHeight: '24px', maxHeight: '120px' }}
              />
              
              <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400">
                <Smile className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <FileUpload
          onFileSelect={handleFileSelect}
          onClose={() => setShowFileUpload(false)}
        />
      )}
    </div>
  );
}