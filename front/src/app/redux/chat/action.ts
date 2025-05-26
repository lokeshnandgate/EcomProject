import axiosInstance from '../../../utils/auth';
import { AppThunk } from '../store/store';
import { 
  setChats, 
  setCurrentChat, 
  addNewChat, 
  updateChatLastMessage, 
  updateChatUnreadCount, 
  addMessage, 
  updateMessage, 
  deleteMessage, 
  setMessages, 
  setSearchResults 
} from './slice';
import axios from 'axios';

interface Participant {
  participantId: string;
  participantType: 'User' | 'Business';
}

interface CreateChatPayload {
  participants: Participant[];
  isGroup?: boolean;
  groupName?: string;
  groupDescription?: string;
  groupImage?: string;
}

export const createChat = (payload: CreateChatPayload): AppThunk => async (dispatch) => {
  try {
    // The backend expects an array of objects with participantId and participantType
    const requestPayload = {
      participants: payload.participants.map(p => ({
        participantId: p.participantId,
        participantType: p.participantType
      })),
      isGroup: payload.isGroup || false,
      ...(payload.isGroup && {
        groupName: payload.groupName,
        groupDescription: payload.groupDescription,
        groupImage: payload.groupImage
      })
    };

    console.log('Sending create chat request with payload:', requestPayload);

    const response = await axiosInstance.post('/api/chat/chats/createchat', requestPayload);
    
    dispatch(addNewChat(response.data));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error response data:', error.response?.data);
    }
    if (axios.isAxiosError(error)) {
      console.error('Server error response:', error.response?.data);
    }
    throw error;
  }
};
export const fetchUserChats = (): AppThunk => async (dispatch) => {
  try {
    const response = await axiosInstance.get('/api/chat/chats/getuserchats');
    dispatch(setChats(response.data));
  } catch (error) {
    console.error('Error fetching chats:', error);
  }
};

export const fetchChatDetails = (chatId: string): AppThunk => async (dispatch) => {
  try {
    const response = await axiosInstance.get(`/api/chat/chats/${chatId}/getchatdetail`);
    dispatch(setCurrentChat(response.data));
  } catch (error) {
    console.error('Error fetching chat details:', error);
  }
};

export const updateGroupDetails = (chatId: string, updates: any): AppThunk => async (dispatch) => {
  try {
    const response = await axiosInstance.put(`/api/chat/chats/${chatId}/updategroupchat`, updates);
    dispatch(setCurrentChat(response.data));
    return response.data;
  } catch (error) {
    console.error('Error updating group:', error);
    throw error;
  }
};

export const addParticipants = (chatId: string, participants: any[]): AppThunk => async (dispatch) => {
  try {
    const response = await axiosInstance.post(`/api/chat/chats/${chatId}/addparticipants`, { participants });
    dispatch(setCurrentChat(response.data));
    return response.data;
  } catch (error) {
    console.error('Error adding participants:', error);
    throw error;
  }
};

export const removeParticipant = (chatId: string, participantId: string): AppThunk => async (dispatch) => {
  try {
    const response = await axiosInstance.delete(`/api/chat/chats/${chatId}/participants/${participantId}/removeparticipant`);
    dispatch(setCurrentChat(response.data));
    return response.data;
  } catch (error) {
    console.error('Error removing participant:', error);
    throw error;
  }
};

export const leaveGroup = (chatId: string): AppThunk => async (dispatch) => {
  try {
    await axiosInstance.post(`/api/chat/chats/${chatId}/leavegroup`);
    // Remove the chat from the list after leaving
    dispatch(fetchUserChats());
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

export const deleteChat = (chatId: string): AppThunk => async (dispatch) => {
  try {
    await axiosInstance.delete(`/api/chat/chats/${chatId}/deletechat`);
    // Remove the chat from the list after deletion
    dispatch(fetchUserChats());
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
};

export const searchUsersAndBusinesses = (query: string): AppThunk => async (dispatch) => {
  try {
    const response = await axiosInstance.get(`/api/chat/chats/search/:`, {
      params: { query }
    });
    console.log(response.data,'response.data');
    dispatch(setSearchResults(response.data));
    return response.data;
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
};

// Message Actions
export const sendMessage = (chatId: string, content: string, attachments: any[] = [], replyTo?: string): AppThunk => async (dispatch) => {
  try {
    const response = await axiosInstance.post('/api/chat/messages/sendmessage', {
      chatId,
      content,
      attachments,
      replyTo
    });
    dispatch(addMessage(response.data));
    dispatch(updateChatLastMessage({
      chatId,
      lastMessage: response.data
    }));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {

    } else {
      if (error instanceof Error) {
        console.error('Unexpected error:', error.message || error.toString());
      } else {
        console.error('Unexpected error:', error);
      }
    }
    throw new Error('Failed to send the message. Please try again later.');
  }
};

export const fetchMessages = (chatId: string, page: number = 1, limit: number = 20): AppThunk => async (dispatch) => {
  try {
    const response = await axiosInstance.get(`/api/chat/messages/${chatId}/getmessage`, {
      params: { page, limit }
    });
    if (page === 1) {
      dispatch(setMessages(response.data));
    } else {
      dispatch(addMessage(response.data));
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const markMessagesAsRead = (chatId: string): AppThunk => async (dispatch) => {
  try {
    const response = await axiosInstance.post('/api/chat/messages/mark-as-read', { chatId });
    if (response.status === 200) {
      dispatch(updateChatUnreadCount({ chatId, count: 0 }));
    } else {
      console.error('Unexpected response:', response);
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

export const editMessage = (messageId: string, content: string): AppThunk => async (dispatch) => {
  try {
    const response = await axiosInstance.put(`/api/chat/messages/${messageId}/editmessage`, { content });
    dispatch(updateMessage(response.data));
    return response.data;
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

export const removeMessage = (messageId: string): AppThunk => async (dispatch) => {
  try {
    await axiosInstance.delete(`/api/chat/messages/${messageId}/deletemessage`);
    dispatch(deleteMessage(messageId));
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

export const reactToMessage = (messageId: string, emoji: string): AppThunk => async (dispatch) => {
  try {
    const response = await axiosInstance.post(`/api/chat/messages/${messageId}/reactmessage`, { emoji });
    dispatch(updateMessage(response.data));
    return response.data;
  } catch (error) {
    console.error('Error reacting to message:', error);
    throw error;
  }
};

export { deleteMessage };
