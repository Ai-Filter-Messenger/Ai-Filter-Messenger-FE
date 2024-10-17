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
      // 일반 경로
      path: "/chat",
      element: (
        <DashboardLayout
          leftComponent={withSuspense(ChatPage)} // ChatPage
        />
      ),
    },
    {
      path: "/contacts",
      element: (
        <DashboardLayout
          leftComponent={withSuspense(ContactsPage)} // ContactsPage
        />
      ),
    },
    {
      path: "/search",
      element: (
        <DashboardLayout
          leftComponent={withSuspense(SearchPage)} // SearchPage
          isCustom={true} // MainLayout 커스텀 레이아웃 사용
        />
      ),
    },
    {
      path: "/settings",
      element: (
        <DashboardLayout
          leftComponent={withSuspense(SettingsPage)} // SettingsPage
        />
      ),
    },
    {
      // Auth 하위 페이지
      path: "/auth",
      element: <AuthLayout />, // AuthLayout 사용
      children: [
        { path: "login", element: withSuspense(LoginPage) },
        { path: "register", element: withSuspense(RegisterPage) },
        { path: "find-id", element: withSuspense(FindIdPage) },
        { path: "find-password", element: withSuspense(FindPasswordPage) },
        { path: "reset-password", element: withSuspense(ResetPasswordPage) },
      ],
    },
    { path: "*", element: <Navigate to="/auth/login" replace /> }, // 기본적으로 /chat으로 리디렉션
  ]);
}
