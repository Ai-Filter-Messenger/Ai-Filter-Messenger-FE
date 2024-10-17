import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Box, Link } from "@mui/material";

const AuthLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      justifyContent="flex-end" // Align to the right
      minHeight="100vh"
      sx={{ bgcolor: "#121212", color: "white", position: "relative" }}
    >
      {/* Header with links */}
      <Box
        display="flex"
        justifyContent="flex-end"
        width="100%"
        marginRight="5%"
        padding="2rem"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
      >
        <Link
          onClick={() => navigate("/auth/find-id")}
          sx={{ color: "#a7a7a7", cursor: "pointer", marginRight: "1.5rem" }}
          underline="none"
        >
          아이디 찾기
        </Link>
        <Link
          onClick={() => navigate("/auth/find-password")}
          sx={{ color: "#a7a7a7", cursor: "pointer" }}
          underline="none"
        >
          비밀번호 찾기
        </Link>
      </Box>

      {/* Content Container */}
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="flex-start"
        width="100%"
        maxWidth="500px"
        marginRight="5%"
        paddingTop="3rem"
      >
        {/* Main content rendered here */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          width="100%"
          maxWidth="350px"
          //   marginTop="2rem"
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
