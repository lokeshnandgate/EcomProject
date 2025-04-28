// profileSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { updateUserProfile, updateBusinessProfile } from './action';

interface ProfileState {
  user: any | null;
  business: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  user: null,
  business: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle User Profile Update
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update user profile';
      })
      // Handle Business Profile Update
      .addCase(updateBusinessProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBusinessProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.business = action.payload;
        state.error = null;
      })
      .addCase(updateBusinessProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string | undefined) || 'Failed to update business profile';
      });
  },
});

export const { clearProfileError } = profileSlice.actions;

export default profileSlice.reducer;
