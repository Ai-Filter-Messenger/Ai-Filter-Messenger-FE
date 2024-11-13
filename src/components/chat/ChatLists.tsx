import React, { useState, useEffect } from "react";
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
import { stompClient } from "@/websocket/socketConnection";

interface UserInfo {
  nickname: string;
  profileImageUrl: string;
  id: number;
}

interface ChatRoom {
  chatRoomId: number;
  type: string;
  roomName: string;
  userInfo: UserInfo[];
  userCount: number;
  recentMessage: string;
  createAt: string;
  fix: boolean;
  notificationCount: number;
}

const ChatLists: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatRoomType, setChatRoomType] = useState("GENERAL");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [friendSearch, setFriendSearch] = useState<string>("");
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<number | null>(
    null
  );

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const loginId = useSelector((state: RootState) => state.auth.user.loginId);
  const token = useSelector((state: RootState) => state.auth.token);
  const nickname = localStorage.getItem("nickname");

  const handleAddFriend = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && friendSearch) {
      if (!selectedFriends.includes(friendSearch)) {
        setSelectedFriends((prev) => [...prev, friendSearch]);
      }
      setFriendSearch(""); // 입력 후 초기화
    }
  };
  const handleRemoveFriend = (nickname: string) => {
    setSelectedFriends((prev) => prev.filter((friend) => friend !== nickname));
  };

  // 채팅방 목록을 서버에서 가져오는 함수
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        const response = await axios.get("/chat/find/list", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { loginId },
        });
        setChatRooms(response.data);
        setFilteredRooms(response.data);
      } catch (error) {
        console.error("Failed to fetch chat rooms:", error);
      }
    };

    if (token && loginId) {
      fetchChatRooms();
    }
  }, [loginId, token]);

  // WebSocket을 통해 새 메시지를 수신할 때 알림 카운트를 업데이트하는 함수
  useEffect(() => {
    const urlPath = window.location.pathname;
    const pathParts = urlPath.split("/");
    const nickname = pathParts[2];
    const roomId = pathParts[3];

    const connectStompClient = () => {
      if (stompClient && !stompClient.connected) {
        stompClient.connect({}, () => {
          console.log("Stomp client connected");
          subscribeToRoom(nickname, roomId);
        });
      } else if (stompClient && stompClient.connected) {
        subscribeToRoom(nickname, roomId);
      }
    };

    const subscribeToRoom = (nickname: string, roomId: string) => {
      if (!stompClient) return;
      const subscription = stompClient.subscribe(
        `/queue/chatroom/${nickname}`,
        (message) => {
          const receivedMessage = JSON.parse(message.body);
          const chatRoomId = receivedMessage.roomId
            ? receivedMessage.roomId
            : roomId;
          const createAt = receivedMessage.createAt;
          const type = receivedMessage.type;
          const newRecentMessage =
            type === "FILE"
              ? `${receivedMessage.senderName}님이 사진을 보냈습니다.`
              : receivedMessage.message;

          setChatRooms((prevRooms) => {
            return prevRooms.map((room) => {
              if (room.chatRoomId === chatRoomId) {
                return {
                  ...room,
                  notificationCount:
                    receivedMessage.senderName === nickname
                      ? room.notificationCount // 유지
                      : room.notificationCount + 1,
                  recentMessage: newRecentMessage,
                  createAt: createAt,
                };
              }
              return room;
            });
          });

          setFilteredRooms((prevRooms) =>
            prevRooms.map((room) => {
              if (room.chatRoomId === chatRoomId) {
                return {
                  ...room,
                  notificationCount:
                    receivedMessage.senderName === nickname
                      ? room.notificationCount // 유지
                      : room.notificationCount + 1,
                  recentMessage: newRecentMessage,
                  createAt: createAt,
                };
              }
              return room;
            })
          );
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    };

    connectStompClient();
  }, [selectedChatRoomId, loginId, stompClient]);

  // 채팅방 클릭 시, 해당 방을 현재 방으로 설정 및 알림 초기화 및 이동
  const handleRoomClick = (
    chatRoomId: number,
    roomName: string,
    userInfo: UserInfo[]
  ) => {
    setSelectedChatRoomId(chatRoomId);
    console.log("Navigating with roomName:", roomName); // 전달하는 roomName 확인
    dispatch(setCurrentChat(chatRoomId.toString()));
    navigate(`/chat/${loginId}/${chatRoomId}`, {
      state: { roomName, userInfo },
    });

    // 알림 리셋 처리
    if (stompClient && stompClient.connected) {
      const urlPath = window.location.pathname;
      const pathParts = urlPath.split("/");

      const nickname = pathParts[2];
      const roomId = pathParts[3];

      if (roomId && nickname) {
        stompClient.send(
          "/app/chat/reset/notification",
          {},
          JSON.stringify({ roomId: roomId, nickname: nickname })
        );
      } else {
        console.error("Invalid roomId or nickname:", roomId, nickname);
      }

      // 현재 선택된 채팅방에 대해서만 알림 카운트를 0으로 업데이트
      setChatRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.chatRoomId === chatRoomId
            ? { ...room, notificationCount: 0 }
            : room
        )
      );
      setFilteredRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.chatRoomId === chatRoomId
            ? { ...room, notificationCount: 0 }
            : room
        )
      );
    }
  };

  const renderProfileImages = (userInfo: UserInfo[], userCount: number) => {
    if (userCount === 1) {
      return <Avatar src={userInfo[0].profileImageUrl} alt="Profile Image" />;
    }
    return (
      <Box sx={styles.avatarStack}>
        {userInfo.slice(0, 3).map((user, index) => (
          <Avatar
            key={index}
            src={user.profileImageUrl}
            alt={`Profile Image ${index + 1}`}
            sx={styles.avatarOverlap}
          />
        ))}
        {userCount > 3 && (
          <Avatar sx={styles.moreAvatar}>+{userCount - 3}</Avatar>
        )}
      </Box>
    );
  };

  const handleSearch = (query: string) => {
    if (query === "") {
      setFilteredRooms(chatRooms);
    } else {
      const filtered = chatRooms.filter(
        (room) =>
          room.roomName.toLowerCase().includes(query.toLowerCase()) ||
          room.userInfo.some((user) =>
            user.nickname.toLowerCase().includes(query.toLowerCase())
          )
      );
      setFilteredRooms(filtered);
    }
  };

  const handleCreateRoom = async () => {
    try {
      const defaultRoomName =
        selectedFriends.length > 0 ? selectedFriends.join(", ") : nickname;
      const roomName = defaultRoomName; // roomName을 선언하고 defaultRoomName으로 초기화
      const participants = [nickname, ...selectedFriends];

      console.log("Sending request to create chat room:", {
        loginId,
        roomName: roomName || defaultRoomName, // roomName이 비어 있으면 defaultRoomName 사용
        nicknames: participants,
        type: chatRoomType,
      });

      const response = await axios.post(
        "/chat/create",
        {
          loginId,
          roomName: "",
          nicknames: participants,
          type: chatRoomType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // 토큰 포함
          },
        }
      );
      console.log("Received response data:", response.data);

      if (response.status === 200) {
        alert("Chat room created successfully!");
        setIsModalOpen(false);

        // 생성된 채팅방을 직접 추가
        const newRoom = response.data;
        setChatRooms((prevRooms) => [
          ...prevRooms,
          {
            chatRoomId: newRoom.chatRoomId,
            type: newRoom.type,
            roomName: newRoom.roomName || defaultRoomName, // roomName 기본 값 사용
            userInfo: newRoom.userChatRooms
              ? newRoom.userChatRooms.map((uc: any) => uc.user)
              : [],
            userCount: newRoom.userCount,
            recentMessage: "",
            createAt: newRoom.createAt,
            fix: false,
            notificationCount: 0,
          },
        ]);
        setFilteredRooms((prevRooms) => [
          ...prevRooms,
          {
            chatRoomId: newRoom.chatRoomId,
            type: newRoom.type,
            roomName: newRoom.roomName,
            userInfo: newRoom.userChatRooms
              ? newRoom.userChatRooms.map((uc: any) => uc.user)
              : [],
            userCount: newRoom.userCount,
            recentMessage: "",
            createAt: newRoom.createAt,
            fix: false,
            notificationCount: 0,
          },
        ]);
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

      <SearchBar onSearch={handleSearch} />

      {chatRooms.map((room) => (
        <Box
          key={room.chatRoomId}
          sx={{
            ...styles.chatRoom,
            ...(selectedChatRoomId === room.chatRoomId
              ? styles.selectedChatRoom
              : {}),
          }}
          onClick={() =>
            handleRoomClick(room.chatRoomId, room.roomName, room.userInfo)
          }
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#333333")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor =
              selectedChatRoomId === room.chatRoomId ? "#333333" : "#1f1f1f")
          }
        >
          <Box sx={styles.profileContainer}>
            {renderProfileImages(room.userInfo, room.userCount)}
          </Box>
          <Box sx={styles.chatDetails}>
            <Typography variant="body1" sx={styles.roomName}>
              {room.roomName}({room.userCount})
            </Typography>
            <Typography variant="body2" sx={styles.lastMessage}>
              {room.recentMessage}
            </Typography>
          </Box>
          <Box sx={styles.chatMeta}>
            <Typography variant="caption" sx={styles.messageTime}>
              {new Date(room.createAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
            {room.notificationCount > 0 && (
              <Badge
                badgeContent={room.notificationCount}
                color="primary"
                sx={styles.unreadBadge}
              />
            )}
          </Box>
        </Box>
      ))}

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sx={styles.modal}
      >
        <Box sx={styles.modalContent}>
          <Typography variant="h6">새 채팅방 만들기</Typography>

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

          <TextField
            label="친구를 검색하세요"
            value={friendSearch}
            onChange={(e) => setFriendSearch(e.target.value)}
            onKeyPress={handleAddFriend} // Enter 입력 시 친구 추가
            sx={styles.textField}
          />

          <Box sx={styles.selectedFriends}>
            {selectedFriends.map((friend) => (
              <Badge
                key={friend}
                badgeContent="x"
                color="error"
                onClick={() => handleRemoveFriend(friend)} // 클릭 시 친구 제거
                sx={{ cursor: "pointer" }}
              >
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
  moreAvatar: {
    backgroundColor: "#666",
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
