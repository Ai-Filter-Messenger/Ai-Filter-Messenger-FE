import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Badge,
  Box,
  Typography,
  Button,
  Modal,
  TextField,
  MenuItem,
  IconButton,
} from "@mui/material";
import { AppDispatch, RootState } from "@/redux/store";
import { setCurrentChat } from "@/redux/slices/chat";
import { FaPlus } from "react-icons/fa6";
import axios from "@/utils/axios";
import SearchBar from "@/components/SearchBar";

// ChatRoom 데이터 타입 정의
interface ChatRoom {
  chatRoomId: string;
  type: string;
  roomName: string;
  users: string[]; // 유저 이름 배열로 변경
  profileImages: string[];
  userCount: number;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const ChatLists: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    {
      chatRoomId: "1",
      type: "GENERAL",
      roomName: "구재희",
      users: ["구재희"],
      profileImages: ["https://randomuser.me/api/portraits/men/1.jpg"],
      userCount: 1,
      lastMessage: "응~ 끝나고 전화할게",
      lastMessageTime: "10:30 AM",
      unreadCount: 3,
    },
    {
      chatRoomId: "2",
      type: "GENERAL",
      roomName: "개발 3팀",
      users: ["구재희", "장흥수", "이재현"],
      profileImages: [
        "https://randomuser.me/api/portraits/men/3.jpg",
        "https://randomuser.me/api/portraits/women/1.jpg",
        "https://randomuser.me/api/portraits/men/4.jpg",
      ],
      userCount: 3,
      lastMessage: "전달 사항 참고해주세요.",
      lastMessageTime: "9:15 AM",
      unreadCount: 1,
    },
    {
      chatRoomId: "3",
      type: "GENERAL",
      roomName: "가족",
      users: ["강승원", "강지원", "이수민"],
      profileImages: [
        "https://randomuser.me/api/portraits/men/5.jpg",
        "https://randomuser.me/api/portraits/women/2.jpg",
        "https://randomuser.me/api/portraits/men/6.jpg",
      ],
      userCount: 3,
      lastMessage: "7시에 출발할까?",
      lastMessageTime: "Yesterday",
      unreadCount: 0,
    },
  ]);

  // 검색된 결과 저장할 state 추가
  const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>(chatRooms);

  // 채팅방 create 모달
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatRoomType, setChatRoomType] = useState("GENERAL");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [friendSearch, setFriendSearch] = useState(""); // Search input for friends
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(
    null
  );

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Retrieve loginId from Redux state
  const loginId = useSelector((state: RootState) => state.auth.user.loginId);

  const handleRoomClick = (chatRoomId: string) => {
    setSelectedChatRoomId(chatRoomId); // Set selected room ID
    dispatch(setCurrentChat(chatRoomId));
    navigate(`/chat/${chatRoomId}`);
  };

  const renderProfileImages = (images: string[], userCount: number) => {
    if (userCount === 1) {
      return <Avatar src={images[0]} alt="Profile Image" />;
    }
    return (
      <Box sx={styles.avatarStack}>
        {images.map((image, index) => (
          <Avatar
            key={index}
            src={image}
            alt={`Profile Image ${index + 1}`}
            sx={styles.avatarOverlap}
          />
        ))}
      </Box>
    );
  };

  // 검색어가 바뀔 때마다 필터링된 채팅방을 업데이트
  const handleSearch = (query: string) => {
    if (query === "") {
      setFilteredRooms(chatRooms); // 검색어가 없으면 전체 채팅방 표시
    } else {
      const filtered = chatRooms.filter(
        (room) =>
          room.roomName.toLowerCase().includes(query.toLowerCase()) || // roomName으로 검색
          room.users.some((user) =>
            user.toLowerCase().includes(query.toLowerCase())
          ) // users 배열에서 검색
      );
      setFilteredRooms(filtered);
    }
  };

  const handleCreateRoom = async () => {
    try {
      const response = await axios.post("/api/chat/create", {
        loginId: loginId, // Use the actual loginId from Redux state
        roomName: "",
        nicknames: selectedFriends,
        type: chatRoomType,
      });

      if (response.status === 200) {
        alert("Chat room created successfully!");
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to create chat room:", error);
    }
  };

  return (
    <Box sx={styles.chatListContainer}>
      <Box sx={styles.header}>
        <Typography variant="h1" sx={styles.title}>
          messages
        </Typography>
        <IconButton onClick={() => setIsModalOpen(true)}>
          <FaPlus />
        </IconButton>
      </Box>

      {/* SearchBar 컴포넌트 추가 */}
      <SearchBar onSearch={handleSearch} />

      {filteredRooms.map((room) => (
        <Box
          key={room.chatRoomId}
          sx={{
            ...styles.chatRoom,
            ...(selectedChatRoomId === room.chatRoomId
              ? styles.selectedChatRoom
              : {}),
          }}
          onClick={() => handleRoomClick(room.chatRoomId)}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#333333")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor =
              selectedChatRoomId === room.chatRoomId ? "#333333" : "#1f1f1f")
          }
        >
          <Box sx={styles.profileContainer}>
            {renderProfileImages(room.profileImages, room.userCount)}
          </Box>
          <Box sx={styles.chatDetails}>
            <Typography variant="body1" sx={styles.roomName}>
              {room.roomName}
            </Typography>
            <Typography variant="body2" sx={styles.lastMessage}>
              {room.lastMessage}
            </Typography>
          </Box>
          <Box sx={styles.chatMeta}>
            <Typography variant="caption" sx={styles.messageTime}>
              {room.lastMessageTime}
            </Typography>
            {room.unreadCount > 0 && (
              <Badge
                badgeContent={room.unreadCount}
                color="primary"
                sx={styles.unreadBadge}
              />
            )}
          </Box>
        </Box>
      ))}

      {/* Modal for creating a new chat room */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sx={styles.modal}
      >
        <Box sx={styles.modalContent}>
          <Typography variant="h6">새 채팅방 만들기</Typography>

          {/* Select Chat Room Type */}
          <TextField
            select
            label="채팅방 유형"
            value={chatRoomType}
            onChange={(e) => setChatRoomType(e.target.value)}
            sx={styles.textField}
          >
            <MenuItem value="GENERAL">일반 채팅</MenuItem>
            <MenuItem value="OPEN">오픈 채팅</MenuItem>
          </TextField>

          {/* Search Friends */}
          <TextField
            label="친구를 검색하세요"
            value={friendSearch}
            onChange={(e) => setFriendSearch(e.target.value)}
            sx={styles.textField}
          />

          {/* List of selected friends */}
          <Box sx={styles.selectedFriends}>
            {selectedFriends.map((friend) => (
              <Badge key={friend} badgeContent="x" color="error">
                {friend}
              </Badge>
            ))}
          </Box>

          <Button variant="contained" onClick={handleCreateRoom}>
            채팅방 생성하기
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

const styles = {
  chatListContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
    padding: "1.25rem",
    borderRadius: "0.5rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    marginTop: "1rem",
    marginBottom: "1rem",
    fontWeight: "bold",
    color: "#fff",
  },
  chatRoom: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1.25rem",
    backgroundColor: "#1f1f1f",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  selectedChatRoom: {
    backgroundColor: "#333333",
  },
  profileContainer: {
    display: "flex",
    alignItems: "center",
  },
  avatarStack: {
    display: "flex",
    flexDirection: "row",
  },
  avatarOverlap: {
    marginLeft: "-0.5rem",
    border: "0.125rem solid #1f1f1f",
  },
  chatDetails: {
    flex: 1,
    marginLeft: "1rem",
  },
  roomName: {
    fontWeight: 600,
    color: "#fff",
  },
  lastMessage: {
    fontWeight: 600,
    color: "#B8B8B8",
  },
  chatMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  messageTime: {
    color: "#B8B8B8",
    marginBottom: "1rem",
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  unreadBadge: {
    marginRight: "0.5rem",
    fontSize: "0.75rem",
    fontWeight: "800",
    marginBottom: "0.5rem",
  },
  modal: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#333333",
    padding: "1.5rem",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    width: "20%",
    maxWidth: "500px",
  },
  textField: {
    marginBottom: "1rem",
  },
  selectedFriends: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
};

export default ChatLists;
