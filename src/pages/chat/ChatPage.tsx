import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { loginTestUser } from "@/redux/slices/auth"; // 테스트용 로그인 액션 임포트
import MainLayout from "@/layouts/main";
import ChatLists from "@/components/chat/ChatLists";
import ChatRoom from "@/components/chat/ChatRoom";
import Shared from "@/components/files/Shared";
import { AppDispatch } from "@/redux/store"; // AppDispatch 임포트
import { RootState } from "@/redux/store"; // RootState 추가
import {
  connectWebSocket,
  disconnectWebSocket,
} from "@/websocket/socketConnection"; // 웹소켓 연결 및 해제 함수 임포트

const ChatPage = () => {
  const { chatRoomId, loginId } = useParams<{
    chatRoomId: string;
    loginId: string;
  }>(); // URL에서 loginId와 chatRoomId 받아오기
  const dispatch = useDispatch<AppDispatch>(); // useDispatch를 AppDispatch로 타입 지정
  const currentChatId = useSelector(
    (state: RootState) => state.chat.currentConversation?.id
  ); // 현재 선택된 채팅방 ID

  useEffect(() => {
    if (loginId) {
      dispatch(loginTestUser(loginId)); // 테스트용 로그인 처리
    }

    // 웹소켓 연결 시도
    const socket = connectWebSocket(loginId || ""); // 로그인 ID로 연결

    // Cleanup function to close the socket when the component unmounts
    return () => {
      disconnectWebSocket(); // 웹소켓 연결 종료
    };
  }, [loginId, dispatch, chatRoomId]);

  return (
    <MainLayout
      leftComponent={<ChatLists />} // 왼쪽 컴포넌트는 ChatLists
      centerComponent={<ChatRoom chatRoomId={chatRoomId || ""} />} // chatRoomId가 undefined일 경우 빈 문자열로 전달
      rightComponent={<Shared chatRoomId={chatRoomId || ""} />} // chatRoomId가 undefined일 경우 빈 문자열로 전달
    />
  );
};

export default ChatPage;
