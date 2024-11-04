import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "@/redux/store";
import { toast } from "react-toastify";
import axios from "@/utils/axios";
import {
  connectWebSocket,
  disconnectWebSocket,
  sendMessage as sendMessageSocket,
  subscribeToChatRoom,
  unsubscribeFromChatRoom,
  notifyTyping,
  stompClient,
} from "@/websocket/socketConnection";
import { PersistPartial } from "redux-persist/es/persistReducer";

// 채팅 상태 정의
export interface Message {
  id: string;
  message: string; // 내용으로 수정
  senderName: string; // 작성자 이름으로 수정
  roomId: string; // 방 ID로 수정
  createAt: string; // 생성 시간으로 수정
  type: string; // 메시지 유형 추가
}

export interface Conversation {
  id: string;
  participants: string[];
  messages: Message[];
}

export interface ChatRoom {
  chatRoomId: string;
  type: string;
  roomName: string;
  profileImages: string[];
  userCount: number;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface ChatState {
  conversations: Conversation[];
  chatRooms: ChatRoom[];
  currentConversation: Conversation | null;
  typing: Record<string, any>;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  chatRooms: [],
  currentConversation: null,
  typing: {},
  isLoading: false,
  error: null,
};

// 채팅방 리스트를 불러오는 비동기 액션 생성
export const fetchChatRooms = createAsyncThunk<
  ChatRoom[],
  void,
  { state: RootState & PersistPartial }
>("chat/fetchChatRooms", async (_, { getState, rejectWithValue }) => {
  try {
    const loginId = getState().auth.user.loginId;
    const response = await axios.get("/chat/find/list", {
      params: { loginId },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue("채팅방 목록을 불러오는 데 실패했습니다.");
  }
});

// 메시지를 가져오는 비동기 액션 생성
export const fetchMessages = createAsyncThunk<
  Message[],
  string, // chatRoomId를 인자로 받음
  { state: RootState & PersistPartial }
>("chat/fetchMessages", async (chatRoomId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`/chat/${chatRoomId}/messages`); // 해당 채팅방의 메시지 가져오기
    return response.data; // 메시지 목록 반환
  } catch (error) {
    return rejectWithValue("메시지를 불러오는 데 실패했습니다.");
  }
});

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
        const existingMessage = conversation.messages.find(
          (msg) => msg.id === action.payload.id
        );
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatRooms.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chatRooms = action.payload;
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })
      // fetchMessages 액션 처리
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentConversation) {
          state.currentConversation.messages = action.payload; // 가져온 메시지로 현재 대화방의 메시지 업데이트
          console.log(state.currentConversation.messages);
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(state.error);
      });
  },
});

// 테스트용 채팅방 설정 액션
export const setTestChatRoom = () => (dispatch: AppDispatch) => {
  const conversation = {
    id: "1",
    chatRoomId: 1,
    participants: ["test1", "test2"],
    messages: [
      {
        id: "msg1",
        message: "안녕하세요 test2님", // 필드 이름 변경
        senderName: "test1", // 필드 이름 변경
        roomId: "1", // 필드 추가
        createAt: new Date().toISOString(), // 필드 추가
        type: "CHAT", // 필드 추가
      },
      {
        id: "msg2",
        message: "안녕하세요 test1님",
        senderName: "test2",
        roomId: "1",
        createAt: new Date().toISOString(),
        type: "CHAT",
      },
    ],
  };
  dispatch(fetchConversationsSuccess([conversation])); // 대화방 추가
  dispatch(setCurrentConversation(conversation)); // 현재 대화방 설정
};

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
export const connectToChat =
  (token: string, chatRoomId: string) => (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      connectWebSocket(token, chatRoomId); // WebSocket 연결 시작
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
  (
    chatRoomId: string,
    message: Message,
    token: string // Message 객체를 직접 받도록 수정
  ) =>
    (dispatch: AppDispatch, getState: () => RootState & PersistPartial) => {
      try {
        const user = getState().auth.user;
        if (stompClient && stompClient.connected) {
          sendMessageSocket(chatRoomId, message, token); // WebSocket으로 메시지 전송
          dispatch(addMessageSuccess(message)); // Redux 상태 업데이트
        } else {
          dispatch(setError("WebSocket 연결이 없습니다."));
          toast.error("WebSocket 연결이 없습니다.");
        }
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

// 현재 채팅방 설정 및 메시지 로드
export const setCurrentChat =
  (conversationId: string) =>
    (dispatch: AppDispatch, getState: () => RootState & PersistPartial) => {
      const state = getState();
      const conversation = state.chat.conversations.find(
        (conv: { id: string }) => conv.id === conversationId
      );

      if (conversation) {
        dispatch(setCurrentConversation(conversation));
        // 해당 채팅방의 메시지를 가져옵니다.
        dispatch(fetchMessages(conversationId));
      } else {
        console.error("채팅방을 찾을 수 없습니다. 기본 대화방을 설정합니다.");
        const defaultConversation = {
          id: conversationId,
          participants: [],
          messages: [],
        };
        dispatch(setCurrentConversation(defaultConversation)); // 기본 대화 설정
      }
    };

export default slice.reducer;
