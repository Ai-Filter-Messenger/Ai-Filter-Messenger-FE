import React from "react";
import MainLayout from "@/layouts/main";
import ChatLists from "@/components/chat/ChatLists";
import ChatRoom from "@/components/chat/ChatRoom";
import Shared from "@/components/files/Shared";

const ChatPage = () => {
  return (
    <MainLayout
      leftComponent={<ChatLists />} // 왼쪽: 채팅 목록
      centerComponent={<ChatRoom />} // 중앙: 채팅방
      rightComponent={<Shared />} // 오른쪽: 공유된 파일
    />
  );
};

export default ChatPage;
