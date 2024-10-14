import React from "react";
import MainLayout from "@/layouts/main";
import ProfileEdit from "@/components/user/ProfileEdit";
import Account from "@/components/user/\bAccount";

const SettingsPage = () => {
  return (
    <MainLayout
      leftComponent={<h1>Settings</h1>} // 왼쪽: "Settings" 타이틀만 표시
      centerComponent={
        <>
          <ProfileEdit /> {/* 유저 프로필 편집 컴포넌트 */}
          <Account /> {/* 계정 정보 컴포넌트 */}
        </>
      }
      rightComponent={<></>}
    />
  );
};

export default SettingsPage;
