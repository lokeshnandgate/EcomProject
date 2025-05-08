// src/redux/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User, BusinessUser } from './types'

interface AuthState {
  user: User | BusinessUser | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | BusinessUser | null>) => {
      state.user = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearAuth: () => initialState
  }
})

export const { setUser, setLoading, setError, clearAuth } = authSlice.actions
export default authSlice.reducer