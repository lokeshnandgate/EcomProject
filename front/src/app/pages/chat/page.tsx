"use client";

import React, { useState, useEffect } from 'react';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

// ===========================
// Axios Instance Setup
// ===========================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===========================
// Types
// ===========================
interface Participant {
  id: string;
  type: 'User' | 'businessUser';
}

interface Message {
  _id?: string;
  senderId: string;
  senderType: 'User' | 'businessUser';
  message: string;
  timestamp: Date;
  read: boolean;
}

interface ChatRoom {
  _id: string;
  participant1Id: string;
  participant1Type: 'User' | 'businessUser';
  participant2Id: string;
  participant2Type: 'User' | 'businessUser';
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// ===========================
// Async Actions (Thunks)
// ===========================
export const createChatRoom = createAsyncThunk(
  'chat/createChatRoom',
  async (participant2: { participant2Id: string, participant2Type: 'User' | 'businessUser' }) => {
    const response = await axiosInstance.post('/chat/addNewChatEntry', participant2);
    return response.data;
  }
);

export const addNewMessage = createAsyncThunk(
  'chat/addNewMessage',
  async (messageData: { roomId: string, message: string }) => {
    const response = await axiosInstance.post('/chat/addNewMessage', messageData);
    return response.data;
  }
);

export const getChatRooms = createAsyncThunk(
  'chat/getChatRooms',
  async () => {
    const response = await axiosInstance.post('/chat/getRooms');
    return response.data.rooms;
  }
);

export const findRoomOf2Users = createAsyncThunk(
  'chat/findRoomOf2Users',
  async (user2: { user2Id: string, user2Type: 'User' | 'businessUser' }) => {
    const response = await axiosInstance.post('/chat/findRoomOf2Users', user2);
    return response.data.room;
  }
);

// ===========================
// Slice
// ===========================
interface ChatState {
  chatRooms: ChatRoom[];
  currentChatRoom: ChatRoom | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  chatRooms: [],
  currentChatRoom: null,
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createChatRoom.fulfilled, (state, action) => {
        state.chatRooms.push(action.payload);
      })
      .addCase(getChatRooms.fulfilled, (state, action) => {
        state.chatRooms = action.payload;
      })
      .addCase(findRoomOf2Users.fulfilled, (state, action) => {
        state.currentChatRoom = action.payload;
      })
      .addCase(addNewMessage.fulfilled, (state, action) => {
        if (state.currentChatRoom && state.currentChatRoom._id === action.payload.roomId) {
          state.currentChatRoom.messages.push(action.payload);
        }
      });
  },
});

const store = configureStore({
  reducer: {
    chat: chatSlice.reducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
const useAppDispatch: () => typeof store.dispatch = useDispatch;

// ===========================
// Component
// ===========================
const ChatPage = () => {
  const dispatch = useAppDispatch();
  const { chatRooms, currentChatRoom } = useSelector((state: RootState) => state.chat);

  const [message, setMessage] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);

  useEffect(() => {
    dispatch(getChatRooms());
  }, [dispatch]);

  const handleCreateChatRoom = async () => {
    const participant2Id = prompt("Enter the User ID to chat with:");
    if (participant2Id) {
      await dispatch(createChatRoom({ participant2Id, participant2Type: 'User' }));
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() && selectedRoom) {
      await dispatch(addNewMessage({ roomId: selectedRoom._id, message }));
      setMessage('');
    }
  };

  const handleRoomClick = (room: ChatRoom) => {
    setSelectedRoom(room);
    dispatch(findRoomOf2Users({ user2Id: room.participant2Id, user2Type: room.participant2Type }));
  };

  return (
    <Provider store={store}>
      <div className="flex h-screen">
        <div className="w-1/4 bg-gray-100 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Chat Rooms</h2>
            <button
              onClick={handleCreateChatRoom}
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              New Chat
            </button>
          </div>

          <div className="space-y-2">
            {chatRooms.map((room) => (
              <div
                key={room._id}
                className={`p-3 rounded cursor-pointer ${
                  selectedRoom?._id === room._id ? 'bg-blue-500 text-white' : 'bg-white'
                }`}
                onClick={() => handleRoomClick(room)}
              >
                <p className="font-medium">{room.participant2Id}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-3/4 flex flex-col p-4 bg-white">
          {selectedRoom ? (
            <>
              <h3 className="text-xl font-semibold mb-4">
                Chat with {selectedRoom.participant2Id}
              </h3>
              <div className="flex-grow overflow-y-auto mb-4 space-y-2">
                {selectedRoom.messages.map((msg) => (
                  <div key={msg._id} className="p-3 bg-gray-200 rounded-lg">
                    <p>{msg.message}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <button onClick={handleSendMessage} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                  Send
                </button>
              </div>
            </>
          ) : (
            <p>Select a chat room to start messaging.</p>
          )}
        </div>
      </div>
    </Provider>
  );
};

export default ChatPage;
