import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface LoginPayload {
  identifier: string;
  password: string;
  userType: 'user' | 'business';
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ identifier, password }: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/api/login/login`, {
        identifier,
        password,
      });

      const data = response.data;
      if (!data.token || !data.userId || !data.userType) {
        return rejectWithValue('Invalid login response');
      }

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('userInfo', JSON.stringify(data));

      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'User login failed');
    }
  }
);

export const loginBusiness = createAsyncThunk(
  'auth/loginBusiness',
  async ({ identifier, password }: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/api/login/businesslogin`, {
        identifier,
        password,
      });

      const data = response.data;
      if (!data.token || !data.userId || !data.userType) {
        return rejectWithValue('Invalid login response');
      }

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('businessInfo', JSON.stringify(data));

      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Business login failed');
    }
  }
);
