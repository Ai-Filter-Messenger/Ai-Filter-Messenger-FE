import { Box, Stack, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Logo from "../../assets/images/logo.png";
import { Nav_Buttons } from "../../data";
import MainLayout from "../main";
import React from "react";

const DashboardLayout = ({
  leftComponent,
  centerComponent,
  rightComponent,
}: any) => {
  const theme = useTheme();
  const [selected, setSelected] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (el: any) => {
    if (el.path) {
      navigate(el.path); // path가 있는 경우에만 navigate 호출
    } else if (el.action === "toggleMode") {
      // 라이트/다크 모드 전환 처리
      console.log("Toggle light/dark mode");
    } else if (el.action === "logout") {
      // 로그아웃 처리
      console.log("Logging out...");
    }
  };

  // 사이드바 상단에 있는 일반 버튼과 하단에 있는 특수 버튼을 분리
  const topNavButtons = Nav_Buttons.filter(
    (el: any) => el.action !== "toggleMode" && el.action !== "logout"
  );
  const bottomNavButtons = Nav_Buttons.filter(
    (el: any) => el.action === "toggleMode" || el.action === "logout"
  );

  return (
    <Box display="flex" height="100vh">
      {/* 사이드바 */}
      <Box
        p={2}
        sx={{
          backgroundColor: theme.palette.background.paper, // 사이드바 배경색 적용
          height: "100vh",
          width: 80, // 사이드바 너비 조정
          paddingTop: "30px",
          borderTopRightRadius: "20px",
          borderBottomRightRadius: "20px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between", // 상단과 하단 구분
        }}
      >
        <Stack direction="column" alignItems="center" spacing={3}>
          {/* 로고 */}
          <Box
            sx={{
              height: 45,
              width: 45,
              borderRadius: 1.5,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={Logo}
              alt="Chat App Logo"
              style={{ height: "80%", objectFit: "cover" }}
            />
          </Box>

          {/* 네비게이션 버튼 */}
          <Stack
            sx={{
              width: "100%",
              paddingTop: "200px",
            }}
            direction="column"
            alignItems="center"
            spacing={2} // 버튼 간 간격 조정
          >
            {topNavButtons.map((el, index) => (
              <IconButton
                key={index}
                sx={{
                  color:
                    selected === el.index
                      ? theme.palette.action.active // 액티브 상태
                      : theme.palette.action.disabled, // 비활성화 상태
                  padding: "10px",
                }}
                onClick={() => {
                  setSelected(el.index);
                  handleNavigation(el);
                }}
              >
                {el.icon}
              </IconButton>
            ))}
          </Stack>
        </Stack>

        {/* 하단 네비게이션 버튼 (mode, logout) */}
        <Stack
          direction="column"
          alignItems="center"
          spacing={1}
          sx={{ paddingBottom: "20px" }}
        >
          {bottomNavButtons.map((el, index) => (
            <IconButton
              key={index}
              sx={{
                color:
                  selected === el.index
                    ? theme.palette.action.active // mode와 logout의 액티브 상태 색상
                    : theme.palette.action.disabled, // 비활성화 상태 색상
              }}
              onClick={() => handleNavigation(el)}
            >
              {React.cloneElement(el.icon, {
                fontSize: el.action === "toggleMode" ? "medium" : "extra-large", // mode는 medium, logout은 extra-large
              })}
            </IconButton>
          ))}
        </Stack>
      </Box>

      {/* 나머지 화면 구성 */}
      <Box display="flex" flexDirection="column" flexGrow={1}>
        <Box display="flex" flexGrow={1}>
          {/* 왼쪽 컴포넌트 */}
          <Box>{leftComponent}</Box>

          {/* 중앙 컴포넌트 */}
          <Box>{centerComponent}</Box>

          {/* 오른쪽 컴포넌트 */}
          <Box>{rightComponent}</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
