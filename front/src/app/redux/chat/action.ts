// redux/chat/chatActions.ts
import { createAction } from '@reduxjs/toolkit';

export const sendMessage = createAction<string>('chat/sendMessage');
export const clearMessages = createAction('chat/clearMessages');
