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
import { FaPlus, FaThumbtack } from "react-icons/fa6";
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
  roomTitle: string;
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

        // Update roomName and roomTitle for each room
        const updatedRooms = response.data.map((room: ChatRoom) => {
          const roomName = room.userInfo
            .map((user) => user.nickname)
            .join(", ");
          const roomTitle = room.roomName;
          return { ...room, roomName, roomTitle };
        });

        setChatRooms(updatedRooms);
        setFilteredRooms(updatedRooms);
      } catch (error) {
        console.error("Failed to fetch chat rooms:", error);
      }
    };

    if (token && loginId) {
      fetchChatRooms();
    }
  }, [loginId, token, nickname]);

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
                    room.chatRoomId === selectedChatRoomId
                      ? 0 // 현재 보고 있는 채팅방이면 notificationCount를 0으로 설정
                      : receivedMessage.senderName === nickname
                        ? room.notificationCount // 유지
                        : room.notificationCount + 1,
                  recentMessage: newRecentMessage,
                  createAt: createAt,
                };
              }
              return room;
            });
          });
          console.log("selectedChatRoomId :", selectedChatRoomId);
          setFilteredRooms((prevRooms) =>
            prevRooms.map((room) => {
              if (room.chatRoomId === chatRoomId) {
                return {
                  ...room,
                  notificationCount:
                    room.chatRoomId === selectedChatRoomId
                      ? 0 // 현재 보고 있는 채팅방이면 notificationCount를 0으로 설정
                      : receivedMessage.senderName === nickname
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

      const subscriptionChatList = stompClient.subscribe(
        `/queue/chatroom/list/${nickname}`,
        (message) => {
          try {
            console.log("Subscription callback triggered");
            const receivedMessage = JSON.parse(message.body);
            const chatRoomId = receivedMessage.chatRoomId
              ? receivedMessage.chatRoomId
              : roomId;
            const roomName = receivedMessage.roomName;
            const userInfo = receivedMessage.userInfo;
            const createAt = receivedMessage.createAt;
            const type = receivedMessage.type;
            const newRecentMessage =
              type === "FILE"
                ? `${receivedMessage.senderName}님이 사진을 보냈습니다.`
                : receivedMessage.message;

            console.log(receivedMessage);
            console.log(chatRooms);

            setChatRooms((prevRooms) => {
              const existingRoom = prevRooms.find((room) => room.chatRoomId === chatRoomId);
              console.log("exstingRoom", existingRoom);
              if (existingRoom) {
                // 기존 방 제거
                return prevRooms.filter((room) => room.chatRoomId !== chatRoomId);
              } else {
                // 새로운 방 추가
                const newRoom = {
                  chatRoomId,
                  notificationCount: receivedMessage.senderName === nickname ? 0 : 1,
                  recentMessage: newRecentMessage,
                  createAt: createAt,
                  // ChatRoom 타입에 필요한 추가 필드 초기화
                  roomName: roomName,
                  roomTitle: roomName,
                  userInfo: userInfo,  // 예시로 빈 배열로 설정
                  type: receivedMessage.type || "GENERAL",
                  userCount: receivedMessage.userCount || 0,
                  fix: receivedMessage.fix || false,
                  // 나머지 필드도 초기화 필요 시 추가
                };
                return [...prevRooms, newRoom];
              }
            });

            setFilteredRooms((prevRooms) => {
              const existingRoom = prevRooms.find((room) => room.chatRoomId === chatRoomId);
              console.log("filter-exstingRoom", existingRoom);
              if (existingRoom) {

                return prevRooms.filter((room) => room.chatRoomId !== chatRoomId);
              } else {
                const newRoom = {
                  chatRoomId,
                  notificationCount: receivedMessage.senderName === nickname ? 0 : 1,
                  recentMessage: newRecentMessage,
                  createAt: createAt,
                  // ChatRoom 타입에 필요한 추가 필드 초기화
                  roomName: roomName,
                  roomTitle: roomName,
                  userInfo: userInfo,
                  type: receivedMessage.type || "GENERAL",
                  userCount: receivedMessage.userCount || 0,
                  fix: receivedMessage.fix || false,
                };
                return [...prevRooms, newRoom];
              }
            });

          } catch (error) {
            console.error("Error in subscription callback:", error);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
        subscriptionChatList.unsubscribe();
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
    if (!chatRoomId) {
      console.error("chatRoomId가 정의되지 않았습니다.");
      return;
    }
    setSelectedChatRoomId(chatRoomId);
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
      const roomName = [nickname, ...selectedFriends].join(", ");
      const roomTitle = selectedFriends.join(", ") || "채팅방"; // roomName에서 로그인한 유저 제외
      const chatRoomImage = chatRoomType === "OPEN" ? "open" : "";

      const response = await axios.post(
        "/chat/create",
        {
          loginId,
          roomName: roomName,
          nicknames: selectedFriends,
          type: chatRoomType,
          chatRoomImage: chatRoomImage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        alert("채팅방이 성공적으로 생성되었습니다!");
        setIsModalOpen(false);

        // 채팅방 목록 새로고침
        const updatedRooms = await axios.get("/chat/find/list", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { loginId },
        });

        // // roomName과 roomTitle 설정 후 채팅방 목록 업데이트
        // const roomsWithNames = updatedRooms.data.map((room: ChatRoom) => {
        //   const roomName = room.userInfo
        //     .map((user) => user.nickname)
        //     .join(", ");
        //   const roomTitle =
        //     room.userInfo
        //       .filter((user) => user.nickname !== nickname)
        //       .map((user) => user.nickname)
        //       .join(", ") || "채팅방";
        //   return { ...room, roomName, roomTitle };
        // });

        // setChatRooms(roomsWithNames);
        // setFilteredRooms(roomsWithNames);
      } else {
        console.error("채팅방 생성 실패, 상태 코드:", response.status);
      }
    } catch (error) {
      console.error("채팅방 생성 실패:", error);
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

      {[...chatRooms]
        .sort((a, b) => (b.fix === a.fix ? 0 : b.fix ? 1 : -1)) // room.fix가 true인 항목을 위로 정렬
        .map((room) => (
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
                {room.roomTitle} ({room.userCount})
              </Typography>
              <Typography variant="body2" sx={styles.lastMessage}>
                {room.recentMessage}
              </Typography>
            </Box>
            <Box sx={styles.chatMeta} display="flex" flexDirection="column" alignItems="center">
              {room.fix && (
                <FaThumbtack style={{ fontSize: '12px', marginBottom: '15px' }} /> // 핀 아이콘을 시간 위로 배치
              )}
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && friendSearch.trim()) {
                // Enter 키가 눌렸고, friendSearch가 비어있지 않은 경우에만 추가
                setSelectedFriends((prev) => [...prev, friendSearch.trim()]);
                setFriendSearch(""); // 입력창 초기화
                e.preventDefault(); // 기본 Enter 동작 방지 (ex. 폼 제출)
              }
            }}
            sx={styles.textField}
          />

          <Box sx={styles.selectedFriends}>
            {selectedFriends.map((friend: string) => (
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
    width: '30px', // 아바타 크기 조정
    height: '30px',
    borderRadius: '50%',
    marginLeft: '-15px', // 겹침을 더 강하게 하기 위해 음수 값 사용
    border: '2px solid #333', // 경계선 추가 (선택 사항)
  },
  moreAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#666',
    fontSize: '12px',
    marginLeft: '-15px', // 겹침 효과 동일하게 적용
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
