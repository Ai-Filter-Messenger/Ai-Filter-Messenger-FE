import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
} from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
// import customAxios from "@/utils/axios"; // 커스텀 axios 인스턴스

// 환경변수에서 API Base URL 가져오기
const API_BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:8080/api";

const ProfileEdit = () => {
  const [user, setUser] = useState({
    name: "",
    nickname: "",
    password: "********",
    email: "",
    phone: "",
    bio: "",
    profileImageUrl: "",
  });
  const [editField, setEditField] = useState(""); // 현재 수정 중인 필드
  const token = useSelector((state: RootState) => state.auth.token);

  // 유저 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        console.log("유저 정보 요청 시작");
        const response = await axios.get(`${API_BASE_URL}/user/info`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("서버 응답 데이터:", response.data);
        const data = response.data;

        setUser({
          name: data.name || "이름 없음",
          nickname: data.nickname || "닉네임 없음",
          password: "********",
          email: data.email || "이메일 없음",
          phone: data.phone || "-",
          bio: data.bio || "",
          profileImageUrl: data.profileImageUrl || "",
        });
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error(
            "응답 에러:",
            error.response?.status,
            error.response?.data
          );
        } else {
          console.error("알 수 없는 에러:", error);
        }
      }
    };

    fetchUserInfo();
  }, [token]);

  // 유저 정보 수정
  // 유저 정보 수정
  const handleSave = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/user/modify`,
        {
          ...user,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("수정이 완료되었습니다.");
      console.log("수정 성공:", response.data);
      setEditField(""); // 수정 모드 종료
    } catch (error) {
      console.error("유저 정보 수정 실패:", error);
      alert("수정에 실패했습니다.");
    }
  };

  // 필드 수정 상태 변경
  const handleEdit = (field: string) => {
    setEditField(field);
  };

  // 입력값 변경 핸들러
  const handleChange = (field: string, value: string) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={styles.container}>
      {/* 프로필 헤더 */}
      <Box sx={styles.profileHeader}>
        <Avatar
          src={user.profileImageUrl}
          alt={user.nickname}
          sx={styles.avatar}
        />
        <Typography variant="h6">{user.nickname}</Typography>
      </Box>

      {/* 프로필 정보 컨테이너 */}
      <Box sx={styles.infoContainer}>
        {[
          { label: "이름", field: "name", value: user.name, editable: true },
          {
            label: "닉네임",
            field: "nickname",
            value: user.nickname,
            editable: true,
          },
          {
            label: "비밀번호",
            field: "password",
            value: user.password,
            editable: true,
          },
          {
            label: "이메일",
            field: "email",
            value: user.email,
            editable: true,
          },
          {
            label: "소개",
            field: "bio",
            value: user.bio,
            editable: true,
          },
        ].map(({ label, field, value, editable }) => (
          <Box sx={styles.infoRow} key={field}>
            <Typography sx={styles.label}>{label}</Typography>
            {editField === field ? (
              <TextField
                value={value}
                onChange={(e) => handleChange(field, e.target.value)}
                sx={styles.textField}
              />
            ) : (
              <Typography>{value}</Typography>
            )}
            {editable && (
              <Button
                onClick={() =>
                  editField === field ? handleSave() : handleEdit(field)
                }
                sx={editField === field ? styles.saveButton : styles.editButton}
              >
                {editField === field ? "저장" : "수정"}
              </Button>
            )}
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
    width: "4rem",
    height: "4rem",
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
    // justifyContent: "flex-start", // 왼쪽 정렬
    position: "relative",
    gap: "1rem",
  },
  label: {
    fontWeight: "bold",
    color: "#aaa",
    width: "120px",
  },
  textField: {
    // flex: 1,
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#333",
      color: "#fff",
      fontSize: "0.9rem",
      height: "40px",
    },
  },
  editButton: {
    backgroundColor: "#4e4ef7",
    color: "#fff",
    fontSize: "0.8rem",
    padding: "5px 10px",
    position: "absolute",
    right: 0, // 오른쪽 끝에 위치
    "&:hover": {
      backgroundColor: "#6f6ff7",
    },
  },
  charCount: {
    textAlign: "right",
    color: "#aaa",
    fontSize: "0.8rem",
  },
  saveButton: {
    backgroundColor: "#4e4ef7",
    color: "#fff",
    fontSize: "0.8rem",
    padding: "5px 10px",
    position: "absolute",
    right: 0,
    "&:hover": {
      backgroundColor: "#6f6ff7",
    },
    marginLeft: "auto",
  },
};

export default ProfileEdit;
