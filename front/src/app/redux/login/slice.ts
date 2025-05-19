import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loginUser, loginBusiness } from './action'; // Import your async actions

// --- User Slice ---

interface UserState {
  _id: string;
  userInfo: any | null; // Use 'null' to indicate no user
  role: string;
  loading: boolean;
  error: string | null;
}

const initialUserState: UserState = {
  _id: '',
  userInfo: null,
  role: '',
  loading: false,
  error: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    logout: (state) => {
      state._id = '';
      state.userInfo = null;
      state.role = ''; // Clear role as well
      state.error = null; // Clear any previous error state
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('userInfo');
        sessionStorage.removeItem('token'); // Clear token
      }
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.userInfo = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear previous errors
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.role = action.payload?.role || ''; // Set the role
        state._id = action.payload?._id || '';
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('userInfo', JSON.stringify(action.payload));
        }
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
        state.userInfo = null; // Clear userInfo on error
        state.role = '';
        state._id = '';
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('userInfo'); // Clear on error
          sessionStorage.removeItem('token');
        }
      });
  },
});

// --- Business Slice ---

interface BusinessState {
  businessInfo: any | null; // Use null
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
      state.error = null;
       if (typeof window !== 'undefined') {
        sessionStorage.removeItem('businessInfo');
        sessionStorage.removeItem('token');
      }
    },
    setBusiness: (state, action: PayloadAction<any>) => {
      state.businessInfo = action.payload;
    }
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
         if (typeof window !== 'undefined') {
          sessionStorage.setItem('businessInfo', JSON.stringify(action.payload));
        }
      })
      .addCase(loginBusiness.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
        state.businessInfo = null; // Clear state
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('businessInfo');
          sessionStorage.removeItem('token');
        }
      });
  },
});

// Export actions and reducers for both user and business slices
export const { logout, setUser } = userSlice.actions;
export const { logoutBusiness, setBusiness } = businessSlice.actions;

export const userReducer = userSlice.reducer;
export const businessReducer = businessSlice.reducer;
