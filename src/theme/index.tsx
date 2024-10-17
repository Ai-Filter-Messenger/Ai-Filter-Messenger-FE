// theme/index.tsx
import { createTheme } from "@mui/material/styles";
import palette from "./palette";

const theme = createTheme({
  palette,
  typography: {
    fontFamily: "M PLUS Rounded 1c, sans-serif", // 기본 폰트
    h1: {
      fontFamily: "M PLUS Rounded 1c, sans-serif",
      fontWeight: 700,
      fontSize: "1.5rem",
    },
    h2: {
      fontFamily: "M PLUS Rounded 1c, sans-serif",
      fontWeight: 700,
      fontSize: "1.1rem",
    },
    h3: {
      fontFamily: "M PLUS Rounded 1c, sans-serif",
      fontWeight: 500,
      fontSize: "1.8rem",
    },
    h4: {
      fontFamily: "M PLUS Rounded 1c, sans-serif",
      fontWeight: 700,
      fontSize: "0.75rem",
    },
    body1: {
      fontFamily: "M PLUS Rounded 1c, sans-serif",
      fontSize: "1rem", // 16px
      lineHeight: 1.5,
    },
    body2: {
      fontFamily: "M PLUS Rounded 1c, sans-serif",
      fontSize: "0.875rem", // 14px
      lineHeight: 1.43,
    },
    button: {
      textTransform: "none", // 버튼의 텍스트를 소문자로 유지
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px", // 버튼의 둥근 모서리
          padding: "8px 16px", // 버튼 패딩
        },
      },
    },
  },
});

export default theme;
