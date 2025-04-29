// app/layout.tsx
'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store/store'; // Ensure correct path
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          {children}
        </Provider>
      </body>
    </html>
  );
}