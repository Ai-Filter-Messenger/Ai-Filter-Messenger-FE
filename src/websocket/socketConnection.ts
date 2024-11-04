import SockJS from "sockjs-client";
import { CompatClient, Stomp } from "@stomp/stompjs";
import {
  addMessageSuccess,
  setCurrentConversation,
  removeMessageSuccess,
  addNewConversation,
  updateChatRoomName,
} from "@/redux/slices/chat";
import { store } from "@/redux/store"; // Redux store 직접 참조
import { updateTypingStatus } from "@/redux/slices/chatbackup";

// WebSocket 서버 URL
const SOCKET_URL = "http://localhost:8080/chat";

// STOMP 클라이언트 생성
export let stompClient: CompatClient | null = null;
let isConnected = false; // 연결 상태를 추적

// WebSocket 연결 초기화 함수
export const connectWebSocket = (token: string, chatRoomId: string) => {
  console.log("socketConnection.ts) WebSocket 연결 시도...");
  const socket = new SockJS(SOCKET_URL);
  stompClient = Stomp.over(socket);
  const nickname = localStorage.getItem("nickname");

  stompClient.connect(
    { Authorization: `Bearer ${token}` },
    () => {
      console.log("socketConnection.ts) WebSocket 연결 성공");
      isConnected = true; // 연결 상태 업데이트
      subscribeToPrivateMessages(token, nickname); // 유저 전용 메시지 구독
      subscribeToChatRoom(chatRoomId); // 특정 채팅방 구독
    },
    (error: any) => {
      console.error("WebSocket 연결 실패", error);
      isConnected = false; // 연결 실패 시 상태 업데이트
      attemptReconnect(token, chatRoomId); // 연결 실패 시 재연결 시도
    }
  );
};

// WebSocket 연결 해제 함수
export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.disconnect(() => {
      console.log("WebSocket 서버 연결 해제됨");
      isConnected = false; // 연결 해제 시 상태 업데이트
    });
    stompClient = null;
  }
};

// 재연결 시도 함수
const attemptReconnect = (token: string, chatRoomId: string) => {
  setTimeout(() => {
    console.log("WebSocket 재연결 시도 중...");
    connectWebSocket(token, chatRoomId); // 재연결 시도
  }, 5000); // 5초 후 재연결 시도
};

// 유저 전용 메시지 구독
const subscribeToPrivateMessages = (token: string , nickname : string | null) => {
  if (stompClient) {
    stompClient.subscribe(`/queue/chatroom/${nickname}`, (message) => {
      handleIncomingMessage(JSON.parse(message.body));
    });
  }
};

// 특정 채팅방 구독
export const subscribeToChatRoom = (chatRoomId: string) => {
  if (stompClient) {
    console.log(`채팅방 구독: ${chatRoomId}`);
    stompClient.subscribe(`/topic/chatroom/${chatRoomId}`, (message) => {
      handleChatRoomMessage(JSON.parse(message.body), chatRoomId);
    });
  }
};

// 유저에게 전송된 메시지 처리 함수
const handleIncomingMessage = (message: any) => {
  const dispatch = store.dispatch;

  switch (message.type) {
    case "MESSAGE":
      dispatch(addMessageSuccess(message));

      // 현재 대화에 메시지를 추가
      const currentConversation = store.getState().chat.currentConversation;
      if (currentConversation) {
        const updatedConversation = {
          ...currentConversation,
          messages: [...currentConversation.messages, message], // 새 메시지를 추가
        };
        dispatch(setCurrentConversation(updatedConversation)); // 업데이트된 대화 설정
      }
      break;
    case "TYPING":
      dispatch(
        updateTypingStatus({
          chatRoomId: message.chatRoomId,
          typing: message.typing,
        })
      );
      break;
    case "JOIN":
      console.log(`${message.user}가 채팅방에 참가했습니다.`);
      dispatch(addNewConversation(message.chatRoom)); // 새 채팅방을 Redux에 추가
      break;
    case "INVITE":
      console.log(`${message.invitedUser}가 채팅방에 초대되었습니다.`);
      break;
    case "LEAVE":
      console.log(`${message.user}가 채팅방을 떠났습니다.`);
      break;
    case "NAME_UPDATE":
      console.log(`채팅방 이름이 ${message.newName}으로 변경되었습니다.`);
      dispatch(
        updateChatRoomName({
          chatRoomId: message.chatRoomId,
          newName: message.newName,
        })
      );
      break;
    case "USER_NAME_UPDATE":
      console.log(
        `${message.oldNickname}이 ${message.newNickname}으로 닉네임을 변경했습니다.`
      );
      break;
    case "DELETE_MESSAGE":
      dispatch(
        removeMessageSuccess({
          messageId: message.messageId,
          chatRoomId: message.chatRoomId,
        })
      );
      console.log("메시지가 삭제되었습니다:", message.messageId);
      break;
    case "ERROR":
      console.error("에러:", message.content);
      break;
    default:
      console.log("알 수 없는 메시지 유형");
  }
};

