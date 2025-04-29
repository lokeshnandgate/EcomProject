import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loginUser, loginBusiness } from './action';

// -------------------- User State and Slice --------------------
interface UserState {
  user: any;
  role: string;
  userInfo: any;
  loading: boolean;
  error: string | null;
}

const initialUserState: UserState = {
  user: null,
  role: '',
  userInfo: null,
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
        sessionStorage.setItem('userInfo', JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// -------------------- Business State and Slice --------------------
interface BusinessState {
  businessInfo: any;
  loading: boolean;
  error: string | null;
}

const initialBusinessState: BusinessState = {
  businessInfo: null,
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
        sessionStorage.setItem('businessInfo', JSON.stringify(action.payload));
      })
      .addCase(loginBusiness.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// -------------------- Export Actions & Reducers --------------------
export const { logout } = userSlice.actions;
export const { logoutBusiness } = businessSlice.actions;

export const userReducer = userSlice.reducer;
export const businessReducer = businessSlice.reducer;