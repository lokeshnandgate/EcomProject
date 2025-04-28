'use client';

import { Provider } from 'react-redux';
import { store } from './redux/store/store'; // Ensure the correct path to the store

import { ReactNode } from 'react';
// app/layout.tsx
import './globals.css'; 
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <html lang="en">
        <body>{children}</body>
      </html>
    </Provider>
  );
}