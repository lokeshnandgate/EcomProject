// src/redux/slices/chatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage } from './types';

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  currentChat: string | null; // ID of the current chat (user or business)
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
  currentChat: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCurrentChat: (state, action: PayloadAction<string | null>) => {
      state.currentChat = action.payload;
    },
    clearChat: () => initialState,
  },
});

export const {
  addMessage,
  setMessages,
  setLoading,
  setError,
  setCurrentChat,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;