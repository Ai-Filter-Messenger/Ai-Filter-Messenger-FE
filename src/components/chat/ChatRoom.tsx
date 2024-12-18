import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "@/utils/axios";
import { stompClient } from "@/websocket/socketConnection";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
  Modal,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { FaSearch, FaBell, FaThumbtack, FaUserPlus } from "react-icons/fa";
import {
  FaCirclePlus,
  FaRegFaceSmile,
  FaArrowRightFromBracket,
} from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import { RootState, AppDispatch } from "@/redux/store";
import { v4 as uuidv4 } from "uuid";
import {
  addMessageSuccess,
  sendMessage,
  setCurrentConversation,
  setCurrentChat,
} from "@/redux/slices/chat";
import Shared from "../files/Shared";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
};

enum MessageType {
  CHAT = "CHAT",
  JOIN = "JOIN",
  LEAVE = "LEAVE",
  INVITE = "INVITE",
  FILE = "FILE",
  MESSAGE = "MESSAGE",
}

// Message 인터페이스
interface Message {
  type: MessageType;
  id: string;
  message: string;
  senderName: string;
  roomId: string;
  createAt: string; // ISO 형식의 문자열로 ZonedDateTime을 표현
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

interface ChatRoomProps {
  chatRoomId: string | undefined;
}

interface UserInfo {
  nickname: string;
  profileImageUrl: string;
  id: number;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatRoomId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const loginId = user?.loginId;
  const nickname = user?.nickname;

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>([]);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<number | null>(
    null
  );
  const { currentConversation, conversations } = useSelector(
    (state: RootState) => state.chat
  );
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const userInfo = location.state?.userInfo || [];

  const roomTitle = location.state?.roomName || [];

  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false); // 초대 모달 상태
  const [inviteNickname, setInviteNickname] = useState<string>(""); // 초대할 유저 닉네임

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenInviteModal = () => setInviteModalOpen(true);
  const handleCloseInviteModal = () => setInviteModalOpen(false);

  const [refreshSharedFiles, setRefreshSharedFiles] = useState(0); // Shared 갱신 트리거

  const onFileUploadSuccess = () => {
    setRefreshSharedFiles((prev) => prev + 1); // Shared 컴포넌트 갱신
  };

