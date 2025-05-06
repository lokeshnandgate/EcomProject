// redux/chat/action.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/auth';

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (text: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/chat/send', { text });
      return response.data; // assume response returns { text: string }
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to send message');
    }
  }
);

export const clearMessages = () => ({ type: 'chat/clearMessages' });
