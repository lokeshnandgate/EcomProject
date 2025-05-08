// src/redux/types.ts
export interface ChatMessage {
    _id: string
    senderId: string
    senderType: 'User' | 'businessUser'
    receiverId: string
    receiverType: 'User' | 'businessUser'
    message: string
    groupId: string | null
    timestamp: Date | string
  }
  
  export interface User {
    _id: string
    username: string
    email: string
    userType: 'User'
  }
  
  export interface BusinessUser {
    _id: string
    username: string
    email: string
    userType: 'businessUser'
  }
  
  export interface ChatState {
    messages: ChatMessage[]
    loading: boolean
    error: string | null
    currentChat: string | null
  }
  
  export interface AuthState {
    user: User | BusinessUser | null
    loading: boolean
    error: string | null
  }
 
export interface RootState {
    chat: ChatState;
    auth: {
        user: User | BusinessUser | null; 
    };
}

  const initialState = {
    user: null, 
  };