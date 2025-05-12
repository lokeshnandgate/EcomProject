import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AppDispatch } from '../store/store';
import { createChatRoom, addNewMessage, getChatRooms, findRoomOf2Users, markMessagesAsRead, getUnreadMessagesCount } from './action';

// Types for chat data
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

// Define initial state
interface ChatState {
  chatRooms: ChatRoom[];
  currentChatRoom: ChatRoom | null;
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

const initialState: ChatState = {
  chatRooms: [],
  currentChatRoom: null,
  loading: false,
  error: null,
  unreadCount: 0,
};

// Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create chat room
      .addCase(createChatRoom.pending, (state) => {
        state.loading = true;
      })
      .addCase(createChatRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.chatRooms.push(action.payload);
      })
      .addCase(createChatRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add new message
      .addCase(addNewMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(addNewMessage.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentChatRoom?._id === action.payload.roomId) {
          if (state.currentChatRoom) {
            state.currentChatRoom.messages.push(action.payload);
          }
        }
      })
      .addCase(addNewMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get all chat rooms
      .addCase(getChatRooms.pending, (state) => {
        state.loading = true;
      })
      .addCase(getChatRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.chatRooms = action.payload;
      })
      .addCase(getChatRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Find chat room between two users
      .addCase(findRoomOf2Users.pending, (state) => {
        state.loading = true;
      })
      .addCase(findRoomOf2Users.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChatRoom = action.payload;
      })
      .addCase(findRoomOf2Users.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Mark messages as read
      .addCase(markMessagesAsRead.pending, (state) => {
        state.loading = true;
      })
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChatRoom?.messages.forEach((message) => {
          if (action.payload.messageIds.includes(message._id || '')) {
            message.read = true;
          }
        });
      })
      .addCase(markMessagesAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get unread messages count
      .addCase(getUnreadMessagesCount.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUnreadMessagesCount.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadCount = action.payload;
      })
      .addCase(getUnreadMessagesCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default chatSlice.reducer;
