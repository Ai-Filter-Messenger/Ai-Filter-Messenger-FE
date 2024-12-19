import { FaEnvelope, FaAddressBook, FaSearch, FaMoon } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";
import { store } from "@/redux/store";

// 사이드바에 들어갈 아이콘 리스트
const getNavButtons = () => {
  const state = store.getState();
  const loginId = state.auth?.user?.loginId || "defaultLoginId";
  console.log("Current Redux State:", store.getState());

  return [
    {
      index: 0,
      icon: <FaEnvelope />, // message
      title: "message",
      path: `/chat/${loginId}`, // chat 경로에 loginId 동적 반영
    },
    {
      index: 1,
      icon: <FaAddressBook />, // contacts
      title: "contacts",
      path: "/contacts", // contacts 경로
    },
    {
      index: 2,
      icon: <FaSearch />, // search
      title: "search",
      path: "/search", // search 경로
    },
    {
      index: 3,
      icon: <FaGear />, // settings
      title: "settings",
      path: "/settings", // settings 경로
    },
    {
      index: 4,
      icon: <FaMoon />, // light/dark mode switch
      title: "mode",
      action: "toggleMode", // 라이트/다크 모드 전환 (경로 대신 액션)
    },
    {
      index: 5,
      icon: <MdLogout />, // logout
      title: "logout",
      action: "logout", // 로그아웃 (경로 대신 액션)
    },
  ];
};

const Nav_Buttons = getNavButtons();

export { Nav_Buttons };
