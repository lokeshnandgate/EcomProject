'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchUserChats, 
  fetchChatDetails, 
  sendMessage, 
  fetchMessages, 
  markMessagesAsRead,
  createChat,
  searchUsersAndBusinesses,
  addParticipants,
  removeParticipant,
  leaveGroup,
  deleteChat,
  editMessage,
  reactToMessage,
  deleteMessage
} from '../../redux/chat/action';
import { RootState, AppDispatch } from '../../redux/store/store';
import { io, Socket } from 'socket.io-client';

const ChatPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { chats, currentChat, messages } = useSelector((state: RootState) => state.chat);
  const currentUser = useSelector((state: RootState) => state.user);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_BASE_URL || '');
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Set up socket listeners
  useEffect(() => {
    if (!socket || !currentUser) return;

    socket.emit('join', currentUser._id);

    socket.on('messageReceived', (message) => {
      // Handle new message (you'll need to adjust based on your Redux actions)
    });

    socket.on('typing', ({ chatId, userId }) => {
      if (currentChat?._id === chatId && userId !== currentUser._id) {
        setIsTyping(true);
        setTypingUser(userId);
      }
    });

    socket.on('stopTyping', ({ chatId, userId }) => {
      if (currentChat?._id === chatId && userId !== currentUser._id) {
        setIsTyping(false);
        setTypingUser(null);
      }
    });

    return () => {
      socket.off('messageReceived');
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, [socket, currentUser, currentChat]);

  // Fetch user chats on mount
  useEffect(() => {
    dispatch(fetchUserChats());
  }, [dispatch]);

  // Fetch messages when current chat changes
  useEffect(() => {
    if (currentChat?._id) {
      dispatch(fetchMessages(currentChat._id));
      dispatch(markMessagesAsRead(currentChat._id));
      scrollToBottom();
    }
  }, [currentChat?._id, dispatch]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !currentChat?._id) return;
    dispatch(sendMessage(currentChat._id, message));
    setMessage('');
    scrollToBottom();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartTyping = () => {
    if (socket && currentChat?._id) {
      socket.emit('typing', { chatId: currentChat._id, userId: currentUser._id });
    }
  };

  const handleStopTyping = () => {
    if (socket && currentChat?._id) {
      socket.emit('stopTyping', { chatId: currentChat._id, userId: currentUser._id });
    }
  };

  function handleLeaveGroup(event: React.MouseEvent<HTMLButtonElement>): void {
    throw new Error('Function not implemented.');
  }

  function handleDeleteChat(event: React.MouseEvent<HTMLButtonElement>): void {
      throw new Error('Function not implemented.');
    }
  
  function handleCreateChat(isGroup: boolean, groupName?: string): void {
      if (isGroup && groupName) {
          dispatch(createChat({ isGroup, groupName, participants: selectedUsers }));
      } else {
          dispatch(createChat({ isGroup: false, participants: selectedUsers }));
      }
      setSelectedUsers([]);
      setSearchQuery('');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
          <h1 className="text-xl font-bold">Messages</h1>
          <button 
            onClick={() => setShowNewChat(true)}
            className="p-2 rounded-full hover:bg-indigo-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full p-2 pl-10 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <svg
              className="absolute left-3 top-3 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => dispatch(fetchChatDetails(chat._id))}
              className={`p-4 border-b border-gray-200 flex items-center hover:bg-gray-50 cursor-pointer ${
                currentChat?._id === chat._id ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                {chat.isGroup ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-900">
                    {chat.isGroup ? chat.groupName : chat.participants[0].username}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {chat.lastMessage?.content || 'No messages yet'}
                </p>
              </div>
              {chat.unreadCounts > 0 && (
                <span className="ml-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {chat.unreadCounts}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="hidden md:flex flex-col flex-1">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <button 
                  onClick={() => setShowInfo(true)}
                  className="md:hidden mr-2 p-1 rounded-full hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  {currentChat.isGroup ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-medium text-gray-900">
                    {currentChat.isGroup ? currentChat.groupName : currentChat.participants[0].username}
                  </h2>
                  {isTyping && typingUser && (
                    <p className="text-xs text-gray-500 italic">Typing...</p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setShowInfo(true)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex mb-4 ${msg.sender._id === currentUser._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                      msg.sender._id === currentUser._id
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {msg.sender._id !== currentUser._id && (
                        <span className="font-medium text-sm mr-2">{msg.sender.username}</span>
                      )}
                      <span className="text-xs opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={handleStartTyping}
                  onBlur={handleStopTyping}
                  placeholder="Type a message..."
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="bg-indigo-600 text-white px-4 py-3 rounded-r-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
            <div className="max-w-md text-center p-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No chat selected</h3>
              <p className="mt-2 text-sm text-gray-500">Select a chat from the sidebar or start a new conversation</p>
              <button
                onClick={() => setShowNewChat(true)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                New Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chat Info Drawer */}
      {showInfo && currentChat && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowInfo(false)}></div>
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                  <div className="p-4 bg-indigo-600 text-white">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium">Chat Info</h2>
                      <button
                        onClick={() => setShowInfo(false)}
                        className="p-1 rounded-full hover:bg-indigo-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex flex-col items-center mb-6">
                      <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                        {currentChat.isGroup ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {currentChat.isGroup ? currentChat.groupName : currentChat.participants[0].username}
                      </h3>
                      {currentChat.isGroup && (
                        <p className="text-sm text-gray-500">{currentChat.participants.length} members</p>
                      )}
                    </div>

                    {currentChat.isGroup && (
                      <>
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Group Members</h4>
                          <div className="space-y-3">
                            {currentChat.participants.map((participant: { _id: string; username: string }, index: number) => (
                              <div key={`${participant._id}-${index}`} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                </div>
                                <span className="text-sm">{participant.username}</span>
                              </div>
                              {participant._id !== currentUser._id && (
                                <button
                                onClick={() => removeParticipant(currentChat._id, participant._id)}
                                className="text-red-500 hover:text-red-700 text-sm"
                                >
                                Remove
                                </button>
                              )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setShowInfo(false);
                            addParticipants("true", selectedUsers);
                          }}
                          className="w-full mb-4 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Add Participants
                        </button>

                        <button
                          onClick={handleLeaveGroup}
                          className="w-full mb-4 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Leave Group
                        </button>
                      </>
                    )}

                    <button
                      onClick={handleDeleteChat}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowNewChat(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">New Chat</h3>
                <div className="mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {/* Search results would go here */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selected Users</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <div key={user._id} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                        <span className="text-sm">{user.username}</span>
                        <button
                          onClick={() => setSelectedUsers(selectedUsers.filter(u => u._id !== user._id))}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      setShowNewChat(false);
                      handleCreateChat(false);
                    }}
                    disabled={selectedUsers.length === 0}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
                  >
                    Start Chat
                  </button>
                  <button
                    onClick={() => {
                      setShowNewChat(false);
                      handleCreateChat(true, "New Group");
                    }}
                    disabled={selectedUsers.length < 2}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300"
                  >
                    Create Group
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowNewChat(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;