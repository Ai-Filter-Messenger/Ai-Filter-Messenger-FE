import React, { useEffect, useState } from "react";
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
import {
  addMessageSuccess,
  sendMessage,
  setCurrentConversation,
} from "@/redux/slices/chat";
import { stompClient } from "@/websocket/socketConnection"; // 소켓 연결 추가

// ChatRoom 컴포넌트에 chatRoomId prop을 받도록 타입 추가
interface ChatRoomProps {
  chatRoomId: string | undefined; // chatRoomId가 undefined일 수도 있으므로 optional로 정의
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatRoomId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentConversation } = useSelector((state: RootState) => state.chat);
  const [newMessage, setNewMessage] = useState<string>("");

  useEffect(() => {
    let subscription: any = null;
    if (chatRoomId && stompClient) {
      // 구독 설정
      subscription = stompClient.subscribe(
        `/topic/chatroom/${chatRoomId}`,
        (message) => {
          const receivedMessage = JSON.parse(message.body);
          console.log("Received message from server:", receivedMessage);

          // 메시지를 추가할 때, 중복 메시지 방지 로직 추가
          dispatch(addMessageSuccess(receivedMessage));
        }
      );
    } else {
      console.error("stompClient is null or chatRoomId is missing.");
    }
  }, [chatRoomId, stompClient]);

  useEffect(() => {
    console.log(
      "Current conversation messages:",
      currentConversation?.messages
    );
  }, [currentConversation]);

  // 메시지 전송 핸들러
  const handleSendMessage = () => {
    if (newMessage.trim() !== "" && chatRoomId) {
      const message = {
        id: user.id, // 클라이언트가 ID를 생성
        message: newMessage, // 실제 메시지 내용
        senderName: user.name, // 보낸 사람 이름
        roomId: chatRoomId, // 방 ID
        createAt: new Date().toISOString(), // 생성 시간
        type: "MESSAGE", // 메시지 유형
      };

      console.log("Sending message:", message);

      // 서버로 메시지를 전송
      dispatch(sendMessage(chatRoomId, message, user.token || "")); // 메시지를 전체 객체로 전달

      // 입력창 초기화
      setNewMessage("");
    }
  };

  // chatRoomId가 존재할 경우에만 렌더링
  if (!chatRoomId) {
    return <Typography>채팅방이 선택되지 않았습니다.</Typography>; // 선택되지 않았을 때의 대체 UI
  }

  return (
    <Box sx={styles.container}>
      {/* 상단 - 사용자 목록 및 아이콘 */}
      <Box sx={styles.topBar}>
        <Box sx={styles.userList}>
          {currentConversation?.participants.map((participant, index) => (
            <Avatar key={index} sx={styles.avatar}>
              {participant[0]} {/* 유저 이름의 첫 글자 */}
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
        {currentConversation?.messages
          .filter(
            (msg, index, self) =>
              // 메시지 id가 고유한지 확인하여 중복 제거
              index === self.findIndex((m) => m.id === msg.id)
          )
          .map((msg, index) => (
            <Box
              key={msg.id} // 메시지의 id를 키로 사용하여 고유한 메시지로 처리
              sx={
                msg.senderName === user.name
                  ? styles.myMessage // 로그인된 사용자의 메시지
                  : styles.theirMessage // 상대방의 메시지
              }
            >
              <Typography>{msg.message}</Typography>
              <Typography sx={styles.timestamp}>{msg.createAt}</Typography>
            </Box>
          ))}
      </Box>

      {/* 하단 - 메시지 입력창 */}
      <Box sx={styles.messageInputContainer}>
        <TextField
          fullWidth
          variant="outlined" // outlined를 사용하면 기본적으로 밑줄이 없음
          placeholder="Enter a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={styles.messageInput}
          InputProps={{
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
    fontSize: "1.3rem",
    paddingBottom: "0.4rem",
  },
  sendButton: {
    backgroundColor: "#4e4ef7",
    borderRadius: "50%", // 원형 모양
    padding: "0.5rem",
    marginLeft: "0.5rem",
    marginRight: "0.5rem",
    fontSize: "1.1rem",
  },
};

export default ChatRoom;
