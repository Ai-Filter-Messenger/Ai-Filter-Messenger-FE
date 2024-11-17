import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const API_BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:8080/api";

interface UserProfileProps {
  userId?: number; // 필요 시 userId를 props로 전달 가능
}

const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [user, setUser] = useState({
    name: "",
    nickname: "",
    email: "",
    phone: "",
    profileImageUrl: "",
  });

  const token = useSelector((state: RootState) => state.auth.token);

  // 유저 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/user/info`, // userId가 필요한 경우 `/user/info/${userId}`로 수정
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser({
          name: response.data.name || "이름 없음",
          nickname: response.data.nickname || "닉네임 없음",
          email: response.data.email || "이메일 없음",
          phone: response.data.phone || "-",
          profileImageUrl: response.data.profileImageUrl || "",
        });
      } catch (error) {
        console.error("유저 정보 가져오기 실패:", error);
      }
    };

    fetchUserInfo();
  }, [token, userId]);

  return (
    <Box sx={styles.container}>
      <Box sx={styles.profileHeader}>
        <Avatar
          src={user.profileImageUrl}
          alt={user.nickname}
          sx={styles.avatar}
        />
        <Typography variant="h6">{user.nickname}</Typography>
      </Box>
      <Box sx={styles.infoContainer}>
        {[
          { label: "이름", value: user.name },
          { label: "닉네임", value: user.nickname },
          { label: "이메일", value: user.email },
          { label: "전화번호", value: user.phone },
        ].map(({ label, value }) => (
          <Box sx={styles.infoRow} key={label}>
            <Typography sx={styles.label}>{label}</Typography>
            <Typography>{value}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const styles = {
  container: {
    padding: "2rem 2rem 1.5rem 2rem",
    backgroundColor: "#1e1e1e",
    borderRadius: "10px",
    maxWidth: "600px",
    width: "100%",
    margin: "2rem",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "2rem",
    marginBottom: "2rem",
  },
  avatar: {
    width: "3rem",
    height: "3rem",
  },
  infoContainer: {
    display: "flex",
    flexDirection: "column" as "column",
    gap: "1.5rem",
    backgroundColor: "#2a2a2a",
    padding: "1.5rem",
    borderRadius: "10px",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  label: {
    fontWeight: "bold",
    color: "#aaa",
    width: "120px",
  },
};

export default UserProfile;
