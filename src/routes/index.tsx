import { lazy, Suspense } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/dashboard";
import AuthLayout from "../layouts/auth"; // Auth 레이아웃 추가
import React from "react";

// ErrorBoundary 컴포넌트 정의
class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error occurred:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}

// 컴포넌트 로딩 스크린
const LoadingScreen = () => <div>Loading...</div>;

// Lazy 로딩으로 페이지 컴포넌트 불러오기
const ChatPage = lazy(() => import("../pages/chat/ChatPage"));
const ContactsPage = lazy(() => import("../pages/contacts/ContactsPage"));
const SearchPage = lazy(() => import("../pages/search/SearchPage"));
const SettingsPage = lazy(() => import("../pages/settings/SettingsPage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const FindIdPage = lazy(() => import("../pages/auth/FindIdPage"));
const FindPasswordPage = lazy(() => import("../pages/auth/FindPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage"));

// Suspense로 각 페이지를 감싸는 함수
const withSuspense = (Component: React.ComponentType) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingScreen />}>
      <Component />
    </Suspense>
  </ErrorBoundary>
);

export default function Router() {
  return useRoutes([
    {
      // 유저의 기본 채팅 페이지
      path: "/chat/:loginId",
      element: (
        <DashboardLayout
          leftComponent={withSuspense(ChatPage)} // ChatPage의 좌측 컴포넌트 (채팅 목록)
        />
      ),
    },
    {
      // 특정 채팅방 페이지
      path: "/chat/:loginId/:chatRoomId", // URL에 chatRoomId 추가
      // path: "/chat/:chatRoomId/:loginId", // URL에 chatRoomId 추가
      element: (
        <DashboardLayout
          leftComponent={withSuspense(ChatPage)} // ChatLists 렌더링
        />
      ),
    },
    {
      // 연락처 페이지
      path: "/contacts",
      element: (
        <DashboardLayout
          leftComponent={withSuspense(ContactsPage)} // ContactsPage 렌더링
        />
      ),
    },
    {
      // 검색 페이지
      path: "/search",
      element: (
        <DashboardLayout
          leftComponent={withSuspense(SearchPage)} // SearchPage 렌더링
          isCustom={true} // SearchPage에서 커스텀 레이아웃 사용
        />
      ),
    },
    {
      // 설정 페이지
      path: "/settings",
      element: (
        <DashboardLayout
          leftComponent={withSuspense(SettingsPage)} // SettingsPage 렌더링
        />
      ),
    },
    {
      // Auth 관련 페이지 경로
      path: "/auth",
      element: <AuthLayout />, // AuthLayout 적용
      children: [
        { path: "login", element: withSuspense(LoginPage) }, // 로그인 페이지
        { path: "register", element: withSuspense(RegisterPage) }, // 회원가입 페이지
        { path: "find-id", element: withSuspense(FindIdPage) }, // 아이디 찾기
        { path: "find-password", element: withSuspense(FindPasswordPage) }, // 비밀번호 찾기
        { path: "reset-password", element: withSuspense(ResetPasswordPage) }, // 비밀번호 재설정
      ],
    },
    // 로그인 페이지로 리디렉션
    { path: "*", element: <Navigate to="/auth/login" replace /> },
  ]);
}
