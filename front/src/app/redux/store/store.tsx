import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../products/slice';
import { userReducer, businessReducer } from '../login/slice';
import businessRegisterReducer from '../businessreg/slice';  
import profileReducer from '../profile/slice';
import chatReducer from '../chat/slice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    user: userReducer,
    business: businessReducer,
    businessRegister: businessRegisterReducer,  
    profile: profileReducer,
    chat: chatReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
