import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/auth';

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (text: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/chat/send', { text });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to send message');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/chat');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch messages');
    }
  }
);

export const clearMessages = () => ({ type: 'chat/clearMessages' });