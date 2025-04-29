// businessreg/action.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessType: string;
}
// Register Thunk
export const registerUser = createAsyncThunk(
  'user/register',
  async (formData: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/businessreg/breg`, formData);
      const data = response.data;
       if (!data.token || !data.userId || !data.userType) {
        return rejectWithValue('Invalid register response: Missing token, userId, or userType');
      }
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);