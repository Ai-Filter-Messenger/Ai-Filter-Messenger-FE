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
const SOCKET_URL = "http://localhost:8080/ws";

// STOMP 클라이언트 생성
let stompClient: CompatClient | null = null;

// WebSocket 연결 초기화 함수
export const connectWebSocket = (token: string) => {
  const socket = new SockJS(SOCKET_URL);
  stompClient = Stomp.over(socket);

  stompClient.connect(
    { Authorization: `Bearer ${token}` },
    () => {
      console.log("WebSocket 연결 성공");
      subscribeToPrivateMessages(token); // 유저 전용 메시지 구독
    },
    (error: any) => {
      console.error("WebSocket 연결 실패", error);
      attemptReconnect(token); // 연결 실패 시 재연결 시도
    }
  );
};

// WebSocket 연결 해제 함수
export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.disconnect(() => {
      console.log("WebSocket 서버 연결 해제됨");
    });
    stompClient = null;
  }
};

// 재연결 시도 함수
const attemptReconnect = (token: string) => {
  setTimeout(() => {
    console.log("WebSocket 재연결 시도 중...");
    connectWebSocket(token); // 재연결 시도
  }, 5000); // 5초 후 재연결 시도
};

// 유저 전용 메시지 구독
const subscribeToPrivateMessages = (token: string) => {
  if (stompClient) {
    stompClient.subscribe(`/user/queue/messages`, (message) => {
      handleIncomingMessage(JSON.parse(message.body));
    });
  }
};

// 특정 채팅방 구독
export const subscribeToChatRoom = (chatRoomId: string) => {
  if (stompClient) {
    stompClient.subscribe(`/topic/chatroom/${chatRoomId}`, (message) => {
      handleChatRoomMessage(JSON.parse(message.body), chatRoomId);
    });
  }
};

// 유저에게 전송된 메시지 처리 함수
const handleIncomingMessage = (message: any) => {
  const dispatch = store.dispatch;

  switch (message.type) {
    case "CHAT":
      dispatch(addMessageSuccess(message)); // 메시지를 Redux 상태에 추가
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
    case "CHAT":
      dispatch(addMessageSuccess(message));
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
  content: string,
  token: string
) => {
  if (stompClient && stompClient.connected) {
    const message = {
      chatRoomId,
      content,
      sender: store.getState().auth.user.name, // Redux store에서 유저 정보 가져오기
      timestamp: new Date().toISOString(),
    };

    stompClient.send(
      `/app/chat/${chatRoomId}`,
      { Authorization: `Bearer ${token}` },
      JSON.stringify(message)
    );
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
      stompClient?.send(
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
