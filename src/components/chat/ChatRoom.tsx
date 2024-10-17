import React, { useState } from "react";
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
import { sendMessage } from "@/redux/slices/chat";
import { Message } from "@/redux/slices/chat";

const ChatRoom: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentConversation } = useSelector((state: RootState) => state.chat);
  const [newMessage, setNewMessage] = useState<string>("");

  // 메시지 전송 핸들러
  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      dispatch(
        sendMessage(
          currentConversation?.id || "",
          newMessage,
          "yourAuthTokenHere"
        )
      );
      setNewMessage(""); // 메시지 전송 후 입력창 초기화
    }
  };

  return (
    <Box sx={styles.container}>
      {/* 상단 - 사용자 목록 및 아이콘 */}
      <Box sx={styles.topBar}>
        <Box sx={styles.userList}>
          {currentConversation?.participants.map((user, index) => (
            <Avatar key={index} sx={styles.avatar}>
              {user[0]} {/* 유저 이름의 첫 글자 */}
            </Avatar>
          ))}
        </Box>
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
      <Box sx={styles.messageContainer}>
        {currentConversation?.messages.map((msg: Message, index) => (
          <Box
            key={index}
            sx={
              msg.author === "yourUserNameHere"
                ? styles.myMessage
                : styles.theirMessage
            }
          >
            <Typography>{msg.content}</Typography>
            <Typography sx={styles.timestamp}>{msg.timestamp}</Typography>
          </Box>
        ))}
      </Box>

      {/* 하단 - 메시지 입력창 */}
      <Box sx={styles.messageInputContainer}>
        <TextField
          fullWidth
          variant="outlined" // 또는 "filled"
          placeholder="Enter a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={styles.messageInput}
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <IconButton sx={styles.inputIcon}>
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
    justifyContent: "space-between",
    padding: "1rem",
    borderBottom: "1px solid #333",
    alignItems: "center",
  },
  userList: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    marginLeft: "0.5rem",
    width: "2.5rem",
    height: "2.5rem",
  },
  icons: {
    display: "flex",
    alignItems: "center",
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
  },
  myMessage: {
    backgroundColor: "#4e4ef7",
    color: "#fff",
    alignSelf: "flex-end",
    padding: "0.5rem 1rem",
    borderRadius: "1rem",
    maxWidth: "70%",
    marginBottom: "0.5rem",
  },
  theirMessage: {
    backgroundColor: "#2c2c2c",
    color: "#fff",
    alignSelf: "flex-start",
    padding: "0.5rem 1rem",
    borderRadius: "1rem",
    maxWidth: "70%",
    marginBottom: "0.5rem",
  },
  timestamp: {
    fontSize: "0.75rem",
    color: "#b0b0b0",
    marginTop: "0.25rem",
  },
  messageInputContainer: {
    display: "flex",
    alignItems: "center",
    padding: "1rem",
    backgroundColor: "#1e1e1e", // 외곽선 없음
    border: "none", // 외곽선 제거
  },
  messageInput: {
    backgroundColor: "#2c2c2c",
    borderRadius: "1.5rem",
    border: "none",
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none", // 외곽선 완전 제거
    },
    paddingLeft: "0.9rem",
    color: "#fff",
    input: {
      color: "#fff",
    },
  },
  inputIcon: {
    // padding: "0.5rem", // 입력창 내부 아이콘에 패딩 추가
    fontSize: "1.3rem",
    // marginLeft: "0.5rem",
    paddingBottom: "0.4rem",
  },
  sendButton: {
    backgroundColor: "#4e4ef7", // 원형 배경 색상
    borderRadius: "50%", // 원형 모양
    padding: "0.5rem", // 패딩을 추가해 버튼 크기 조절
    marginLeft: "0.5rem",
    marginRight: "0.5rem",
    fontSize: "1.1rem",
  },
};

export default ChatRoom;
