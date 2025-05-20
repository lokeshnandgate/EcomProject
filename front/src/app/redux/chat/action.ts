import axiosInstance from '../../../utils/auth';
import { setLoading, setError, setRooms, setCurrentRoom, setMessages, addMessage, updateMessageStatus, addTypingUser, removeTypingUser, addNotification } from './slice';

// Get user's chat rooms
export const fetchChatRooms = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const response = await axiosInstance.get('/chat/rooms');
    dispatch(setRooms(response.data));
    dispatch(setLoading(false));
  } catch (error: any) {
    dispatch(setError(error.response?.data?.message || error.message));
    dispatch(setLoading(false));
  }
};

// Create or get chat room
export const createOrGetChatRoom = (participantId: string) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const response = await axiosInstance.post('/chat/rooms', { participantId });
    dispatch(setCurrentRoom(response.data));
    dispatch(setLoading(false));
    return response.data;
  } catch (error: any) {
    dispatch(setError(error.response?.data?.message || error.message));
    dispatch(setLoading(false));
    throw error;
  }
};

// Get messages for a chat room
export const fetchMessages = (chatRoomId: string) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const response = await axiosInstance.get(`/chat/messages/${chatRoomId}`);
    dispatch(setMessages(response.data));
    dispatch(setLoading(false));
  } catch (error: any) {
    dispatch(setError(error.response?.data?.message || error.message));
    dispatch(setLoading(false));
  }
};

// Send message
export const sendMessage = (chatRoomId: string, content: string) => async (dispatch: any) => {
  try {
    const response = await axiosInstance.post('/chat/messages', { chatRoomId, content });
    dispatch(addMessage(response.data));
    return response.data;
  } catch (error: any) {
    dispatch(setError(error.response?.data?.message || error.message));
    throw error;
  }
};

// Update message status
export const markMessageAsRead = (messageId: string) => async (dispatch: any) => {
  try {
    await axiosInstance.put(`/chat/messages/${messageId}/status`);
    dispatch(updateMessageStatus({ messageId, status: 'read' }));
  } catch (error: any) {
    dispatch(setError(error.response?.data?.message || error.message));
  }
};

// Update typing status
export const setTypingStatus = (chatRoomId: string, isTyping: boolean) => async (dispatch: any) => {
  try {
    await axiosInstance.put('/chat/typing', { chatRoomId, isTyping });
  } catch (error: any) {
    dispatch(setError(error.response?.data?.message || error.message));
  }
};

// Update last seen
export const updateLastSeenTime = (chatRoomId: string) => async (dispatch: any) => {
  try {
    await axiosInstance.put('/chat/last-seen', { chatRoomId });
  } catch (error: any) {
    dispatch(setError(error.response?.data?.message || error.message));
  }
};

// Socket actions
export const handleNewMessage = (message: any) => (dispatch: any) => {
  dispatch(addMessage(message));
};

export const handleTypingStart = (userId: string) => (dispatch: any) => {
  dispatch(addTypingUser(userId));
};

export const handleTypingStop = (userId: string) => (dispatch: any) => {
  dispatch(removeTypingUser(userId));
};

export const handleMessageRead = (messageId: string) => (dispatch: any) => {
  dispatch(updateMessageStatus({ messageId, status: 'read' }));
};

export const handleNewNotification = (notification: any) => (dispatch: any) => {
  dispatch(addNotification(notification));
};