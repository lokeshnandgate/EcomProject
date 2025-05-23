import { AppThunk } from '../store/store';
import {
  startLoading,
  setError,
  getChatsSuccess,
  getChatDetailsSuccess,
  createChatSuccess,
  updateGroupChatSuccess,
  deleteChatSuccess,
  getMessagesSuccess,
  sendMessageSuccess,
  markAsReadSuccess,
  deleteMessageSuccess,
  editMessageSuccess,
  reactToMessageSuccess,
} from './slice';
import axiosInstance from '../../../utils/auth';

// Chat Actions
export const fetchUserChats = (): AppThunk => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await axiosInstance.get('/api/chat/chats/getuserchats');
    dispatch(getChatsSuccess(response.data));
  } catch (err) {
    const errorMessage = (err as any).response?.data?.error || 'Failed to fetch chats';
    dispatch(setError(errorMessage));
  }
};

export const fetchChatDetails = (chatId: string): AppThunk => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await axiosInstance.get(`/api/chat/chats/${chatId}/getchatdetail`);
    dispatch(getChatDetailsSuccess(response.data));
  } catch (err) {
    const errorMessage = (err as any).response?.data?.error || 'Failed to fetch chat details';
    dispatch(setError(errorMessage));
  }
};

export const createChat = (
  participants: Array<{ participantId: string; participantType: string }>,
  isGroup = false,
  groupName?: string,
  groupDescription?: string,
  groupImage?: string
): AppThunk => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await axiosInstance.post('/api/chat/chats/createchat', {
      participants,
      isGroup,
      groupName,
      groupDescription,
      groupImage,
    });
    dispatch(createChatSuccess(response.data));
  } catch (err) {
    const errorMessage = (err as any).response?.data?.error || 'Failed to create chat';
    dispatch(setError(errorMessage));
  }
};

export const updateGroupChat = (
  chatId: string,
  groupName?: string,
  groupDescription?: string,
  groupImage?: string
): AppThunk => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await axiosInstance.put(`/api/chat/chats/${chatId}/updategroupchat`, {
      groupName,
      groupDescription,
      groupImage,
    });
    dispatch(updateGroupChatSuccess(response.data));
  } catch (err) {
    const errorMessage = (err as any).response?.data?.error || 'Failed to update group chat';
    dispatch(setError(errorMessage));
  }
};

export const addParticipants = (
  chatId: string,
  participants: Array<{ participantId: string; participantType: string }>
): AppThunk => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await axiosInstance.post(`/api/chat/chats/${chatId}/addparticipants`, {
      participants,
    });
    dispatch(updateGroupChatSuccess(response.data));
  } catch (err) {
    const errorMessage = (err as any).response?.data?.error || 'Failed to add participants';
    dispatch(setError(errorMessage));
  }
};

export const removeParticipant = (
  chatId: string,
  participantId: string
): AppThunk => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await axiosInstance.delete(
      `/api/chat/chats/${chatId}/participants/${participantId}/removeparticipant`
    );
    dispatch(updateGroupChatSuccess(response.data));
  } catch (err) {
    const errorMessage = (err as any).response?.data?.error || 'Failed to remove participant';
    dispatch(setError(errorMessage));
  }
};

export const leaveGroup = (chatId: string): AppThunk => async (dispatch) => {
  try {
    dispatch(startLoading());
    await axiosInstance.post(`/api/chat/chats/${chatId}/leavegroup`);
    dispatch(deleteChatSuccess(chatId));
  } catch (err) {
    const errorMessage = (err as any).response?.data?.error || 'Failed to leave group';
    dispatch(setError(errorMessage));
  }
};

export const deleteChat = (chatId: string): AppThunk => async (dispatch) => {
  try {
    dispatch(startLoading());
    await axiosInstance.delete(`/api/chat/chats/${chatId}/deletechat`);
    dispatch(deleteChatSuccess(chatId));
  } catch (err) {
    const errorMessage = (err as any).response?.data?.error || 'Failed to delete chat';
    dispatch(setError(errorMessage));
  }
};

// Message Actions
export const fetchMessages = (
  chatId: string,
  page = 1,
  limit = 20
): AppThunk => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await axiosInstance.get(
      `/api/chat/messages/${chatId}/getmessage?page=${page}&limit=${limit}`
    );
    dispatch(getMessagesSuccess(response.data));
  } catch (err) {
    const errorMessage = (err as any).response?.data?.error || 'Failed to fetch messages';
    dispatch(setError(errorMessage));
  }
};

export const sendMessage = (
  chatId: string,
  content: string,
  attachments: any[] = [],
  replyTo?: string
): AppThunk => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await axiosInstance.post('/api/chat/messages/sendmessage', {
      chatId,
      content,
      attachments,
      replyTo,
    });
    dispatch(sendMessageSuccess(response.data));
  } catch (err) {
    const errorMessage = (err as any).response?.data?.error || 'Failed to send message';
    dispatch(setError(errorMessage));
  }
};

export const markMessagesAsRead = (chatId: string): AppThunk => async (dispatch, getState) => {
  try {
    if (!chatId) throw new Error("Chat ID is required");
    
    dispatch(startLoading());
    const userId = getState().user?._id;
    
    // Send chatId in the request body instead of URL
    await axiosInstance.post('/api/chat/messages/mark-as-read', { chatId });
    
    if (userId) {
      dispatch(markAsReadSuccess({chatId, userId}));
    }
  } catch (err) {
    const errorMessage = (err as any).response?.data?.error || 'Failed to mark messages as read';
    dispatch(setError(errorMessage));
  }
};
export const deleteMessage = (messageId: string, chatId: string): AppThunk => async (dispatch) => {
  try {
    dispatch(startLoading());
    await axiosInstance.delete(`/api/chat/messages/${messageId}/deletemessage`);
    dispatch(deleteMessageSuccess({chatId, messageId}));
  } catch (err) {
    const errorMessage = (err as any).response?.data?.error || 'Failed to delete message';
    dispatch(setError(errorMessage));
  }
};

export const editMessage = (
  messageId: string,
  content: string
): AppThunk => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await axiosInstance.put(`/api/chat/messages/${messageId}/editmessage`, {
      content,
    });
    dispatch(editMessageSuccess(response.data));
  } catch (err) {
    const errorMessage = (err as any).response?.data?.error || 'Failed to edit message';
    dispatch(setError(errorMessage));
  }
};

export const reactToMessage = (
  messageId: string,
  emoji: string
): AppThunk => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await axiosInstance.post(`/api/chat/messages/${messageId}/reactmessage`, {
      emoji,
    });
    dispatch(reactToMessageSuccess({
      messageId,
      reactions: response.data.reactions,
    }));
  } catch (err) {
    const errorMessage = (err as any).response?.data?.error || 'Failed to react to message';
    dispatch(setError(errorMessage));
  }
};