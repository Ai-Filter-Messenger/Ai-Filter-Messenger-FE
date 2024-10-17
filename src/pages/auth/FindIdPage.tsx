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
  const [email, setEmail] = useState<string>("");
  const [authNumber, setAuthNumber] = useState<string>("");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { emailVerificationCode, error, isEmailVerified } = useSelector(
    (state: RootState) => state.auth
  );

  const handleSendCode = () => {
    dispatch(SendEmailVerification(email));
  };

  const handleVerifyCode = () => {
    if (emailVerificationCode) {
      dispatch(VerifyEmail(emailVerificationCode, authNumber));
    }
  };

  const handleFindId = () => {
    if (isEmailVerified) {
      dispatch(FindIdByEmail(email, authNumber));
    }
  };

  return (
    <Box width="100%">
      <Typography variant="h3" textAlign="left" mb={4} fontWeight="medium">
        아이디 찾기
      </Typography>
      <form>
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

        {emailVerificationCode && (
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
        {error && (
          <Typography color="error" align="center" mt={2}>
            {error}
          </Typography>
        )}
      </form>

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
