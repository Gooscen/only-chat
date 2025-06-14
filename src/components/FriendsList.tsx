import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Users, MessageCircle, MoreVertical } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';

export default function FriendsList() {
  const [activeTab, setActiveTab] = useState<'friends' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const { getFriends, searchUsers, addFriend, createChat } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    loadFriends();
  }, []);

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

    if (activeTab === 'search') {
      const debounceTimer = setTimeout(handleSearch, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, activeTab, searchUsers]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const friendsList = await getFriends();
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId: string) => {
    try {
      await addFriend(userId);
      // Reload friends list
      await loadFriends();
      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  const handleStartChat = async (friendId: string) => {
    try {
      const chat = await createChat([friendId], false);
      // You might want to navigate to the chat here
      console.log('Chat created:', chat.id);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const isFriend = (userId: string) => {
    return friends.some(friend => friend.id === userId);
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Friends</h1>
          <p className="text-gray-600 dark:text-gray-400">Connect with people and start conversations</p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'friends'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>My Friends ({friends.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'search'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-5 h-5" />
              <span>Find Friends</span>
            </button>
          </div>

          {/* Search Bar */}
          {activeTab === 'search' && (
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {activeTab === 'friends' ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading friends...</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No friends yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Start connecting with people by searching for them
                  </p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    <span>Find Friends</span>
                  </button>
                </div>
              ) : (
                friends.map((friend) => (
                  <div key={friend.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={friend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`}
                          alt={friend.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {friend.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {friend.username}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {friend.email}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {friend.isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStartChat(friend.id)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Start Chat"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {searching ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Searching...</p>
                </div>
              ) : searchQuery.length < 2 ? (
                <div className="p-8 text-center">
                  <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Find Friends</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Type at least 2 characters to search for users
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Results</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No users found matching "{searchQuery}"
                  </p>
                </div>
              ) : (
                searchResults.map((result) => (
                  <div key={result.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <img
                        src={result.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.username}`}
                        alt={result.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {result.username}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {result.email}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isFriend(result.id) ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Friend</span>
                            <button
                              onClick={() => handleStartChat(result.id)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Start Chat"
                            >
                              <MessageCircle className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddFriend(result.id)}
                            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Add Friend</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}