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

interface RegisterResponse {
  token: string;
  userId: string;
  userType: string;
  message: string;
}

export const registerUser = createAsyncThunk<RegisterResponse, RegisterPayload>(
  'businessRegister/registerUser',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/businessreg/breg`, formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);
