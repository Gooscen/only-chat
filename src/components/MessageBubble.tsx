import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Message } from '../types';
import { Download, ExternalLink } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const messageTime = format(new Date(message.createdAt), 'HH:mm');
  const messageDate = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });

  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="space-y-2">
            <img
              src={message.content}
              alt="Shared image"
              className="max-w-xs rounded-lg shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLDivElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <div className="hidden bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed to load image</p>
            </div>
          </div>
        );
      
      case 'file':
        return (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg max-w-xs">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {message.fileName || 'File'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <button
                    onClick={() => window.open(message.content, '_blank')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        );
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} message-enter`}>
      <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {!isOwn && (
          <img
            src={message.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderName}`}
            alt={message.senderName}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
        )}
        
        <div className={`group relative ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
          {!isOwn && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-3">
              {message.senderName}
            </p>
          )}
          
          <div
            className={`relative px-4 py-2 rounded-2xl shadow-sm ${
              isOwn
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
            } ${message.type !== 'text' ? 'p-2' : ''}`}
          >
            {renderMessageContent()}
            
            <div className={`flex items-center justify-end space-x-1 mt-1 ${
              message.type === 'text' ? '' : 'px-2 pb-1'
            }`}>
              <span className={`text-xs ${
                isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {messageTime}
              </span>
              {isOwn && (
                <div className="flex items-center">
                  <div className={`w-1 h-1 rounded-full mr-1 ${
                    message.isRead ? 'bg-blue-200' : 'bg-blue-300'
                  }`} />
                  <div className={`w-1 h-1 rounded-full ${
                    message.isRead ? 'bg-blue-200' : 'bg-blue-300'
                  }`} />
                </div>
              )}
            </div>
          </div>
          
          {/* Tooltip with full timestamp */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            {messageDate}
          </div>
        </div>
      </div>
    </div>
  );
}