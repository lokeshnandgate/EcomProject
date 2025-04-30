// redux/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { registerUser } from '../userreg/action';

interface UserInfo {
  userId: string;
  token: string;
  message?: string;
}

interface UserState {
  userInfo: UserInfo | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  userInfo: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userToken');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<UserInfo>) => {
        state.loading = false;
        state.userInfo = action.payload;
        localStorage.setItem('userToken', action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
