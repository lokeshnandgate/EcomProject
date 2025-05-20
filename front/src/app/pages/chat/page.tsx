'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../redux/store/store';
import { useRouter, useSearchParams } from 'next/navigation';
import axiosInstance from '../../../utils/auth';
import {
  fetchChatRooms,
  createOrGetChatRoom,
  fetchMessages,
  sendMessage,
  markMessageAsRead,
  setTypingStatus,
  updateLastSeenTime,
  handleNewMessage as createNewMessageAction,
  handleTypingStart,
  handleTypingStop,
  handleMessageRead,
  handleNewNotification
} from './../../redux/chat/action';
import { RootState } from '../../redux/store/store';
import io from 'socket.io-client';

const ChatPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const { rooms, currentRoom, messages, loading, error, typingUsers } = useSelector((state: RootState) => state.chat);
  const currentUser = useSelector((state: RootState) => state.user);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001', {
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`
      }
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
    });

    socketRef.current.on('newMessage', (message: any) => {
      dispatch(createNewMessageAction(message) as any);
    });

    socketRef.current.on('typingStart', (userId: string) => {
      dispatch(handleTypingStart(userId) as any);
    });

    socketRef.current.on('typingStop', (userId: string) => {
      dispatch(handleTypingStop(userId) as any);
    });

    socketRef.current.on('messageRead', (messageId: string) => {
      dispatch(handleMessageRead(messageId) as any);
    });

    socketRef.current.on('newNotification', (notification: any) => {
      dispatch(handleNewNotification(notification) as any);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [dispatch]);

  // Fetch chat rooms on component mount
  useEffect(() => {
    dispatch(fetchChatRooms());
  }, [dispatch]);

  // Handle initial chat room selection from query params
  useEffect(() => {
    if (userId) {
      handleSelectUser(userId);
    }
  }, [userId]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when opening chat
  useEffect(() => {
    if (currentRoom && messages.length > 0 && currentUser?._id) {
      const unreadMessages = messages.filter(
        msg => msg.status !== 'read' && msg.sender._id !== currentUser._id
      );
      
      unreadMessages.forEach(msg => {
        dispatch(markMessageAsRead(msg._id));
        if (socketRef.current) {
          socketRef.current.emit('markAsRead', msg._id);
        }
      });
    }
  }, [currentRoom, messages, currentUser?._id, dispatch]);

  const handleSelectUser = async (userId: string) => {
    setSelectedUser(userId);
    try {
      const room = await dispatch(createOrGetChatRoom(userId));
      if (room) {
        dispatch(fetchMessages(room._id));
        dispatch(updateLastSeenTime(room._id));
      }
    } catch (error) {
      console.error('Error selecting user:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentRoom) return;
    
    try {
      const newMessage = await dispatch(sendMessage(currentRoom._id, message));
      setMessage('');
      
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', newMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!currentRoom) return;
    
    dispatch(setTypingStatus(currentRoom._id, isTyping));
    
    if (socketRef.current) {
      socketRef.current.emit(isTyping ? 'typingStart' : 'typingStop', currentRoom._id);
    }
  };

  const getParticipant = () => {
    if (!currentRoom || !currentUser?._id) return null;
    
    return currentRoom.participants.find(
      (p: any) => p.participantId._id !== currentUser._id
    );
  };

  const getLastSeen = () => {
    const participant = getParticipant();
    if (!participant) return '';

    if (!participant.lastSeen) return 'Never seen';
    
    const lastSeenDate = new Date(participant.lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Online now';
    if (diffInMinutes < 60) return `Last seen ${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    if (diffInMinutes < 1440) return `Last seen ${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) === 1 ? '' : 's'} ago`;
    
    return `Last seen ${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) === 1 ? '' : 's'} ago`;
  };

  const isTyping = () => {
    const participant = getParticipant();
    if (!participant || !typingUsers.length) return false;
    
    return typingUsers.includes(participant.participantId._id);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 border-r border-gray-300 bg-white">
        <div className="p-4 border-b border-gray-300">
          <h2 className="text-xl font-semibold">Chats</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100%-60px)]">
          {loading && !rooms.length ? (
            <div className="p-4 text-center">Loading chats...</div>
          ) : (
            rooms.map(room => {
              const participant = room.participants.find(
                (p: any) => p.participantId._id !== currentUser?._id
              );
              
              return (
                <div
                  key={room._id}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedUser === participant?.participantId._id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => participant?.participantId._id && handleSelectUser(participant.participantId._id)}
                >
                  <div className="flex items-center">
                    <img
                      src={participant?.participantId.profilePic || '/default-avatar.png'}
                      alt={participant?.participantId.username}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <h3 className="font-medium">{participant?.participantId.username}</h3>
                      <p className="text-sm text-gray-500 truncate">
                        {room.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-300 bg-white flex items-center">
              <img
                src={getParticipant()?.participantId.profilePic || '/default-avatar.png'}
                alt={getParticipant()?.participantId.username}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <h3 className="font-medium">{getParticipant()?.participantId.username}</h3>
                <p className="text-sm text-gray-500">
                  {isTyping() ? 'Typing...' : getLastSeen()}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map(msg => (
                <div
                  key={msg._id}
                  className={`mb-4 flex ${
                    msg.sender._id === currentUser?._id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender._id === currentUser?._id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender._id === currentUser?._id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.sender._id === currentUser?._id && (
                        <span className="ml-1">
                          {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓' : ''}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-gray-300 bg-white">
              <div className="flex items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  onFocus={() => handleTyping(true)}
                  onBlur={() => handleTyping(false)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-medium text-gray-600">Select a chat to start messaging</h3>
              <p className="text-gray-500 mt-2">Or start a new conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;