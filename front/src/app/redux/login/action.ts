import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface LoginPayload {
  identifier: string;
  password: string;
  userType: 'user' | 'business';
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// User Login
export const loginUser = createAsyncThunk(
  'user/login',
  async ({ identifier, password, userType }: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/api/login/login`, {
        identifier,
        password,
      });
      const data = response.data;
      sessionStorage.setItem('token', data.token);
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
  async ({ identifier, password, userType }: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/api/login/businesslogin`, {
        identifier,
        password,
      });
      const data = response.data;
      sessionStorage.setItem('token', data.token);

      if (!data.token || !data.userId || !data.userType) {
        return rejectWithValue('Invalid login response: Missing token, userId, or userType');
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Business login failed');
    }
  }
);
