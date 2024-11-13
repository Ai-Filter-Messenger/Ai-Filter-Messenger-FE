import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  IconButton,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
} from "@mui/material";
import { FaSearch, FaBell } from "react-icons/fa";
import { FaCirclePlus, FaRegFaceSmile } from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import { RootState, AppDispatch } from "@/redux/store";
import { v4 as uuidv4 } from "uuid";
import {
  addMessageSuccess,
  sendMessage,
  setCurrentConversation,
  fetchMessages,
} from "@/redux/slices/chat";
import { stompClient } from "@/websocket/socketConnection";
import axios from "@/utils/axios";
import { useLocation } from "react-router-dom";

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
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentConversation, conversations } = useSelector(
    (state: RootState) => state.chat
  );
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const token = useSelector((state: RootState) => state.auth.token);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const roomName = location.state?.roomName || "채팅방";
  const userInfo = location.state?.userInfo || [];
  const messageContainerRef = useRef<HTMLDivElement>(null);

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
      formData.append("loginId", user.name);

      for (const file of files) {
        formData.append("files", file);
      }

      try {
        const response = await axios.post("/file/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // 인증 토큰 추가
          },
        });
        if (response.status === 200) {
          console.log("파일 업로드 성공");
          alert("파일 업로드 성공");

          // 업로드한 파일을 메시지로 표시
          const result = response.data;
          const message: Message = {
            id: uuidv4(),
            message: result,
            senderName: user.name,
            roomId: chatRoomId as string,
            createAt: new Date().toISOString(),
            type: MessageType.FILE,
          };
          dispatch(addMessageSuccess(message));
        } else {
          console.error("파일 업로드 실패");
          alert("파일 업로드 실패");
        }
      } catch (error) {
        console.error("파일 업로드 오류:", error);
        alert("파일 업로드 오류");
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
          {roomName}
        </Typography>
        <Box sx={styles.icons}>
          <IconButton sx={styles.iconButton}>
            <FaSearch color="#fff" />
          </IconButton>
          <IconButton sx={styles.iconButton}>
            <FaBell color="#fff" />
          </IconButton>
          <IconButton sx={styles.iconButton}>
            <BsThreeDotsVertical color="#fff" />
          </IconButton>
        </Box>
      </Box>

      {/* 채팅 메시지 리스트 */}
      <Box sx={styles.messageContainer} ref={messageContainerRef}>
        {messages?.map((msg, index) => (
          <Box
            key={msg.id}
            sx={{
              ...styles.messageRow,
              flexDirection:
                msg.senderName === user.name ? "row-reverse" : "row",
            }}
          >
            {/* 상대방의 메시지일 경우 아바타와 이름 표시 */}
            {msg.senderName !== user.name &&
              (msg.type === "MESSAGE" || msg.type === "FILE") && (
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
              )}
            <Box
              sx={{
                ...styles.messageBox,
                backgroundColor:
                  msg.type !== "MESSAGE" && msg.type !== "FILE"
                    ? "#9669ad"
                    : msg.senderName === user.name
                      ? "#615ef1"
                      : "#3b4654",
                alignSelf:
                  msg.type !== "MESSAGE" && msg.type !== "FILE"
                    ? "center"
                    : msg.senderName === user.name
                      ? "flex-end"
                      : "flex-start",
                margin:
                  msg.type !== "MESSAGE" && msg.type !== "FILE" ? "0 auto" : "",
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
            {(msg.type === "MESSAGE" || msg.type === "FILE") && (
              <Typography sx={styles.timestamp}>
                {formatDate(msg.createAt)}
              </Typography>
            )}
          </Box>
        ))}
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