  const handlePinChatRoom = async () => {
    console.log("채팅방 고정");
    try {
      const response = await axios.put(
        `/chat/pin/toggle?chatRoomId=${chatRoomId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert(response.data);
    } catch (error) {
      console.error("채팅방 고정 실패:", error);
      alert("채팅방 고정에 실패했습니다.");
    }
    handleCloseModal();
  };

  const handleInviteUser = async () => {
    if (!chatRoomId || !inviteNickname.trim()) {
      alert("채팅방 ID나 닉네임이 유효하지 않습니다.");
      return;
    }

    try {
      const response = await axios.post(
        "/chat/invite",
        {
          chatRoomId: Number(chatRoomId),
          nicknames: [inviteNickname.trim()],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        alert(`${inviteNickname} 님이 초대되었습니다.`);
        setInviteNickname(""); // 입력 필드 초기화
        handleCloseInviteModal();
      }
    } catch (error) {
      console.error("사용자 초대 실패:", error);
      alert("사용자 초대에 실패했습니다.");
    }
  };

  const handleLeaveChatRoom = async () => {
    try {
      await axios.put(
        "/chat/leave",
        { chatRoomId: chatRoomId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("채팅방에서 나왔습니다.");

      // 채팅방 목록 새로고침
      // const updatedRoomsResponse = await axios.get("/chat/find/list", {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      //   params: { loginId },
      // });
      // setChatRooms(updatedRoomsResponse.data);
      // setFilteredRooms(updatedRoomsResponse.data);

      // 선택된 채팅방 ID를 null로 설정하여 빈 페이지 렌더링
      setSelectedChatRoomId(null);
      dispatch(setCurrentChat("")); // 빈 문자열 전달하여 string 타입 맞춤
      navigate(`/chat/${loginId}`, { replace: true }); // URL 업데이트하여 빈 페이지 표시

      // 모달 닫기
      handleCloseModal();
    } catch (error) {
      console.error("채팅방 나가기 실패:", error);
      alert("채팅방 나가기에 실패했습니다.");
    }
  };

  useEffect(() => {
    if (!currentConversation && conversations.length > 0) {
      const firstConversation = conversations.find(
        (conv) => conv.id === chatRoomId
      );
      if (firstConversation) {
        dispatch(setCurrentConversation(firstConversation));
      }
    }
  }, [currentConversation, conversations, chatRoomId, dispatch]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get("/chat/find/message", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { chatRoomId },
        });
        console.log(response.data);
        setMessages(response.data.reverse());
      } catch (error) {
        console.error("Failed to fetch chat rooms:", error);
      }
    };

    fetchMessages();
    let subscription: any = null;
    const subscribeToChat = () => {
      if (stompClient && stompClient.connected) {
        subscription = stompClient.subscribe(
          `/topic/chatroom/${chatRoomId}`,
          (message) => {
            const receivedMessage = JSON.parse(message.body);
            console.log(receivedMessage);
            // 새 메시지를 기존 메시지 배열에 추가
            setMessages((prevMessages) => [...prevMessages, receivedMessage]);
          }
        );
      } else {
        console.error("STOMP 클라이언트가 연결되지 않았습니다.");
      }
    };

    // 초기 연결이 되지 않았으면, 연결 이벤트가 완료된 후 구독 시도
    if (stompClient && !stompClient.connected) {
      stompClient.connect({}, subscribeToChat);
    } else {
      subscribeToChat();
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [chatRoomId, stompClient]);

  const getUserAvatar = (senderName: string) => {
    const user = userInfo.find((u: UserInfo) => u.nickname === senderName);
    return user?.profileImageUrl || ""; // 프로필 이미지 URL 반환
  };

  // 메시지가 업데이트될 때마다 자동 스크롤
  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== "" && chatRoomId) {
      const message = {
        id: uuidv4(),
        message: newMessage,
        senderName: user.name,
        roomId: chatRoomId,
        createAt: new Date().toISOString(),
        type: "MESSAGE",
      };
      dispatch(addMessageSuccess(message));
      dispatch(sendMessage(chatRoomId, message, user.token || ""));
      setNewMessage("");
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append("roomId", chatRoomId || "");

      for (const file of files) {
        formData.append("files", file);
      }

      try {
        const response = await axios.post("/file/upload", formData, {
          params: { roomId: chatRoomId },
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("File upload response:", response.data);

        const { success } = response.data;

        if (success) {
          alert("파일 업로드에 성공했습니다");
          onFileUploadSuccess(); // 파일 업로드 후 Shared 갱신
        } else {
          alert("파일 업로드에 실패했습니다.");
        }
      } catch (error) {
        console.error("파일 업로드 오류:", error);
        alert("파일 업로드 중 오류가 발생했습니다.");
      }
    }
  };

  if (!chatRoomId) {
    return <Typography>채팅방이 선택되지 않았습니다.</Typography>;
  }

  return (
    <Box sx={styles.container}>
      {/* 상단 - 참여자 목록 */}
      <Box sx={styles.topBar}>
        <Typography variant="h6" sx={{ color: "#fff" }}>
          {roomTitle}
        </Typography>
        <Box sx={styles.icons}>
          <IconButton sx={styles.iconButton}>
            <FaSearch color="#fff" />
          </IconButton>
          <IconButton sx={styles.iconButton}>
            <FaBell color="#fff" />
          </IconButton>
          <IconButton sx={styles.iconButton} onClick={handleOpenModal}>
            <BsThreeDotsVertical color="#fff" />
          </IconButton>
        </Box>
      </Box>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={styles.modalContainer}>
          <List>
            <ListItem
              component="button"
              onClick={handlePinChatRoom}
              sx={styles.listItem}
            >
              <ListItemIcon>
                <FaThumbtack />
              </ListItemIcon>
              <ListItemText primary="채팅방 고정" />
            </ListItem>
            <ListItem
              component="button"
              onClick={handleOpenInviteModal}
              sx={styles.listItem}
            >
              <ListItemIcon>
                <FaUserPlus />
              </ListItemIcon>
              <ListItemText primary="초대하기" />
            </ListItem>
            <ListItem
              component="button"
              onClick={handleLeaveChatRoom}
              sx={styles.listItem}
            >
              <ListItemIcon>
                <FaArrowRightFromBracket />
              </ListItemIcon>
              <ListItemText primary="나가기" />
            </ListItem>
          </List>
        </Box>
      </Modal>

      <Modal
        open={inviteModalOpen}
        onClose={handleCloseInviteModal}
        sx={styles.modal} // 모달 위치와 정렬 스타일
      >
        <Box sx={styles.modalContent}>
          {" "}
          {/* 모달 내부 스타일 */}
          <Typography variant="h6" sx={styles.modalTitle}>
            사용자 초대
          </Typography>
          <TextField
            label="닉네임 입력"
            value={inviteNickname}
            onChange={(e) => setInviteNickname(e.target.value)}
            fullWidth
            variant="outlined"
            sx={styles.textField}
            placeholder="친구를 검색하세요"
          />
          <Box sx={styles.modalButtonContainer}>
            <Button
              variant="outlined"
              onClick={handleCloseInviteModal}
              sx={styles.cancelButton}
            >
              취소
            </Button>
            <Button
              variant="contained"
              onClick={handleInviteUser}
              sx={styles.confirmButton}
            >
              초대
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* 채팅 메시지 리스트 */}
      <Box sx={styles.messageContainer} ref={messageContainerRef}>
        {messages?.map((msg, index) => {
          const isFirstInGroup =
            index === 0 || // 첫 번째 메시지일 때 true
            formatDate(msg.createAt) !==
              formatDate(messages[index - 1].createAt) ||
            msg.senderName !== messages[index - 1].senderName;

          const isLastInGroup =
            index === messages.length - 1 ||
            formatDate(msg.createAt) !==
              formatDate(messages[index + 1].createAt) ||
            msg.senderName !== messages[index + 1].senderName;

          const isSystemMessage = msg.type === MessageType.INVITE;

          return (
            <Box
              key={msg.id}
              sx={{
                ...styles.messageRow,
                flexDirection: isSystemMessage
                  ? "row" // 초대 메시지는 중앙 정렬
                  : msg.senderName === user.name
                    ? "row-reverse"
                    : "row",
                marginBottom: isLastInGroup
                  ? "5px"
                  : isFirstInGroup
                    ? "-10px"
                    : "0px",
              }}
            >
              {/* 아바타와 닉네임은 일반 메시지에서만 표시 */}
              {!isSystemMessage &&
              isFirstInGroup &&
              msg.senderName !== user.name &&
              (msg.type === "MESSAGE" || msg.type === "FILE") ? (
                <Box sx={styles.senderInfo}>
                  <Avatar
                    sx={styles.messageAvatar}
                    src={getUserAvatar(msg.senderName)}
                    alt={msg.senderName}
                  />
                  <Box sx={styles.senderDetails}>
                    <Typography sx={styles.senderName}>
                      {msg.senderName}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                // 빈 공간 유지 (아바타가 없는 경우)
                <Box sx={{ width: "38px" }} />
              )}

              {/* 메시지 박스 */}
              <Box
                sx={{
                  ...styles.messageBox,
                  backgroundColor: isSystemMessage
                    ? "#444" // 시스템 메시지 스타일
                    : msg.type !== "MESSAGE" && msg.type !== "FILE"
                      ? "rgba(87, 83, 89, 0.3)" // 50% 투명도
                      : msg.senderName === user.name
                        ? "#615ef1"
                        : "#3b4654",
                  alignSelf: isSystemMessage
                    ? "center" // 시스템 메시지는 중앙 정렬
                    : msg.type !== "MESSAGE" && msg.type !== "FILE"
                      ? "center"
                      : msg.senderName === user.name
                        ? "flex-end"
                        : "flex-start",
                  margin:
                    isSystemMessage ||
                    (msg.type !== "MESSAGE" && msg.type !== "FILE")
                      ? "0 auto" // 시스템 메시지 및 특정 메시지 중앙 정렬
                      : "",
                  marginBottom: isLastInGroup
                    ? "5px"
                    : isFirstInGroup
                      ? "10px"
                      : "0px",
                }}
              >
                {msg.type === "FILE" ? (
                  <img
                    src={msg.message}
                    alt="Uploaded file"
                    onLoad={scrollToBottom}
                    style={{
                      maxWidth: "400px",
                      maxHeight: "300px",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <Typography sx={styles.messageText}>{msg.message}</Typography>
                )}
              </Box>

              {/* 타임스탬프는 일반 메시지에서만 표시 */}
              {isLastInGroup &&
                (msg.type === "MESSAGE" || msg.type === "FILE") && (
                  <Typography sx={styles.timestamp}>
                    {formatDate(msg.createAt)}
                  </Typography>
                )}
            </Box>
          );
        })}
      </Box>

      {/* 하단 - 메시지 입력창 */}
      <Box sx={styles.messageInputContainer}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={onFileChange}
          multiple
        />
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Enter a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={styles.messageInput}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton sx={styles.inputIcon} onClick={handleFileUpload}>
                  <FaCirclePlus color="#fff" />
                </IconButton>
                <IconButton sx={styles.inputIcon}>
                  <FaRegFaceSmile color="#fff" />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton sx={styles.sendButton} onClick={handleSendMessage}>
                  <IoSend color="#fff" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as "column",
    height: "100%",
    backgroundColor: "#1e1e1e",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem",
    borderBottom: "1px solid #333",
  },
  modalContainer: {
    position: "fixed",
    top: "4.3rem",
    right: "20%",
    backgroundColor: "#222",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  modal: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#333333",
    padding: "1.5rem",
    borderRadius: "12px",
    width: "18rem",
    maxWidth: "90%",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    border: "1px solid #555",
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#444",
      color: "#fff",
      borderRadius: "8px",
      "& fieldset": {
        borderColor: "#666",
      },
      "&:hover fieldset": {
        borderColor: "#888",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#fff",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#aaa",
    },
  },
  modalButtonContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
  },
  cancelButton: {
    backgroundColor: "#555",
    color: "#fff",
    borderColor: "#666",
    "&:hover": {
      backgroundColor: "#666",
      borderColor: "#777",
    },
  },
  confirmButton: {
    backgroundColor: "#615ef1",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#5050d0",
    },
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    backgroundColor: "#222",
    color: "#fff",
    padding: "0.2rem 1.8rem",
    "&:hover": {
      backgroundColor: "#333",
    },
    "&:active": {
      backgroundColor: "#444",
    },
    border: "none",
  },
  participant: {
    display: "flex",
    alignItems: "center",
    marginRight: "1rem",
  },
  avatar: {
    width: "30px",
    height: "30px",
    marginRight: "0.5rem",
  },
  participantName: {
    color: "#fff",
  },
  icons: {
    display: "flex",
    gap: "0.5rem",
  },
  iconButton: {
    padding: "0.5rem",
    fontSize: "1.3rem",
  },
  messageContainer: {
    flex: 1,
    padding: "1rem",
    overflowY: "auto" as "auto",
    display: "flex",
    flexDirection: "column" as "column",
    gap: "0.5rem",
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-start",
  },
  senderInfo: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    marginRight: "0.5rem",
  },
  messageBox: {
    display: "flex",
    flexDirection: "column" as "column",
    maxWidth: "70%",
    borderRadius: "1rem",
    padding: "0.5rem 1rem",
  },
  messageAvatar: {
    width: "30px",
    height: "30px",
    marginBottom: "0.2rem",
  },
  senderDetails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  senderName: {
    fontSize: "0.75rem",
    color: "#b0b0b0",
    textAlign: "center",
  },
  messageText: {
    color: "#fff",
    wordWrap: "break-word" as "break-word",
  },
  timestamp: {
    fontSize: "0.75rem",
    color: "#b0b0b0",
    marginTop: "0.25rem",
    alignSelf: "flex-end",
    marginRight: "0.5rem",
    marginLeft: "0.5rem",
  },
  messageInputContainer: {
    display: "flex",
    alignItems: "center",
    padding: "1rem",
    backgroundColor: "#1e1e1e",
  },
  messageInput: {
    backgroundColor: "#2c2c2c",
    borderRadius: "1.5rem",
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },
    paddingLeft: "0.9rem",
    color: "#fff",
    input: {
      color: "#fff",
    },
  },
  inputIcon: {
    fontSize: "1.3rem",
    paddingBottom: "0.4rem",
  },
  sendButton: {
    backgroundColor: "#4e4ef7",
    borderRadius: "50%",
    padding: "0.5rem",
    marginLeft: "0.5rem",
    fontSize: "1.1rem",
  },
};

export default ChatRoom;
