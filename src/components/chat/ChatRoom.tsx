import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
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
} from "@/redux/slices/chat";
import { stompClient } from "@/websocket/socketConnection";
import axios from "@/utils/axios";

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

interface Message {
  type: MessageType;
  id: string;
  message: string;
  senderName: string;
  roomId: string;
  createAt: string;
}

interface UserInfo {
  nickname: string;
  profileImageUrl: string;
  id: number;
}

interface ChatRoomProps {
  chatRoomId: string | undefined;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatRoomId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const token = useSelector((state: RootState) => state.auth.token);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const roomName = location.state?.roomName || "채팅방";
  const userInfo = location.state?.userInfo || []; // 각 유저 정보 가져오기
  const messageContainerRef = useRef<HTMLDivElement>(null); // 메시지 컨테이너 참조 추가

  const getUserAvatar = (senderName: string) => {
    const user = userInfo.find((u: UserInfo) => u.nickname === senderName);
    return user?.profileImageUrl || ""; // 프로필 이미지 URL 반환
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get("/chat/find/message", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { chatRoomId },
        });
        setMessages(response.data.reverse());
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();

    const subscribeToChat = () => {
      const subscription = stompClient?.subscribe(
        `/topic/chatroom/${chatRoomId}`,
        (message) => {
          const receivedMessage: Message = {
            ...JSON.parse(message.body),
            type: MessageType[
              JSON.parse(message.body).type as keyof typeof MessageType
            ], // Type casting
          };
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        }
      );
      return () => subscription?.unsubscribe();
    };

    if (stompClient && !stompClient.connected) {
      stompClient.connect({}, subscribeToChat);
    } else {
      subscribeToChat();
    }
  }, [chatRoomId, token]);

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
        type: MessageType.MESSAGE,
      };
      dispatch(addMessageSuccess(message));
      dispatch(sendMessage(chatRoomId, message, user.token || ""));
      setMessages((prevMessages) => [...prevMessages, message]); // 새로고침 없이 파일 메시지 추가
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
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
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
          setMessages((prevMessages) => [...prevMessages, message]);
        } else {
          console.error("File upload failed");
        }
      } catch (error) {
        console.error("File upload error:", error);
      }
    }
  };

  if (!chatRoomId) {
    return <Typography>채팅방이 선택되지 않았습니다.</Typography>;
  }

  return (
    <Box sx={styles.container}>
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

      <Box sx={styles.messageContainer} ref={messageContainerRef}>
        {messages?.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              ...styles.messageRow,
              flexDirection:
                msg.senderName === user.name ? "row-reverse" : "row",
            }}
          >
            {/* 시스템 메시지 구분 처리 */}
            {msg.type !== MessageType.MESSAGE &&
            msg.type !== MessageType.FILE ? (
              <Box
                sx={{
                  ...styles.systemMessage,
                  alignSelf: "center",
                  backgroundColor: "#444",
                  borderRadius: "1rem",
                  padding: "0.5rem 1rem",
                  color: "#fff",
                  fontSize: "0.8rem",
                }}
              >
                <Typography>{msg.message}</Typography>
              </Box>
            ) : (
              <>
                {msg.senderName !== user.name ? (
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
                      <Box
                        sx={{
                          ...styles.messageBox,
                          maxWidth:
                            msg.message.length > 20 ? "60%" : "fit-content",
                          backgroundColor: "#3b4654",
                        }}
                      >
                        {msg.type === MessageType.FILE ? (
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
                          <Typography sx={styles.messageText}>
                            {msg.message}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      ...styles.messageBox,
                      maxWidth: msg.message.length > 20 ? "60%" : "fit-content",
                      backgroundColor: "#615ef1",
                      alignSelf: "flex-end",
                    }}
                  >
                    {msg.type === MessageType.FILE ? (
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
                      <Typography sx={styles.messageText}>
                        {msg.message}
                      </Typography>
                    )}
                  </Box>
                )}
                {/* 타임스탬프 표시: 시스템 메시지가 아닌 경우에만 표시 */}
                {msg.type === MessageType.MESSAGE ||
                msg.type === MessageType.FILE ? (
                  <Typography sx={styles.timestamp}>
                    {formatDate(msg.createAt)}
                  </Typography>
                ) : null}
              </>
            )}
          </Box>
        ))}
      </Box>

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
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-start",
  },
  senderInfo: {
    display: "flex",
    alignItems: "center",
  },
  senderDetails: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  messageAvatar: {
    width: "40px",
    height: "40px",
    marginRight: "0.7rem",
  },
  senderName: {
    fontSize: "0.9rem",
    color: "#fff",
    marginBottom: "0.2rem",
  },
  messageBox: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "70%",
    borderRadius: "1rem",
    padding: "0.5rem 1rem",
    marginBottom: "0.5rem",
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
  systemMessage: {
    textAlign: "center",
    fontSize: "0.8rem",
    color: "#ffffff",
    backgroundColor: "#444",
    padding: "0.3rem 1rem",
    borderRadius: "12px",
    margin: "0.5rem auto",
  },
};

export default ChatRoom;
