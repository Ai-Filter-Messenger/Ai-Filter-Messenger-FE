import { PaletteOptions } from "@mui/material/styles";

const palette: PaletteOptions = {
  mode: "dark", // 다크 모드
  primary: {
    main: "#6D25FF", // 메시지 버튼 색상
    light: "#1F2933", // 기본 배경
    dark: "#121212", // 전반적인 배경색과 유사
    contrastText: "#ffffff", // 텍스트는 밝은 색상
  },
  background: {
    default: "#121212", // 메인 배경
    // paper: "#1C1C1F", // 카드형 UI 배경 (사이드바 및 오른쪽 컴포넌트)
    paper: "#1f1f1f", // 카드형 UI 배경 (사이드바 및 오른쪽 컴포넌트)
    // left: "#212328", // MainLayout 왼쪽과 중앙의 배경색
    left: "#252525", // MainLayout 왼쪽과 중앙의 배경색
    // right: "#1C1C1F", // MainLayout 오른쪽 배경색
    right: "#1f1f1f", // MainLayout 오른쪽 배경색
  },
  text: {
    primary: "#ffffff", // 일반 텍스트
    secondary: "#828282", // 부가 텍스트
    disabled: "#616161", // 비활성화된 요소 텍스트
  },
  action: {
    active: "#ffffff", // 액티브 상태 흰색
    disabled: "#A9AEBA", // 비활성화 상태 A9AEBA
    hover: "#616161", // 호버 상태 색상
    disabledBackground: "#3a3a3a", // 비활성화된 버튼 배경
  },
  divider: "#424242", // 구분선
};

export default palette;
