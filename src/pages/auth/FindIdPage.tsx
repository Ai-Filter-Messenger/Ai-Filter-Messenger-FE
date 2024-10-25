import React, { useState } from "react";
import { TextField, Button, Box, Typography, Link } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  SendEmailVerification,
  FindIdByEmail,
  VerifyEmail,
} from "@/redux/slices/auth";
import { useNavigate } from "react-router-dom";

const FindIdPage: React.FC = () => {
  const [email, setEmail] = useState<string>(""); // 이메일 입력 상태
  const [authNumber, setAuthNumber] = useState<string>(""); // 인증 코드 입력 상태
  const [emailSent, setEmailSent] = useState<boolean>(false); // 이메일 발송 상태
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { error, isEmailVerified, foundLoginId } = useSelector(
    (state: RootState) => state.auth
  );

  // 인증 코드 발송
  const handleSendCode = async () => {
    await dispatch(SendEmailVerification(email));
    setEmailSent(true); // 이메일 발송 후에 emailSent를 true로 설정하여 인증 코드 입력칸이 나타나도록
  };

  // 인증 코드 검증
  const handleVerifyCode = () => {
    const parsedAuthNumber = parseInt(authNumber, 10); // 숫자로 변환
    dispatch(VerifyEmail(email, "confirm", parsedAuthNumber));
  };

  // 아이디 찾기 요청
  const handleFindId = () => {
    if (isEmailVerified) {
      dispatch(FindIdByEmail(email, authNumber));
    } else {
      alert("이메일 인증을 완료해주세요.");
    }
  };

  return (
    <Box width="100%">
      <Typography variant="h3" textAlign="left" mb={4} fontWeight="medium">
        아이디 찾기
      </Typography>
      <form>
        {/* 이메일 입력 필드 */}
        <TextField
          fullWidth
          label="이메일"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleSendCode}
          sx={{ mb: 2 }}
        >
          인증 코드 받기
        </Button>

        {/* 인증 코드 입력 필드 (이메일 발송 후에만 표시) */}
        {emailSent && (
          <>
            <TextField
              fullWidth
              label="인증 코드"
              variant="outlined"
              value={authNumber}
              onChange={(e) => setAuthNumber(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleVerifyCode}
              sx={{ mb: 2 }}
            >
              인증 확인
            </Button>
          </>
        )}

        {/* 이메일 인증 완료 후 아이디 찾기 버튼 표시 */}
        {isEmailVerified && (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleFindId}
          >
            아이디 찾기
          </Button>
        )}

        {/* 반환받은 아이디 출력 */}
        {foundLoginId && (
          <Typography
            variant="h6"
            textAlign="center"
            color="primary"
            sx={{ mt: 2 }}
          >
            찾은 아이디: {foundLoginId}
          </Typography>
        )}

        {/* 에러 메시지 표시 */}
        {error && (
          <Typography color="error" align="center" mt={2}>
            {error}
          </Typography>
        )}
      </form>

      {/* 로그인 페이지로 돌아가기 링크 */}
      <Typography textAlign="center" variant="body2" mt={2}>
        <Link
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/auth/login")}
          underline="none"
        >
          로그인 페이지로 돌아가기
        </Link>
      </Typography>
    </Box>
  );
};

export default FindIdPage;
