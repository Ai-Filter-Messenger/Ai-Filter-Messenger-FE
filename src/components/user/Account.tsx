import React from "react";
import { Box, Button } from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // useNavigate 훅 추가
import { RootState } from "@/redux/store";

const API_BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:8080/api";

const Account = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const navigate = useNavigate(); // useNavigate 훅 초기화

  // 계정 삭제 핸들러
  const handleDeleteAccount = async () => {
    if (window.confirm("정말 계정을 삭제하시겠습니까?")) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/user/withdrawal`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("계정이 성공적으로 삭제되었습니다.");
        console.log("계정 삭제 응답:", response.data);

        // 계정 삭제 후 /auth/login으로 이동
        navigate("/auth/login");
      } catch (error) {
        console.error("계정 삭제 실패:", error);
        alert("계정 삭제에 실패했습니다.");
      }
    }
  };

  return (
    <Box>
      <Box sx={styles.buttonContainer}>
        <Button sx={styles.deactivateButton}>계정 비활성화</Button>
        <Button sx={styles.deleteButton} onClick={handleDeleteAccount}>
          계정 삭제하기
        </Button>
      </Box>
    </Box>
  );
};

const styles = {
  buttonContainer: {
    display: "flex",
    gap: "1rem",
    margin: "2rem",
  },
  deactivateButton: {
    backgroundColor: "#333",
    color: "#fff",
    padding: "0.8rem 1.5rem",
    marginRight: "1rem",
    borderRadius: "0.5rem",
    "&:hover": {
      backgroundColor: "#444",
    },
  },
  deleteButton: {
    backgroundColor: "#4e4ef7",
    color: "#fff",
    padding: "0.8rem 1.5rem",
    borderRadius: "0.5rem",
    "&:hover": {
      backgroundColor: "#6f6ff7",
    },
  },
};

export default Account;
