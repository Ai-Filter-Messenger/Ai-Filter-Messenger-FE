import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { loginTestUser } from "@/redux/slices/auth"; // 테스트용 로그인 액션 임포트
import MainLayout from "@/layouts/main";
import ChatLists from "@/components/chat/ChatLists";
import ChatRoom from "@/components/chat/ChatRoom";
import Shared from "@/components/files/Shared";
import { AppDispatch } from "@/redux/store"; // AppDispatch 임포트

const ChatPage = () => {
  const { loginId } = useParams<{ loginId: string }>(); // URL에서 loginId 받아오기
  const dispatch = useDispatch<AppDispatch>(); // useDispatch를 AppDispatch로 타입 지정

  useEffect(() => {
    if (loginId) {
      dispatch(loginTestUser(loginId)); // 테스트용 로그인 처리
    }
  }, [loginId, dispatch]);

  return (
    <MainLayout
      leftComponent={<ChatLists />}
      centerComponent={<ChatRoom chatRoomId={undefined} />}
      rightComponent={<Shared chatRoomId={""} />}
    />
  );
};

export default ChatPage;
