import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "@/redux/store";
import { toast } from "react-toastify";
import {
  connectWebSocket,
  disconnectWebSocket,
  sendMessage as sendMessageSocket,
  subscribeToChatRoom,
  unsubscribeFromChatRoom,
  notifyTyping,
} from "@/websocket/socketConnection";

// 채팅 상태 정의
export interface Message {
  id: string;
  content: string;
  author: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  messages: Message[];
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  typing: Record<string, any>;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  typing: {},
  isLoading: false,
  error: null,
};

// Slice 생성
const slice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    fetchConversationsSuccess(state, action: PayloadAction<Conversation[]>) {
      state.conversations = action.payload;
    },
    setCurrentConversation(state, action: PayloadAction<Conversation | null>) {
      state.currentConversation = action.payload;
    },
    addMessageSuccess(state, action: PayloadAction<Message>) {
      const conversation = state.currentConversation;
      if (conversation) {
        conversation.messages.push(action.payload);
      }
    },
    addNewConversation(state, action: PayloadAction<Conversation>) {
      state.conversations.push(action.payload);
    },
    updateTyping(state, action: PayloadAction<Record<string, any>>) {
      state.typing = action.payload;
    },
    removeMessageSuccess(
      state,
      action: PayloadAction<{ messageId: string; chatRoomId: string }>
    ) {
      const conversation = state.conversations.find(
        (conv) => conv.id === action.payload.chatRoomId
      );
      if (conversation) {
        conversation.messages = conversation.messages.filter(
          (msg) => msg.id !== action.payload.messageId
        );
      }
    },
    updateChatRoomName(
      state,
      action: PayloadAction<{ chatRoomId: string; newName: string }>
    ) {
      const conversation = state.conversations.find(
        (conv) => conv.id === action.payload.chatRoomId
      );
      if (conversation) {
        conversation.participants = conversation.participants.map(
          (participant) =>
            participant === conversation.id
              ? action.payload.newName
              : participant
        );
      }
    },
  },
});

export default slice.reducer;

export const {
  setError,
  setLoading,
  fetchConversationsSuccess,
  setCurrentConversation,
  addMessageSuccess,
  addNewConversation,
  updateTyping,
  removeMessageSuccess,
  updateChatRoomName,
} = slice.actions;

// WebSocket 연결 시작
export const connectToChat = (token: string) => (dispatch: AppDispatch) => {
  dispatch(setLoading(true));
  try {
    connectWebSocket(token); // WebSocket 연결 시작
    toast.success("WebSocket 연결 성공");
  } catch (error) {
    dispatch(setError("WebSocket 연결에 실패했습니다."));
    toast.error("WebSocket 연결에 실패했습니다.");
  } finally {
    dispatch(setLoading(false));
  }
};

// WebSocket 연결 해제
export const disconnectFromChat = () => (dispatch: AppDispatch) => {
  disconnectWebSocket(); // WebSocket 연결 해제
  toast.success("WebSocket 연결 해제됨");
};

// 특정 채팅방 구독
export const subscribeToRoom =
  (chatRoomId: string) => (dispatch: AppDispatch) => {
    try {
      subscribeToChatRoom(chatRoomId); // WebSocket으로 채팅방 구독
    } catch (error) {
      dispatch(setError("채팅방 구독에 실패했습니다."));
      toast.error("채팅방 구독에 실패했습니다.");
    }
  };

// 채팅방 구독 해제
export const unsubscribeFromRoom =
  (chatRoomId: string) => (dispatch: AppDispatch) => {
    try {
      unsubscribeFromChatRoom(chatRoomId); // WebSocket 구독 해제
      toast.success("채팅방 구독 해제됨");
    } catch (error) {
      dispatch(setError("채팅방 구독 해제에 실패했습니다."));
      toast.error("채팅방 구독 해제에 실패했습니다.");
    }
  };

// 메시지 전송 (WebSocket)
export const sendMessage =
  (chatRoomId: string, content: string, token: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const user = getState().auth.user;
      sendMessageSocket(chatRoomId, content, token); // WebSocket으로 메시지 전송
      const message: Message = {
        id: new Date().toISOString(),
        content,
        author: user.name, // Redux 상태에서 유저 정보 가져오기
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessageSuccess(message)); // Redux 상태 업데이트
    } catch (error) {
      dispatch(setError("메시지를 보내는 데 실패했습니다."));
      toast.error("메시지를 보내는 데 실패했습니다.");
    }
  };

// 타이핑 상태 업데이트
export const sendTypingStatus =
  (chatRoomId: string, token: string) => (dispatch: AppDispatch) => {
    notifyTyping(chatRoomId, token); // WebSocket으로 타이핑 상태 알림
  };

// 현재 채팅방 설정
export const setCurrentChat =
  (conversationId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const conversation = state.chat.conversations.find(
      (conv: { id: string }) => conv.id === conversationId
    );
    if (conversation) {
      dispatch(setCurrentConversation(conversation));
    } else {
      dispatch(setError("채팅방을 찾을 수 없습니다."));
    }
  };
