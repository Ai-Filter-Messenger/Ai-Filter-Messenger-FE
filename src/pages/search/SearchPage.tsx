import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const token = localStorage.getItem("accessToken");
  const [openChatRooms, setOpenChatRooms] = useState<ChatRoom[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOpenChat = async () => {
      try {
        const response = await axios.get("/chat/find/list/open", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const chatRoomsData = response.data.map((room: any) => ({
          chatRoomId: room.chatRoomId, // 반드시 chatRoomId를 포함
          chatRoomImage: room.chatroomImage || "",
          roomName: room.roomName || "",
          userCount: room.userCount || 0,
          recentMessage: room.recentMessage || "",
          createAt: room.createAt || "",
        }));
        console.log("Fetched chat rooms:", chatRoomsData);

        setOpenChatRooms(chatRoomsData);
      } catch (error) {
        console.error("Failed to fetch chat rooms:", error);
      }
    };

    fetchOpenChat();
  }, [token]);

  const handleJoinChatRoom = async (chatRoomId: number) => {
    try {
      console.log("Joining chat room with ID:", chatRoomId);
      const response = await axios.put(
        "/chat/join",
        { chatRoomId: Number(chatRoomId) },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      console.log("채팅방 참여 성공:", response.data);

      // 채팅방으로 이동
      navigate(`/chat/${localStorage.getItem("loginId")}/${chatRoomId}`);
    } catch (error: any) {
      console.error("채팅방 참여 실패:", error.response?.data || error.message);
      alert(
        "채팅방 참여에 실패했습니다: " +
          (error.response?.data || "알 수 없는 오류")
      );
    }
    console.log("Selected chatRoomId:", chatRoomId);
  };

  return (
    <MainLayout
      leftComponent={<SearchMenu />} // 왼쪽: 검색 메뉴
      centerComponent={
        <SearchMain
          chatRooms={openChatRooms}
          onJoinChatRoom={handleJoinChatRoom} // 참여 버튼 클릭 핸들러 전달
        />
      } // 중앙: 검색 메인
      isCustom={true}
    />
  );
};

export default SearchPage;
