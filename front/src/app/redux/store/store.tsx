// redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../products/slice';
import { userReducer, businessReducer } from '../login/slice';
import registerReducer from '../userreg/slice';
import businessUserReducer from '../businessreg/slice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    user: userReducer,
    business: businessReducer,
    register: registerReducer,
    businessUser: businessUserReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
