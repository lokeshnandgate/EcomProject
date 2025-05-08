// src/redux/actions/chatActions.ts
import axiosInstance from '../../../utils/auth';
import { AppThunk } from '../store/store';
import { addMessage, setMessages, setLoading, setError } from '../chat/slice';

export const sendMessage = (
  receiverId: string,
  receiverType: string,
  message: string,
  groupId: string | null = null
): AppThunk => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
   
    const { user } = (getState().auth as unknown as { user: { id: string; name: string } }) || {};
    const response = await axiosInstance.post('/api/chat/send', {
      receiverId,
      receiverType,
      message,
      groupId
    });

    dispatch(addMessage(response.data.chatMessage));
  } catch (error: any) {
    dispatch(setError(error.response?.data?.message || 'Failed to send message'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchChatHistory = (otherId: string): AppThunk => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axiosInstance.get('/api/chat/history/receive', {
      params: { userId: otherId }
    });
    
    dispatch(setMessages(response.data.messages));
  } catch (error: any) {
    dispatch(setError(error.response?.data?.message || 'Failed to fetch chat history'));
  } finally {
    dispatch(setLoading(false));
  }
};