import { createSlice } from '@reduxjs/toolkit';
import { registerUser } from './action';  // Corrected the import name

interface BusinessRegisterState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  userInfo: {
    token: string | null;
    userId: string | null;
    userType: string | null;
  } | null;
}

const initialState: BusinessRegisterState = {
  loading: false,
  error: null,
  successMessage: null,
  userInfo: {
    token: null,
    userId: null,
    userType: null,
  },
};

const businessRegisterSlice = createSlice({
  name: 'businessRegister',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = {
          token: action.payload.token,
          userId: action.payload.userId,
          userType: action.payload.userType,
        };
        state.successMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default businessRegisterSlice.reducer;
