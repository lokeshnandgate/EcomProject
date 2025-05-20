import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  rooms: any[];
  currentRoom: any | null;
  messages: any[];
  loading: boolean;
  error: string | null;
  notifications: any[];
  typingUsers: string[];
}

const initialState: ChatState = {
  rooms: [],
  currentRoom: null,
  messages: [],
  loading: false,
  error: null,
  notifications: [],
  typingUsers: []
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setRooms(state, action: PayloadAction<any[]>) {
      state.rooms = action.payload;
    },
    setCurrentRoom(state, action: PayloadAction<any>) {
      state.currentRoom = action.payload;
    },
    setMessages(state, action: PayloadAction<any[]>) {
      state.messages = action.payload;
    },
    addMessage(state, action: PayloadAction<any>) {
      state.messages.push(action.payload);
    },
    updateMessageStatus(state, action: PayloadAction<{ messageId: string; status: string }>) {
      const message = state.messages.find(m => m._id === action.payload.messageId);
      if (message) {
        message.status = action.payload.status;
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    addNotification(state, action: PayloadAction<any>) {
      state.notifications.push(action.payload);
    },
    clearNotifications(state) {
      state.notifications = [];
    },
    addTypingUser(state, action: PayloadAction<string>) {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    removeTypingUser(state, action: PayloadAction<string>) {
      state.typingUsers = state.typingUsers.filter(userId => userId !== action.payload);
    },
    resetChatState(state) {
      Object.assign(state, initialState);
    }
  }
});

export const {
  setRooms,
  setCurrentRoom,
  setMessages,
  addMessage,
  updateMessageStatus,
  setLoading,
  setError,
  addNotification,
  clearNotifications,
  addTypingUser,
  removeTypingUser,
  resetChatState
} = chatSlice.actions;

export default chatSlice.reducer;