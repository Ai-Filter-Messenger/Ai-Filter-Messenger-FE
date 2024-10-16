import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/utils/axios";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "@/redux/store";

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
    sendMessageSuccess(state, action: PayloadAction<Message>) {
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
  },
});

export default slice.reducer;

const {
  setError,
  setLoading,
  fetchConversationsSuccess,
  setCurrentConversation,
  sendMessageSuccess,
  addNewConversation,
  updateTyping,
} = slice.actions;

// 채팅방 목록 조회
export function fetchConversations() {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.get("/chat/list");
      dispatch(fetchConversationsSuccess(response.data));
    } catch (error: any) {
      dispatch(
        setError(error.message || "채팅방 목록을 가져오는 데 실패했습니다.")
      );
      toast.error(error.message || "채팅방 목록을 가져오는 데 실패했습니다.");
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// 메시지 전송
export function sendMessage(conversationId: string, content: string) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const { user } = state.auth;
    const message = {
      id: new Date().toISOString(),
      content,
      author: user.name, // 로그인된 유저 정보에서 이름 가져오기
      timestamp: new Date().toISOString(),
    };

    dispatch(sendMessageSuccess(message));

    try {
      await axios.post(`/chat/conversations/${conversationId}/messages`, {
        content,
      });
      toast.success("메시지를 성공적으로 보냈습니다.");
    } catch (error: any) {
      dispatch(setError(error.message || "메시지를 보내는 데 실패했습니다."));
      toast.error(error.message || "메시지를 보내는 데 실패했습니다.");
    }
  };
}

// 새로운 채팅방 생성
export function createConversation(participants: string[]) {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.post("/chatRoom/create", {
        participants,
      });
      dispatch(addNewConversation(response.data));
      toast.success("새 채팅방이 생성되었습니다.");
    } catch (error: any) {
      dispatch(setError(error.message || "채팅방을 생성하는 데 실패했습니다."));
      toast.error(error.message || "채팅방을 생성하는 데 실패했습니다.");
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// 채팅방 나가기
export function leaveConversation(conversationId: string) {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      await axios.post(`/chatRoom/leave`, { conversationId });
      toast.success("채팅방에서 나왔습니다.");
    } catch (error: any) {
      dispatch(setError(error.message || "채팅방 나가기에 실패했습니다."));
      toast.error(error.message || "채팅방 나가기에 실패했습니다.");
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// 채팅방 초대
export function inviteToConversation(
  conversationId: string,
  participants: string[]
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      await axios.post(`/chatRoom/invite`, { conversationId, participants });
      toast.success("채팅방에 초대하였습니다.");
    } catch (error: any) {
      dispatch(setError(error.message || "채팅방 초대에 실패했습니다."));
      toast.error(error.message || "채팅방 초대에 실패했습니다.");
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// 채팅방 이름 변경
export function updateConversationName(
  conversationId: string,
  newName: string
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      await axios.post(`/chatRoom/nameUpdate`, { conversationId, newName });
      toast.success("채팅방 이름이 변경되었습니다.");
    } catch (error: any) {
      dispatch(setError(error.message || "채팅방 이름 변경에 실패했습니다."));
      toast.error(error.message || "채팅방 이름 변경에 실패했습니다.");
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// 현재 채팅방 설정
export function setCurrentChat(conversationId: string) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
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
}

// 타이핑 상태 업데이트
export function updateTypingStatus(data: Record<string, any>) {
  return async (dispatch: AppDispatch) => {
    dispatch(updateTyping(data));
  };
}
