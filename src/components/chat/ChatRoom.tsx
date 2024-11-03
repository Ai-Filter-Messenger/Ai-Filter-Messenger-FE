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
import { v4 as uuidv4 } from "uuid";
import {
  addMessageSuccess,
  sendMessage,
  setCurrentConversation,
  fetchMessages,
} from "@/redux/slices/chat";
import { stompClient } from "@/websocket/socketConnection";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

interface ChatRoomProps {
  chatRoomId: string | undefined;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatRoomId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentConversation, conversations } = useSelector(
    (state: RootState) => state.chat
  );
  const [newMessage, setNewMessage] = useState<string>("");

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
    let subscription: any = null;
    if (chatRoomId && stompClient) {
      subscription = stompClient.subscribe(
        `/topic/chatroom/${chatRoomId}`,
        (message) => {
          const receivedMessage = JSON.parse(message.body);
          if (currentConversation) {
            dispatch(addMessageSuccess(receivedMessage));
          } else {
            const newConversation = {
              id: chatRoomId,
              participants: [user.name],
              messages: [receivedMessage],
            };
            dispatch(setCurrentConversation(newConversation));
          }
        }
      );
    }
  }, [chatRoomId, stompClient, dispatch, currentConversation, user.name]);

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

  if (!chatRoomId) {
    return <Typography>채팅방이 선택되지 않았습니다.</Typography>;
  }

  return (
    <Box sx={styles.container}>
      {/* 상단 - 참여자 목록 */}
      <Box sx={styles.topBar}>
        {currentConversation?.participants.map((participant, index) => (
          <Box key={index} sx={styles.participant}>
            <Avatar sx={styles.avatar}>{participant[0]}</Avatar>
            <Typography sx={styles.participantName}>{participant}</Typography>
          </Box>
        ))}
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
        {currentConversation?.messages.map((msg, index) => (
          <Box
            key={msg.id}
            sx={{
              ...styles.messageRow,
              flexDirection:
                msg.senderName === user.name ? "row-reverse" : "row",
            }}
          >
            {/* 상대방의 메시지일 경우 아바타와 이름 표시 */}
            {msg.senderName !== user.name && (
              <Box sx={styles.senderInfo}>
                <Avatar sx={styles.messageAvatar}>{msg.senderName[0]}</Avatar>
                <Typography sx={styles.senderName}>{msg.senderName}</Typography>
              </Box>
            )}
            <Box
              sx={{
                ...styles.messageBox,
                backgroundColor:
                  msg.senderName === user.name ? "#4e4ef7" : "#2c2c2c",
                alignSelf:
                  msg.senderName === user.name ? "flex-end" : "flex-start",
              }}
            >
              <Typography sx={styles.messageText}>{msg.message}</Typography>
              <Typography sx={styles.timestamp}>
                {formatDate(msg.createAt)}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* 하단 - 메시지 입력창 */}
      <Box sx={styles.messageInputContainer}>
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
