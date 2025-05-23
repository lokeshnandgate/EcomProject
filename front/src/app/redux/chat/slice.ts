import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../store/store';
import axiosInstance from '../../../utils/auth';

// Types
interface Participant {
  _id: string;
  participant: {
    _id: string;
    username: string;
    profilePic?: string;
    userType?: string;
  };
  participantModel: string;
}

interface Reaction {
  user: string;
  userModel: string;
  emoji: string;
  reactedAt: string;
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    profilePic?: string;
  };
  senderModel: string;
  content: string;
  attachments: Array<{
    url: string;
    fileType: string;
  }>;
  readBy: Array<{
    reader: string;
    readerModel: string;
    readAt: string;
  }>;
  reactions: Reaction[];
  replyTo?: Message;
  isEdited?: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface Chat {
  _id: string;
  participants: Participant[];
  lastMessage?: Message;
  isGroup: boolean;
  groupName?: string;
  groupDescription?: string;
  groupAdmin?: string;
  groupAdminModel?: string;
  groupImage?: string;
  unreadCounts: Array<{
    participant: string;
    count: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  error: null,
  success: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // General state management
    startLoading(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    setError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },
    resetSuccess(state) {
      state.success = false;
    },

    // Chat related reducers
    getChatsSuccess(state, action: PayloadAction<Chat[]>) {
      state.chats = action.payload;
      state.loading = false;
    },
    getChatDetailsSuccess(state, action: PayloadAction<Chat>) {
      state.currentChat = action.payload;
      state.loading = false;
    },
    createChatSuccess(state, action: PayloadAction<Chat>) {
      state.chats.unshift(action.payload);
      state.loading = false;
      state.success = true;
    },
    updateGroupChatSuccess(state, action: PayloadAction<Chat>) {
      const index = state.chats.findIndex(chat => chat._id === action.payload._id);
      if (index !== -1) {
        state.chats[index] = action.payload;
      }
      if (state.currentChat?._id === action.payload._id) {
        state.currentChat = action.payload;
      }
      state.loading = false;
      state.success = true;
    },
    deleteChatSuccess(state, action: PayloadAction<string>) {
      state.chats = state.chats.filter(chat => chat._id !== action.payload);
      if (state.currentChat?._id === action.payload) {
        state.currentChat = null;
      }
      state.loading = false;
      state.success = true;
    },

    // Message related reducers
    getMessagesSuccess(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
      state.loading = false;
    },
    sendMessageSuccess(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
      state.loading = false;
      state.success = true;
    },
    markAsReadSuccess(state, action: PayloadAction<{chatId: string, userId: string}>) {
      const chatIndex = state.chats.findIndex(chat => chat._id === action.payload.chatId);
      if (chatIndex !== -1) {
        const unreadIndex = state.chats[chatIndex].unreadCounts.findIndex(
          uc => uc.participant === action.payload.userId
        );
        if (unreadIndex !== -1) {
          state.chats[chatIndex].unreadCounts[unreadIndex].count = 0;
        }
      }
      state.loading = false;
    },
    deleteMessageSuccess(state, action: PayloadAction<{chatId: string, messageId: string}>) {
      state.messages = state.messages.filter(msg => msg._id !== action.payload.messageId);
      state.loading = false;
      state.success = true;
    },
    editMessageSuccess(state, action: PayloadAction<Message>) {
      const index = state.messages.findIndex(msg => msg._id === action.payload._id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
      state.loading = false;
      state.success = true;
    },
    reactToMessageSuccess(state, action: PayloadAction<{messageId: string, reactions: Reaction[]}>) {
      const index = state.messages.findIndex(msg => msg._id === action.payload.messageId);
      if (index !== -1) {
        state.messages[index].reactions = action.payload.reactions;
      }
      state.loading = false;
    },
  },
});

export const {
  startLoading,
  setError,
  resetSuccess,
  getChatsSuccess,
  getChatDetailsSuccess,
  createChatSuccess,
  updateGroupChatSuccess,
  deleteChatSuccess,
  getMessagesSuccess,
  sendMessageSuccess,
  markAsReadSuccess,
  deleteMessageSuccess,
  editMessageSuccess,
  reactToMessageSuccess,
} = chatSlice.actions;

export default chatSlice.reducer;