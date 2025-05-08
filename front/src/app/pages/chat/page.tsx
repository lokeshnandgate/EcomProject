// src/app/chat/page.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store/store';
import { sendMessage, fetchChatHistory } from '../../redux/chat/action';
import { setCurrentChat } from '../../redux/chat/slice';
import { User } from '../../redux/chat/types';
import { BusinessUser , } from '../../redux/chat/types';
import { AppDispatch } from '../../redux/store/store';


  
const ChatPage = () => {

  const dispatch: AppDispatch = useDispatch();
  const { messages, loading, error, currentChat } = useSelector((state: RootState) => state.chat);
  const user = useSelector((state: RootState) => state.auth?.user);
  const [message, setMessage] = useState('');
  const [receiverType, setReceiverType] = useState<'User' | 'businessUser'>('User');
  const [contacts, setContacts] = useState<(User | BusinessUser)[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  console.log('Current user:', user);

  // Fetch contacts (you'll need to implement this based on your API)
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        // This should be replaced with your actual API call to fetch contacts
        // const response = await axiosInstance.get('/contacts');
        // setContacts(response.data);
        
        // Mock data for demonstration
        setContacts([
          // { _id: '1', username: 'User1', email: 'user1@example.com', userType: 'User' },
          // { _id: '2', username: 'Business1', email: 'business1@example.com', userType: 'businessUser' },
        ]);
      } catch (error) {
        console.error('Failed to fetch contacts', error);
      }
    };
    
    fetchContacts();
  }, []);

  // Load chat history when currentChat changes
  useEffect(() => {
    if (currentChat) {
      const receiver = contacts.find(c => c._id === currentChat);
      if (receiver) {
        setReceiverType(receiver.userType === 'User' ? 'User' : 'businessUser');
        dispatch(fetchChatHistory(currentChat));
      }
    }
  }, [currentChat, contacts, dispatch]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentChat) return;
    
    dispatch(sendMessage(currentChat, receiverType, message));
    setMessage('');
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Contacts sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Contacts</h2>
        </div>
        <div className="overflow-y-auto">
          {contacts.map(contact => (
            <div
              key={contact._id}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                currentChat === contact._id ? 'bg-blue-50' : ''
              }`}
              onClick={() => dispatch(setCurrentChat(contact._id))}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                  {contact.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{contact.username}</p>
                  <p className="text-sm text-gray-500">{contact.userType}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-semibold">
                {contacts.find(c => c._id === currentChat)?.username || 'Chat'}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {loading && messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <p>Loading messages...</p>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center p-4">{error}</div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex ${
                      msg.senderId === user?._id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.senderId === user?._id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.senderId === user?._id ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatDate(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={!message.trim() || loading}
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex justify-center items-center bg-gray-50">
            <div className="text-center">
              <h3 className="text-xl font-medium text-gray-700">Select a chat to start messaging</h3>
              <p className="text-gray-500 mt-2">Choose from your contacts to begin conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;