import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export const registerUser = createAsyncThunk(
  'user/register',
  async ({ username, email, password }: RegisterPayload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/userreg/register`, {
        username,
        email,
        password,
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);
