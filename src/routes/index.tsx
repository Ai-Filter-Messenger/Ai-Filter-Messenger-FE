import { lazy, Suspense, ComponentType } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/dashboard";

// 컴포넌트 로딩 스크린
const LoadingScreen = () => <div>Loading...</div>;

// Lazy 로딩으로 페이지 컴포넌트 불러오기
const ChatPage = lazy(() => import("../pages/chat/ChatPage"));
const ContactsPage = lazy(() => import("../pages/contacts/ContactsPage"));
const SearchPage = lazy(() => import("../pages/search/SearchPage"));

// Loadable 함수에 ComponentType을 사용하여 명시적으로 타입 지정
const Loadable = (Component: ComponentType<any>) => (props: any) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component {...props} />
  </Suspense>
);

export default function Router() {
  return useRoutes([
    {
      path: "/chat",
      element: (
        <DashboardLayout
          leftComponent={<ChatPage />} // ChatPage. Left, Center, Right 컴포넌트를 분리 렌더링
        />
      ),
    },
    {
      path: "/contacts",
      element: (
        <DashboardLayout
          leftComponent={<ContactsPage />} // ContactsPage. Left에 Contacts 렌더링
        />
      ),
    },
    {
      path: "/search",
      element: (
        <DashboardLayout
          leftComponent={<SearchPage />} // SearchPage. Center, Right 병합
          isCustom={true} // MainLayout 커스텀 레이아웃 사용
        />
      ),
    },
    { path: "*", element: <Navigate to="/chat" replace /> }, // 기본적으로 /chat으로 리디렉션
  ]);
}
