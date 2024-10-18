import React from "react";
import { Box, useTheme } from "@mui/material";

interface MainLayoutProps {
  leftComponent?: JSX.Element;
  centerComponent?: JSX.Element;
  rightComponent?: JSX.Element;
  isCustom?: boolean; // 새로 추가: custom 레이아웃 여부
}

const MainLayout: React.FC<MainLayoutProps> = ({
  leftComponent,
  centerComponent,
  rightComponent,
  isCustom = false, // 기본값 false
}) => {
  const theme = useTheme();

  return (
    <Box display="flex" height="100vh" width="100vw">
      {/* 왼쪽 컴포넌트 */}
      <Box
        sx={{
          flexBasis: "20%",
          backgroundColor: theme.palette.background.left,
        }}
      >
        {leftComponent} {/* 왼쪽 부분 */}
      </Box>

      {/* 중앙 및 오른쪽 컴포넌트 통합 (isCustom이 true일 경우) */}
      {isCustom ? (
        <Box
          sx={{
            flexGrow: 1, // 남은 공간을 모두 차지
            backgroundColor: theme.palette.background.left,
          }}
        >
          {centerComponent} {/* 중앙 및 오른쪽을 합친 부분 */}
        </Box>
      ) : (
        <>
          {/* 중앙 컴포넌트 */}
          <Box
            sx={{
              flexGrow: 1,
              backgroundColor: theme.palette.background.left,
            }}
          >
            {centerComponent} {/* 중앙 부분 */}
          </Box>

          {/* 오른쪽 컴포넌트 */}
          <Box
            sx={{
              flexBasis: "30%",
              backgroundColor: theme.palette.background.right,
            }}
          >
            {rightComponent ?? undefined}{" "}
            {/* 오른쪽 부분, null일 때 undefined로 처리 */}
          </Box>
        </>
      )}
    </Box>
  );
};

export default MainLayout;
