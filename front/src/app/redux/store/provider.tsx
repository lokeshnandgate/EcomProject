// app/provider.tsx or app/layout.tsx (depending on structure)
'use client';

import { Provider } from 'react-redux';
import { store } from '../store/store';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}
