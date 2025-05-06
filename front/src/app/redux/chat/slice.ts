// redux/chat/chatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sendMessage, clearMessages } from './action';

interface ChatState {
  messages: string[];
}

const initialState: ChatState = {
  messages: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage, (state, action: PayloadAction<string>) => {
        state.messages.push(action.payload);
      })
      .addCase(clearMessages, (state) => {
        state.messages = [];
      });
  },
});

export default chatSlice.reducer;
