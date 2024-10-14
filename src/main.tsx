// src/main.tsx
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
