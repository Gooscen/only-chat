import React, { useState, useEffect } from 'react';
import { X, Search, Users, User, Bot, Plus } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { User as UserType } from '../types';

interface NewChatModalProps {
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

export default function NewChatModal({ onClose, onChatCreated }: NewChatModalProps) {
  const [activeTab, setActiveTab] = useState<'direct' | 'group' | 'ai'>('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const { searchUsers, createChat } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const results = await searchUsers(searchQuery.trim());
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setSearching(false);
      }
    };

    const debounceTimer = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchUsers]);

  const handleUserSelect = (selectedUser: UserType) => {
    if (activeTab === 'direct') {
      // For direct chat, immediately create chat
      handleCreateChat([selectedUser.id]);
    } else {
      // For group chat, add to selection
      if (!selectedUsers.find(u => u.id === selectedUser.id)) {
        setSelectedUsers([...selectedUsers, selectedUser]);
      }
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleCreateChat = async (participants?: string[]) => {
    if (activeTab === 'ai') {
      try {
        setLoading(true);
        const chat = await createChat(['ai-assistant'], false);
        onChatCreated(chat.id);
      } catch (error) {
        console.error('Error creating AI chat:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    const chatParticipants = participants || selectedUsers.map(u => u.id);
    
    if (chatParticipants.length === 0) return;

    try {
      setLoading(true);
      const isGroup = activeTab === 'group';
      const chat = await createChat(
        chatParticipants,
        isGroup,
        isGroup ? groupName || `Group with ${selectedUsers.map(u => u.username).join(', ')}` : undefined
      );
      onChatCreated(chat.id);
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'direct', label: 'Direct Message', icon: User },
    { id: 'group', label: 'Group Chat', icon: Users },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            New Chat
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'ai' ? (
            <div className="p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                AI Assistant
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start a conversation with your AI assistant. Get help, ask questions, or just chat!
              </p>
              <button
                onClick={() => handleCreateChat()}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Start AI Chat'}
              </button>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Group Name Input (only for group tab) */}
              {activeTab === 'group' && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    placeholder="Group name (optional)"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Selected Users (for group chat) */}
              {activeTab === 'group' && selectedUsers.length > 0 && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Selected ({selectedUsers.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full"
                      >
                        <img
                          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                          alt={user.username}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="text-sm text-blue-800 dark:text-blue-200">
                          {user.username}
                        </span>
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {searching ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Searching...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery.length < 2 
                      ? 'Type at least 2 characters to search' 
                      : 'No users found'
                    }
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {searchResults.map((searchUser) => (
                      <button
                        key={searchUser.id}
                        onClick={() => handleUserSelect(searchUser)}
                        className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                      >
                        <img
                          src={searchUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${searchUser.username}`}
                          alt={searchUser.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {searchUser.username}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {searchUser.email}
                          </p>
                        </div>
                        {activeTab === 'group' && selectedUsers.find(u => u.id === searchUser.id) && (
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <Plus className="w-3 h-3 text-white transform rotate-45" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Create Group Button */}
              {activeTab === 'group' && selectedUsers.length > 0 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleCreateChat()}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : `Create Group (${selectedUsers.length} members)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}