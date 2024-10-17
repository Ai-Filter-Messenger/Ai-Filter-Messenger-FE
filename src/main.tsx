// 브라우저 환경에서 global 변수가 정의되지 않은 경우 window를 사용하여 매핑
if (typeof global === "undefined") {
  (global as any) = window;
}

import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material"; // MUI의 기본 CSS 리셋
import App from "./App";
import theme from "./theme"; // MUI 테마 설정

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* 브라우저 스타일을 초기화 */}
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}
