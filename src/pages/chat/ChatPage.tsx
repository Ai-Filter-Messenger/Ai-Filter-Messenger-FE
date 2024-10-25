import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import MainLayout from "@/layouts/main";
import ChatLists from "@/components/chat/ChatLists";
import ChatRoom from "@/components/chat/ChatRoom";
import Shared from "@/components/files/Shared";
import { AppDispatch } from "@/redux/store";
import { RootState } from "@/redux/store";
import {
  connectWebSocket,
  disconnectWebSocket,
} from "@/websocket/socketConnection";

const ChatPage: React.FC = () => {
  const { user, token, isLoggedIn } = useSelector(
    (state: RootState) => state.auth
  );
  const { chatRoomId, loginId } = useParams<{
    chatRoomId: string;
    loginId: string;
  }>(); // URL에서 loginId와 chatRoomId 받아오기
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (isLoggedIn) {
      // 로그인된 사용자에 대한 실제 토큰 가져오기
      const tokenFromStorage = localStorage.getItem("accessToken") || token;

      // 웹소켓 연결 시도
      connectWebSocket(tokenFromStorage || "", chatRoomId || "");

      // 컴포넌트 언마운트 시 웹소켓 연결 종료
      return () => {
        disconnectWebSocket();
      };
    }
  }, [isLoggedIn, chatRoomId, token]);

  return (
    <MainLayout
      leftComponent={<ChatLists />} // 왼쪽 컴포넌트는 ChatLists
      centerComponent={<ChatRoom chatRoomId={chatRoomId || ""} />} // chatRoomId가 undefined일 경우 빈 문자열로 전달
      rightComponent={<Shared chatRoomId={chatRoomId || ""} />} // chatRoomId가 undefined일 경우 빈 문자열로 전달
    />
  );
};

export default ChatPage;
