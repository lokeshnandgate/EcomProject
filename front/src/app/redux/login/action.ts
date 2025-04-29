// login/action.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface LoginPayload {
  identifier: string;
  password: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// User Login
export const loginUser = createAsyncThunk(
  'user/login',
  async ({ identifier, password }: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/api/auth/login/user`, {
        identifier,
        password,
      });
      // The backend should return: { token, userId, userType, ...other user data }
      const data = response.data;
      if (!data.token || !data.userId || !data.userType) {
        return rejectWithValue('Invalid login response: Missing token, userId, or userType');
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'User login failed');
    }
  }
);

// Business Login
export const loginBusiness = createAsyncThunk(
  'business/login',
  async ({ identifier, password }: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/api/auth/login/business`, {
        identifier,
        password,
      });
      // The backend should return: { token, userId, userType, ...other business data }
      const data = response.data;
       if (!data.token || !data.userId || !data.userType) {
        return rejectWithValue('Invalid login response: Missing token, userId, or userType');
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Business login failed');
    }
  }
);