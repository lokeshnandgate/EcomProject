import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchUserProfile, updateUserProfile } from './action';

interface ProfileState {
  userInfo: any;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  userInfo: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // You can add any additional actions if needed, such as resetting error state
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle fetch user profile actions
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload && typeof action.payload === 'object' && 'message' in action.payload 
          ? (action.payload as { message: string }).message 
          : 'Failed to fetch profile';
      });

    // Handle update user profile actions
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.userInfo = action.payload; 
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload && typeof action.payload === 'object' && 'message' in action.payload 
          ? (action.payload as { message: string }).message 
          : 'Failed to update profile';
      });
  },
});

export const { resetError } = profileSlice.actions;

export default profileSlice.reducer;
