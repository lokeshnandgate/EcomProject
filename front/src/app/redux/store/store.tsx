import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../products/slice';
import { userReducer, businessReducer } from '../login/slice';
import businessRegisterReducer from '../businessreg/slice';  // Corrected import name
import profileReducer from '../profile/slice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    user: userReducer,
    business: businessReducer,
    businessRegister: businessRegisterReducer,  // Use the correct name here
    profile: profileReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
