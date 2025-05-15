// redux/profile/profileActions.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/auth';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Fetch user profile
export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/api/profile/user/profile`, {
        id, 
      });
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching user profile');
    }
  }
);

// Update user profile
export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (formData: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/api/profile/user/updateprofile`, formData);
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error updating user profile');
    }
  }
);

// Fetch business profile
export const fetchBusinessProfile = createAsyncThunk(
  'profile/fetchBusinessProfile',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/api/profile/business/profile`, {
        id, 
      });
      console.log('first',response)
      return response.data.businessUser;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching business profile');
    }
  }
);

// Update business profile
export const updateBusinessProfile = createAsyncThunk(
  'profile/updateBusinessProfile',
  async (formData: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`${API_URL}/api/profile/business/updateprofile`, formData);
      return response.data.business;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error updating business profile');
    }
  }
);

// redux/profile/profileActions.ts
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/profile/fetch/profile`,
        { id }
      );
      // Ensure the response has the expected structure
      return response.data || {};
    } catch (error: any) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);