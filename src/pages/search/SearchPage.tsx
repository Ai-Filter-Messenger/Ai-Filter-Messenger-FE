import React, { useEffect, useState } from "react";
import MainLayout from "@/layouts/main";
import SearchMenu from "@/components/search/SearchMenu";
import SearchMain from "@/components/search/SearchMain";
import axios from "@/utils/axios";

interface ChatRoom {
  chatRoomId: number;
  chatRoomImage: string;
  roomName: string;
  userCount: number;
  recentMessage: string;
  createAt: string;
  notificationCount: number;
}

const SearchPage = () => {
  const token = localStorage.getItem('accessToken');
  const [openChatRooms, setOpenChatRooms] = useState<ChatRoom[]>([]);
  console.log(token);

  useEffect(() => {
    const fetchOpenChat = async () => {
      try {
        const response = await axios.get("/chat/find/list/open", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const chatRoomsData = response.data.map((room: any) => ({
          chatRoomId: room.chatRoomId || 0,  // 없으면 기본값 0
          chatRoomImage: room.chatroomImage || "",  // 기본값 빈 문자열
          roomName: room.roomName || "",
          userCount: room.userCount || 0,
          recentMessage: room.recentMessage || "",
          createAt: room.createAt || "",
          notificationCount: room.notificationCount || 0,  // 필요 시 기본값 설정
        }));
        console.log(response.data);
        setOpenChatRooms(chatRoomsData);
      } catch (error) {
        console.error("Failed to fetch chat rooms:", error);
      }
    };

    fetchOpenChat();

  }, [])

  return (
    <MainLayout
      leftComponent={<SearchMenu />} // 왼쪽: 검색 메뉴
      centerComponent={<SearchMain chatRooms={openChatRooms} />} // 중앙 및 오른쪽 영역 통합: 검색 메인
      isCustom={true} // centerComponent와 rightComponent를 합친 Custom 사용
    />

  );
};

export default SearchPage;
