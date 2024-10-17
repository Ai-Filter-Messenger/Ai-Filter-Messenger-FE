import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CheckLoginId,
  RegisterUser,
  SendEmailVerification,
  VerifyEmail,
} from "@/redux/slices/auth"; // Redux 액션 가져오기
import { AppDispatch, RootState } from "@/redux/store"; // RootState 가져오기
import {
  Button,
  TextField,
  Typography,
  Box,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const RegisterPage: React.FC = () => {
  const [loginId, setLoginId] = useState<string>("");
  const [emailUser, setEmailUser] = useState<string>("");
  const [emailDomain, setEmailDomain] = useState<string>("gmail.com");
  const emailDomains = ["gmail.com", "naver.com", "kakao.com"];
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [authCode, setAuthCode] = useState<string>("");
  const [hidePassword, setHidePassword] = useState<boolean>(true);

  // useDispatch를 사용할 때 AppDispatch 타입 적용
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const authState = useSelector((state: RootState) => state.auth);
  const { error, emailVerificationCode, isEmailVerified, isLoading } =
    authState;

  // 아이디 중복 확인
  const handleCheckLoginId = () => {
    dispatch(CheckLoginId(loginId));
  };

  // 이메일 인증 코드 요청
  const handleSendCode = () => {
    const email = `${emailUser}@${emailDomain}`;
    dispatch(SendEmailVerification(email));
  };

  // 이메일 인증 코드 검증
  const handleVerifyCode = () => {
    if (emailVerificationCode) {
      dispatch(VerifyEmail(emailVerificationCode, authCode));
    }
  };

  // 회원가입 처리
  const handleRegister = () => {
    const email = `${emailUser}@${emailDomain}`;
    const user = { loginId, email, password, name, nickname };
    dispatch(RegisterUser(user, navigate));
  };

  // 비밀번호 표시/숨기기 토글
  const togglePasswordVisibility = () => {
    setHidePassword(!hidePassword);
  };

  return (
    <Box width="100%" margin="auto">
      <Typography variant="h3" textAlign="left" mb={4}>
        Create Account
      </Typography>

      {/* 아이디 입력 및 중복 확인 */}
      <Box display="flex" alignItems="center" mb={2}>
        <TextField
          fullWidth
          label="아이디"
          variant="outlined"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          sx={{ flex: 3, mr: 2 }} // 아이디 필드 크기 조정
        />
        <Button
          variant="outlined"
          onClick={handleCheckLoginId}
          disabled={isLoading}
          sx={{ flex: 1, height: "3.55rem" }} // 버튼 크기 조정
        >
          중복확인
        </Button>
      </Box>

      {/* 이메일 입력 */}
      <Box display="flex" mb={2}>
        <TextField
          fullWidth
          label="이메일"
          variant="outlined"
          value={emailUser}
          onChange={(e) => setEmailUser(e.target.value)}
          sx={{ flex: 1 }} // 이메일 필드의 너비를 줄이기 위해 flex 속성 사용
        />
        <Typography sx={{ mx: 2, my: 2 }}>@</Typography>
        <FormControl sx={{ flex: 1 }}>
          {" "}
          {/* Select 너비 조정 */}
          <Select
            value={emailDomain}
            onChange={(e) => setEmailDomain(e.target.value)}
          >
            {emailDomains.map((domain) => (
              <MenuItem key={domain} value={domain}>
                {domain}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 비밀번호 입력 */}
      <Box position="relative" mb={2}>
        <TextField
          fullWidth
          type={hidePassword ? "password" : "text"}
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
          onClick={togglePasswordVisibility}
        >
          {hidePassword ? <AiFillEyeInvisible /> : <AiFillEye />}
        </Box>
      </Box>

      {/* 이름 입력 */}
      <TextField
        fullWidth
        label="이름"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* 닉네임 입력 */}
      <TextField
        fullWidth
        label="닉네임"
        variant="outlined"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* 인증 코드 발송 버튼 */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSendCode}
        sx={{ mb: 2 }}
        disabled={isLoading}
      >
        인증 코드 받기
      </Button>

      {/* 인증 코드 입력 및 검증 */}
      {emailVerificationCode && (
        <>
          <TextField
            fullWidth
            label="인증 코드"
            variant="outlined"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleVerifyCode}
            disabled={isEmailVerified}
            sx={{ mb: 2 }}
          >
            인증 코드 검증
          </Button>
        </>
      )}

      {/* 회원가입 버튼 */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleRegister}
        disabled={!isEmailVerified || isLoading}
      >
        회원가입
      </Button>

      {/* 에러 메시지 출력 */}
      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default RegisterPage;