// 채팅방에서 수신된 메시지 처리 함수
const handleChatRoomMessage = (message: any, chatRoomId: string) => {
  const dispatch = store.dispatch;

  switch (message.type) {
    case "MESSAGE":
      dispatch(addMessageSuccess(message));

      // 현재 대화에 메시지를 추가
      const currentChatRoom = store.getState().chat.currentConversation;
      if (currentChatRoom) {
        const updatedChatRoom = {
          ...currentChatRoom,
          messages: [...currentChatRoom.messages, message], // 새 메시지를 추가
        };
        dispatch(setCurrentConversation(updatedChatRoom)); // 업데이트된 대화 설정
      }
      break;
    case "TYPING":
      dispatch(updateTypingStatus({ chatRoomId, typing: message.typing }));
      break;
    case "JOIN":
      console.log(`${message.user}가 채팅방에 참가했습니다.`);
      dispatch(addNewConversation(message.chatRoom));
      break;
    case "LEAVE":
      console.log(`${message.user}가 채팅방을 떠났습니다.`);
      break;
    case "INVITE":
      console.log(`${message.invitedUser}가 채팅방에 초대되었습니다.`);
      break;
    case "NAME_UPDATE":
      console.log(`채팅방 이름이 ${message.newName}으로 변경되었습니다.`);
      dispatch(updateChatRoomName({ chatRoomId, newName: message.newName }));
      break;
    case "USER_NAME_UPDATE":
      console.log(
        `${message.oldNickname}이 ${message.newNickname}으로 닉네임을 변경했습니다.`
      );
      break;
    case "DELETE_MESSAGE":
      dispatch(
        removeMessageSuccess({ messageId: message.messageId, chatRoomId })
      );
      console.log("메시지가 삭제되었습니다:", message.messageId);
      break;
    default:
      console.log("알 수 없는 메시지 유형");
  }
};

// 채팅 메시지 전송 함수 (WebSocket 기반)
export const sendMessage = (
  chatRoomId: string,
  message: {
    id: string;
    message: string;
    senderName: string;
    roomId: string;
    createAt: string;
    type: string;
  }, // 전체 메시지 객체를 받도록 수정
  token: string
) => {
  if (stompClient && stompClient.connected) {
    console.log(`Sending message to chat room ${chatRoomId}:`, message);

    stompClient.send(
      `/app/chat/send`, // 메시지를 보낼 경로 수정
      { Authorization: `Bearer ${token}` },
      JSON.stringify(message) // 메시지 객체를 JSON 문자열로 변환하여 전송
    );
  } else {
    console.log("WebSocket이 연결되어 있지 않아 메시지를 보낼 수 없습니다."); // 로그 추가
  }
};

// 사용자가 타이핑 중임을 알리는 함수 (Debounce 적용)
let typingTimeout: NodeJS.Timeout;

export const notifyTyping = (chatRoomId: string, token: string) => {
  if (stompClient && stompClient.connected) {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    typingTimeout = setTimeout(() => {
      stompClient!.send(
        // non-null assertion operator 사용
        `/app/chat/${chatRoomId}/typing`,
        { Authorization: `Bearer ${token}` },
        JSON.stringify({ typing: true })
      );
    }, 300); // 300ms debounce 적용
  }
};

// 채팅방 구독 해제 함수
export const unsubscribeFromChatRoom = (chatRoomId: string) => {
  if (stompClient) {
    stompClient.unsubscribe(`/topic/chatroom/${chatRoomId}`);
    console.log(`채팅방 ${chatRoomId} 구독 해제됨`);
  }
};
