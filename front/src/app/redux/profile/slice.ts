import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
interface UserProfile {
  _id: string;
  username: string;
  email: string;
  contactNumber?: string;
  locationUrl?: string;
  address?: string;
  about?: string;
  profilePicture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BusinessProfile extends UserProfile {
  businessType?: string;
}

interface ProfileState {
  profile: UserProfile | BusinessProfile | null;
  loading: boolean;
  error: string | null;
}

// Initial State
const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

// Thunks
export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/uprofile/user/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }
);

export const fetchBusinessProfile = createAsyncThunk(
  'profile/fetchBusinessProfile',
  async (businessId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/bprofile/business/profile/${businessId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch business profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (profileData: Partial<UserProfile>, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/profile/updateuser`, profileData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user profile');
    }
  }
);

export const updateBusinessProfile = createAsyncThunk(
  'profile/updateBusinessProfile',
  async (profileData: Partial<BusinessProfile>, { rejectWithValue }) => {
    try {
      const response = await axios.put(`//api/updatebusiness/business/updateprofile/`, profileData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update business profile');
    }
  }
);

// Slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update User
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })

      // Fetch Business
      .addCase(fetchBusinessProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinessProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchBusinessProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Business
      .addCase(updateBusinessProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
