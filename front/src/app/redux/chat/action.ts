import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../utils/auth';

// Create a new chat room
export const createChatRoom = createAsyncThunk(
  'chat/createChatRoom',
  async (participant2: { participant2Id: string, participant2Type: 'User' | 'businessUser' }) => {
    try {
      const response = await axiosInstance.post('/chat/addNewChatEntry', participant2);
      return response.data;  // Data returned here will be the action.payload
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;  // Thrown errors will be caught in the rejected case
    }
  }
);

// Add a new message to a chat room
export const addNewMessage = createAsyncThunk(
  'chat/addNewMessage',
  async (messageData: { roomId: string, message: string }) => {
    try {
      const response = await axiosInstance.post('/chat/addNewMessage', messageData);
      return response.data;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }
);

// Get all chat rooms for the current user
export const getChatRooms = createAsyncThunk(
  'chat/getChatRooms',
  async () => {
    try {
      const response = await axiosInstance.post('/chat/getRooms');
      return response.data.rooms; // This will be returned as payload
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  }
);

// Find a chat room between two specific users
export const findRoomOf2Users = createAsyncThunk(
  'chat/findRoomOf2Users',
  async (user2: { user2Id: string, user2Type: 'User' | 'businessUser' }) => {
    try {
      const response = await axiosInstance.post('/chat/findRoomOf2Users', user2);
      return response.data.room;
    } catch (error) {
      console.error('Error finding chat room:', error);
      throw error;
    }
  }
);

// Mark messages as read
export const markMessagesAsRead = createAsyncThunk(
  'chat/markMessagesAsRead',
  async (data: { roomId: string, messageIds: string[] }) => {
    try {
      const response = await axiosInstance.post('/chat/markRead', data);
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
);

// Get count of unread messages
export const getUnreadMessagesCount = createAsyncThunk(
  'chat/getUnreadMessagesCount',
  async () => {
    try {
      const response = await axiosInstance.post('/chat/unreadMessagesCount');
      return response.data.unreadCount;
    } catch (error) {
      console.error('Error getting unread messages count:', error);
      throw error;
    }
  }
);
