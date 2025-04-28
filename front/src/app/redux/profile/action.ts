// actions.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Update User Profile
export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (userData: { userId: string, username: string, email: string, password: string, profilePicture?: string, address?: string, phoneNumber?: string, aboutMe?: string, socialMediaLinks?: object, location?: object }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/api/user/profileupdate', userData);
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'An error occurred while updating user profile');
      }
      return rejectWithValue('An unknown error occurred while updating user profile');
    }
  }
);

// Update Business Profile
export const updateBusinessProfile = createAsyncThunk(
  'profile/updateBusinessProfile',
  async (businessData: { businessId: string, username: string, email: string, password: string, businessType: string, profilePicture?: string, address?: string, phoneNumber?: string, aboutMe?: string, socialMediaLinks?: object, location?: object }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/api/business/profileUpdate', businessData);
      return response.data.business;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'An error occurred while updating business profile');
      }
      return rejectWithValue('An unknown error occurred while updating business profile');
    }
  }
);
