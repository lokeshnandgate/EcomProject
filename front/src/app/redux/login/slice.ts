// src/app/redux/login/slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loginUser, loginBusiness } from './action';

// --- User Slice ---

interface UserState {
  userInfo: any;
  role: string;
  loading: boolean;
  error: string | null;
}

// Check sessionStorage for user info
const userFromSession =
  typeof window !== 'undefined'
    ? JSON.parse(sessionStorage.getItem('userInfo') || 'null')
    : null;

const initialUserState: UserState = {
  userInfo: userFromSession,
  role: '',
  loading: false,
  error: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    logout: (state) => {
      state.userInfo = null;
      sessionStorage.removeItem('userInfo');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.userInfo = action.payload;
        sessionStorage.setItem('userInfo', JSON.stringify(action.payload));  // Save user info to sessionStorage
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// --- Business Slice ---

interface BusinessState {
  businessInfo: any;
  loading: boolean;
  error: string | null;
}

// Check sessionStorage for business info
const businessFromSession =
  typeof window !== 'undefined'
    ? JSON.parse(sessionStorage.getItem('businessInfo') || 'null')
    : null;

const initialBusinessState: BusinessState = {
  businessInfo: businessFromSession,
  loading: false,
  error: null,
};

export const businessSlice = createSlice({
  name: 'business',
  initialState: initialBusinessState,
  reducers: {
    logoutBusiness: (state) => {
      state.businessInfo = null;
      sessionStorage.removeItem('businessInfo');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginBusiness.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginBusiness.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.businessInfo = action.payload;
        sessionStorage.setItem('businessInfo', JSON.stringify(action.payload));  // Save business info to sessionStorage
      })
      .addCase(loginBusiness.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducers for both user and business slices
export const { logout } = userSlice.actions;
export const { logoutBusiness } = businessSlice.actions;

export const userReducer = userSlice.reducer;
export const businessReducer = businessSlice.reducer;
