import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  chats: any[];
  currentChat: any | null;
  messages: any[];
  searchResults: {
    users: any[];
    businesses: any[];
  };
  loading: boolean;
  error: string | null;
  currentUser: any | null; // Added currentUser property
  
}

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  messages: [],
  searchResults: {
    users: [],
    businesses: []
  },
  loading: false, // Initialize loading in the initial state
  error: null,
  currentUser: null // Initialize currentUser in the initial state
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<any[]>) => {
      state.chats = action.payload;
    },
    setCurrentChat: (state, action: PayloadAction<any>) => {
      state.currentChat = action.payload;
    },
    addNewChat: (state, action: PayloadAction<any>) => {
      state.chats.unshift(action.payload);
    },
    updateChatLastMessage: (state, action: PayloadAction<{ chatId: string; lastMessage: any }>) => {
      const { chatId, lastMessage } = action.payload;
      const chatIndex = state.chats.findIndex(chat => chat._id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = lastMessage;
        // Move to top
        const chat = state.chats.splice(chatIndex, 1)[0];
        state.chats.unshift(chat);
      }
      if (state.currentChat?._id === chatId) {
        state.currentChat.lastMessage = lastMessage;
      }
    },
    updateChatUnreadCount: (state, action: PayloadAction<{ chatId: string; count: number }>) => {
      const { chatId, count } = action.payload;
      const chatIndex = state.chats.findIndex(chat => chat._id === chatId);
      if (chatIndex !== -1) {
        const unreadIndex = state.chats[chatIndex].unreadCounts.findIndex(
          (uc: any) => uc.participant.toString() === state.currentUser?._id.toString()
        );
        if (unreadIndex !== -1) {
          state.chats[chatIndex].unreadCounts[unreadIndex].count = count;
        }
      }
    },
    setMessages: (state, action: PayloadAction<any[]>) => {
      state.messages = action.payload;
    },
    addMessages: (state, action: PayloadAction<any[]>) => {
      state.messages = [...action.payload, ...state.messages];
    },
    addMessage: (state, action: PayloadAction<any>) => {
      state.messages.push(action.payload);
      if (state.currentChat?._id === action.payload.chat) {
        state.currentChat.lastMessage = action.payload;
      }
    },
    updateMessage: (state, action: PayloadAction<any>) => {
      const messageIndex = state.messages.findIndex(msg => msg._id === action.payload._id);
      if (messageIndex !== -1) {
        state.messages[messageIndex] = action.payload;
      }
    },
    deleteMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(msg => msg._id !== action.payload);
    },
    setSearchResults: (state, action: PayloadAction<{ users: any[]; businesses: any[] }>) => {
      state.searchResults = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetChatState: () => initialState
  }
});

export const {
  setChats,
  setCurrentChat,
  addNewChat,
  updateChatLastMessage,
  updateChatUnreadCount,
  setMessages,
  addMessages,
  addMessage,
  updateMessage,
  deleteMessage,
  setSearchResults,
  setLoading,
  setError,
  resetChatState
} = chatSlice.actions;

export default chatSlice.reducer;