import React, { useEffect, useState } from "react";
import {
  Button,
  TextField,
  Checkbox,
  Typography,
  Box,
  Link,
} from "@mui/material";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LoginUser } from "@/redux/slices/auth"; // Login 액션 가져오기
import { RootState, AppDispatch } from "@/redux/store"; // RootState, AppDispatch 가져오기

const LoginPage: React.FC = () => {
  useEffect(() => {
    console.log("VITE_BASE_URL:", import.meta.env.VITE_BASE_URL);
  }, []);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>(); // AppDispatch 타입 적용

  const authState = useSelector((state: RootState) => state.auth); // auth 상태 가져오기

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // 폼 제출 시 페이지 리로드 방지
    if (loginId && password) {
      try {
        const response = await dispatch(
          LoginUser({ loginId, password }, navigate)
        );
        console.log("Login response:", response); // 로그인 응답 확인
      } catch (error) {
        console.error("Login error:", error); // 오류 시 로그 출력
      }
    }
  };

  return (
    <Box width="100%">
      <Typography variant="h3" textAlign="left" mb={4} fontWeight="medium">
        Sign in
      </Typography>

      {/* 폼 태그로 비밀번호 필드를 감싸기 */}
      <form onSubmit={handleLogin}>
        <TextField
          fullWidth
          label="아이디"
          variant="outlined"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box position="relative" mb={2}>
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            label="비밀번호"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Box
            position="absolute"
            top="50%"
            right="1rem"
            sx={{ cursor: "pointer", transform: "translateY(-50%)" }}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
          </Box>
        </Box>
        <Box display="flex" alignItems="center" mb={3}>
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <Typography>아이디 저장</Typography>
        </Box>
        {authState.error && (
          <Typography color="error" mb={2}>
            {authState.error}
          </Typography>
        )}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit" // 버튼 타입을 "submit"으로 변경
          sx={{ mb: 3 }}
        >
          로그인
        </Button>
      </form>

      <Typography component="div" variant="body2" mb={4}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* 소셜 로그인 양 옆에 선을 추가 */}
          <Box sx={{ flex: 1, height: "1px", bgcolor: "#a7a7a7", mr: 2 }} />
          소셜 로그인
          <Box sx={{ flex: 1, height: "1px", bgcolor: "#a7a7a7", ml: 2 }} />
        </Box>
      </Typography>

      {/* 소셜 로그인 버튼 */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button
          variant="outlined"
          startIcon={
            <Box
              component="img"
              src="/src/assets/images/naver.png"
              sx={{ width: 20, height: 20 }}
            />
          }
          sx={{
            flex: 1,
            mr: 1,
            color: "#a7a7a7", // 텍스트 색상
            borderColor: "#a7a7a7", // 테두리 색상
            "&:hover": {
              color: "white",
              borderColor: "white", // 호버 시에 흰색으로
            },
          }}
        >
          Naver
        </Button>
        <Button
          variant="outlined"
          startIcon={
            <Box
              component="img"
              src="/src/assets/images/google.png"
              sx={{ width: 20, height: 20 }}
            />
          }
          sx={{
            flex: 1,
            mr: 1,
            color: "#a7a7a7", // 텍스트 색상
            borderColor: "#a7a7a7", // 테두리 색상
            "&:hover": {
              color: "white",
              borderColor: "white", // 호버 시에 흰색으로
            },
          }}
        >
          Google
        </Button>
        <Button
          variant="outlined"
          startIcon={
            <Box
              component="img"
              src="/src/assets/images/kakao-talk.png"
              sx={{ width: 20, height: 20 }}
            />
          }
          sx={{
            flex: 1,
            mr: 1,
            color: "#a7a7a7", // 텍스트 색상
            borderColor: "#a7a7a7", // 테두리 색상
            "&:hover": {
              color: "white",
              borderColor: "white", // 호버 시에 흰색으로
            },
          }}
        >
          Kakao
        </Button>
      </Box>

      <Box display="flex" justifyContent="center">
        <Typography>sispyhus가 처음이신가요?</Typography>
        <Link
          sx={{ ml: 1, cursor: "pointer" }}
          onClick={() => navigate("/auth/register")}
          underline="none"
        >
          회원가입
        </Link>
      </Box>
    </Box>
  );
};

export default LoginPage;
