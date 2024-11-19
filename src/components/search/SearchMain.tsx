import React from "react";
import { Box, Typography, Badge } from "@mui/material";
import { FaThumbtack } from "react-icons/fa";

interface ChatRoom {
  chatRoomId: number;
  chatRoomImage: string;
  roomName: string;
  userCount: number;
  recentMessage: string;
  createAt: string;
  notificationCount: number;
  fix?: boolean;
}

interface SearchMainProps {
  chatRooms?: ChatRoom[];
  onJoinChatRoom: (chatRoomId: number) => void; // 채팅방 참여 핸들러 추가
}

const SearchMain: React.FC<SearchMainProps> = ({
  chatRooms = [],
  onJoinChatRoom,
}) => {
  return (
    <Box>
      {[...chatRooms]
        .sort((a, b) => (b.fix === a.fix ? 0 : b.fix ? 1 : -1)) // room.fix가 true인 항목을 위로 정렬
        .map((room) => (
          <Box
            key={room.chatRoomId}
            onClick={() => {
              if (room.chatRoomId) {
                onJoinChatRoom(room.chatRoomId); // 유효한 chatRoomId만 전달
              } else {
                console.error("Invalid chatRoomId:", room);
              }
            }}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 1.25rem",
              backgroundColor: "#1f1f1f",
              borderRadius: "0.5rem",
              cursor: "pointer",
              transition: "background-color 0.3s",
              marginBottom: "10px",
              "&:hover": {
                backgroundColor: "#333333",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <img
                src={room.chatRoomImage}
                alt={room.roomName}
                style={{ width: "40px", height: "40px", borderRadius: "50%" }}
              />
              <Box sx={{ marginLeft: "1rem" }}>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, color: "#fff" }}
                >
                  {room.roomName} ({room.userCount})
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#B8B8B8" }}
                >
                  {room.recentMessage}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {room.fix && (
                <FaThumbtack
                  style={{
                    fontSize: "12px",
                    marginBottom: "15px",
                    color: "#fff",
                  }}
                />
              )}
              <Typography
                variant="caption"
                sx={{ color: "#B8B8B8", fontSize: "0.8rem", fontWeight: 600 }}
              >
                {new Date(room.createAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
              {room.notificationCount > 0 && (
                <Badge
                  badgeContent={room.notificationCount}
                  color="primary"
                  sx={{
                    marginRight: "0.5rem",
                    fontSize: "0.75rem",
                    fontWeight: "800",
                    marginBottom: "0.5rem",
                  }}
                />
              )}
            </Box>
          </Box>
        ))}
    </Box>
  );
};

export default SearchMain;
