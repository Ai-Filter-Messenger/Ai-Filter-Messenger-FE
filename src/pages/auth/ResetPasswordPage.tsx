import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("비밀번호 재설정 시도", { password, confirmPassword });
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <TextField
          label="새 비밀번호"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="비밀번호 확인"
          type="password"
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" fullWidth>
          비밀번호 재설정
        </Button>
      </form>
    </Box>
  );
};

export default ResetPasswordPage;
