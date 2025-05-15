// redux/profile/slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchUserProfile,
  updateUserProfile,
  fetchBusinessProfile,
  updateBusinessProfile,
  fetchProfile
} from './action';

interface ProfileState {
  loading: boolean;
  error: string | null;
  user: any | null;
  business: any | null;
  userProfile: any | null;
  businessProfile: any | null;
  previewImage: string | null;

}

const initialState: ProfileState = {
  loading: false,
  error: null,
  user: null,
  business: null,
  userProfile: null,
  businessProfile: null,
  previewImage: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.user = null;
      state.business = null;
      state.userProfile = null;
      state.businessProfile = null;
      state.error = null;
      state.loading = false;
    },
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Common loading and error handling
    const handlePending = (state: ProfileState) => {
      state.loading = true;
      state.error = null;
    };
    
    const handleRejected = (state: ProfileState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, handlePending)
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, handleRejected)

      // Update user profile
      .addCase(updateUserProfile.pending, handlePending)
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, handleRejected)

      // Fetch business profile
      .addCase(fetchBusinessProfile.pending, handlePending)
      .addCase(fetchBusinessProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.business = action.payload;
      })
      .addCase(fetchBusinessProfile.rejected, handleRejected)

      // Update business profile
      .addCase(updateBusinessProfile.pending, handlePending)
      .addCase(updateBusinessProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.business = action.payload;
      })
      .addCase(updateBusinessProfile.rejected, handleRejected)

      // Fetch profile (generic)
      .addCase(fetchProfile.pending, handlePending)
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const payload = action.payload || {};
        if ('user' in payload) {
          state.userProfile = payload.user;
        } else if ('businessUser' in payload) {
          state.businessProfile = payload.businessUser;
        }
      })
      .addCase(fetchProfile.rejected, handleRejected);
  },
});

export const { clearProfile, resetError } = profileSlice.actions;
export default profileSlice.reducer;