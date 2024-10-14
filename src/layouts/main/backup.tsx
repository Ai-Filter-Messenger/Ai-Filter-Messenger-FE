import React from "react";
import { Box, useTheme } from "@mui/material";

interface MainLayoutProps {
  leftComponent?: JSX.Element;
  centerComponent?: JSX.Element | undefined;
  rightComponent?: JSX.Element | undefined;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  leftComponent,
  centerComponent,
  rightComponent,
}) => {
  const theme = useTheme();

  return (
    <Box display="flex" height="100vh" width="100vw">
      {/* 왼쪽 컴포넌트 */}
      <Box
        sx={{
          //   width: "18.75rem",
          //   width: "300px",
          flexGrow: 1, // 전체 너비의 20% 정도 차지하도록 설정
          flexBasis: "20%",
          borderRight: "1px solid #ddd",
          backgroundColor: theme.palette.background.left,
        }}
      >
        {leftComponent} {/* 왼쪽 부분 */}
      </Box>

      {/* 중앙 컴포넌트 */}
      <Box
        sx={{
          //   width: "68.75rem",
          //   width: "1100px",
          flexGrow: 1, // 전체 너비의 60% 정도 차지하도록 설정
          flexBasis: "60%",
          borderRight: "1px solid #ddd",
          backgroundColor: theme.palette.background.left,
        }}
      >
        {centerComponent} {/* 중앙 부분 */}
      </Box>

      {/* 오른쪽 컴포넌트 */}
      <Box
        sx={{
          //   width: "25rem",
          //   width: "400px",
          flexGrow: 1, // 전체 너비의 20% 정도 차지하도록 설정
          flexBasis: "30%",
          backgroundColor: theme.palette.background.right,
        }}
      >
        {rightComponent} {/* 오른쪽 부분 */}
      </Box>
    </Box>
  );
};

export default MainLayout;
