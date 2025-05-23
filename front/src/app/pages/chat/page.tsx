'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../redux/hooks';
import {
  fetchUserChats,
  fetchChatDetails,
  fetchMessages,
  sendMessage,
  createChat,
  updateGroupChat,
  addParticipants,
  removeParticipant,
  leaveGroup,
  deleteChat,
  markMessagesAsRead,
  deleteMessage,
  editMessage,
  reactToMessage,
} from '../../redux/chat/action';
import { RootState } from '../../redux/store/store';
import { resetSuccess } from '../../redux/chat/slice';

  const ChatPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
      chats,
      currentChat,
      messages,
      loading,
      error,
      success,
    } = useSelector((state: RootState) => state.chat);
    const user = useSelector((state: RootState) => state.user);

  // Local state
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [newChatParticipants, setNewChatParticipants] = useState<
    Array<{ participantId: string; participantType: string }>
  >([]);
  const [newGroupInfo, setNewGroupInfo] = useState({
    name: '',
    description: '',
  });
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  // Fetch user chats on mount
  useEffect(() => {
    dispatch(fetchUserChats());
  }, [dispatch]);

  // Reset success state after showing success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(resetSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  // Load chat details when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      dispatch(fetchChatDetails(selectedChat));
      dispatch(fetchMessages(selectedChat));
    }
  }, [selectedChat, dispatch]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (selectedChat && currentChat) {
      dispatch(markMessagesAsRead(selectedChat));
    }
  }, [selectedChat, currentChat, dispatch]);

  const handleSendMessage = useCallback(() => {
    if (!selectedChat || !newMessage.trim()) return;
    dispatch(sendMessage(selectedChat, newMessage));
    setNewMessage('');
  }, [selectedChat, newMessage, dispatch]);

  const handleCreateChat = useCallback(() => {
    if (newChatParticipants.length === 0) return;

    const isGroup = newChatParticipants.length > 1 || !!newGroupInfo.name;
    dispatch(
      createChat(
        newChatParticipants,
        isGroup,
        isGroup ? newGroupInfo.name : undefined,
        isGroup ? newGroupInfo.description : undefined
      )
    );
    setIsCreatingChat(false);
    setNewChatParticipants([]);
    setNewGroupInfo({ name: '', description: '' });
  }, [newChatParticipants, newGroupInfo, dispatch]);

  const handleAddParticipant = (participantId: string, participantType: string) => {
    if (!selectedChat) return;
    dispatch(addParticipants(selectedChat, [{ participantId, participantType }]));
  };

  const handleRemoveParticipant = (participantId: string) => {
    if (!selectedChat) return;
    dispatch(removeParticipant(selectedChat, participantId));
  };

  const handleLeaveGroup = () => {
    if (!selectedChat || !currentChat?.isGroup) return;
    dispatch(leaveGroup(selectedChat));
    setSelectedChat(null);
  };

  const handleDeleteChat = () => {
    if (!selectedChat) return;
    dispatch(deleteChat(selectedChat));
    setSelectedChat(null);
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    dispatch(editMessage(messageId, newContent));
    setEditingMessageId(null);
    setEditedContent('');
  };

  const handleReactToMessage = (messageId: string, emoji: string) => {
    dispatch(reactToMessage(messageId, emoji));
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!selectedChat) return;
    dispatch(deleteMessage(messageId, selectedChat));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Chat List */}
      <div className="w-1/4 border-r border-gray-300 bg-white">
        <div className="p-4 border-b border-gray-300 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Chats</h2>
          <button
            onClick={() => setIsCreatingChat(true)}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            New Chat
          </button>
        </div>

        {isCreatingChat && (
          <div className="p-4 border-b border-gray-300">
            <h3 className="font-medium mb-2">Create New Chat</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="User/Business ID"
                className="w-full p-2 border rounded"
                onChange={(e) =>
                  setNewChatParticipants([{
                    participantId: e.target.value,
                    participantType: 'User', // Default to User, could add selector
                  }])
                }
              />
              <input
                type="text"
                placeholder="Group Name (optional)"
                className="w-full p-2 border rounded"
                value={newGroupInfo.name}
                onChange={(e) =>
                  setNewGroupInfo({ ...newGroupInfo, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Group Description (optional)"
                className="w-full p-2 border rounded"
                value={newGroupInfo.description}
                onChange={(e) =>
                  setNewGroupInfo({ ...newGroupInfo, description: e.target.value })
                }
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateChat}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Create
                </button>
                <button
                  onClick={() => setIsCreatingChat(false)}
                  className="bg-gray-500 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && !chats.length ? (
          <div className="p-4">Loading chats...</div>
        ) : (
          <div className="overflow-y-auto">
            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => setSelectedChat(chat._id)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  selectedChat === chat._id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between">
                  <h3 className="font-medium">
                    {chat.isGroup
                      ? chat.groupName
                      : chat.participants
                          .filter((p) => p.participant._id !== user?._id)
                          .map((p) => p.participant.username)
                          .join(', ')}
                  </h3>
                  {(chat.unreadCounts?.find((uc) => uc.participant === user?._id)?.count ?? 0) > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {chat.unreadCounts.find((uc) => uc.participant === user?._id)?.count}
                    </span>
                  )}
                </div>
                {chat.lastMessage && (
                  <p className="text-sm text-gray-600 truncate">
                    {chat.lastMessage.sender.username}: {chat.lastMessage.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-300 bg-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  {currentChat?.isGroup
                    ? currentChat.groupName
                    : currentChat?.participants
                        .filter((p) => p.participant._id !== user?._id)
                        .map((p) => p.participant.username)
                        .join(', ')}
                </h2>
                {currentChat?.isGroup && (
                  <p className="text-sm text-gray-600">{currentChat.groupDescription}</p>
                )}
              </div>
              {currentChat?.isGroup && (
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      const newName = prompt('Enter new group name', currentChat.groupName);
                      if (newName) {
                        dispatch(updateGroupChat(currentChat._id, newName));
                      }
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Edit Group
                  </button>
                  <button
                    onClick={handleLeaveGroup}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Leave Group
                  </button>
                </div>
              )}
              <button
                onClick={handleDeleteChat}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
              >
                Delete Chat
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading && messages.length === 0 ? (
                <div>Loading messages...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : messages.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.sender._id === user?._id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender._id === user?._id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{message.sender.username}</span>
                        <span className="text-xs opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </span>
                        {message.isEdited && (
                          <span className="text-xs opacity-70">(edited)</span>
                        )}
                      </div>

                      {editingMessageId === message._id ? (
                        <div className="mt-1">
                          <input
                            type="text"
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="w-full p-1 text-black"
                          />
                          <div className="flex space-x-2 mt-1">
                            <button
                              onClick={() =>
                                handleEditMessage(message._id, editedContent)
                              }
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingMessageId(null)}
                              className="text-xs bg-gray-500 text-white px-2 py-1 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="mt-1">{message.content}</p>
                          {message.attachments?.length > 0 && (
                            <div className="mt-2">
                              {message.attachments.map((attachment, idx) => (
                                <div key={idx} className="mt-1">
                                  {/* Render attachments appropriately */}
                                  {attachment.fileType.startsWith('image/') ? (
                                    <img
                                      src={attachment.url}
                                      alt="Attachment"
                                      className="max-w-full h-auto rounded"
                                    />
                                  ) : (
                                    <a
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 underline"
                                    >
                                      Download {attachment.fileType.split('/')[1]} file
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {message.reactions?.length > 0 && (
                        <div className="flex space-x-1 mt-1">
                          {message.reactions.map((reaction, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-white bg-opacity-20 rounded-full px-1"
                            >
                              {reaction.emoji}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-end space-x-2 mt-1">
                        {message.sender._id === user?._id && (
                          <>
                            <button
                              onClick={() => {
                                setEditingMessageId(message._id);
                                setEditedContent(message.content);
                              }}
                              className="text-xs hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(message._id)}
                              className="text-xs hover:underline"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleReactToMessage(message._id, '👍')}
                          className="text-xs hover:underline"
                        >
                          React
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-300 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Select a chat</h2>
              <p className="text-gray-600">Or create a new one to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Success/Error Notifications */}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          Operation successful!
        </div>
      )}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          {error}
        </div>
      )}
    </div>
    );
  };
  
  export default ChatPage;