import React, { useState } from "react";
import MainLayout from "@/layouts/main";
import Contacts from "@/components/contacts/Contacts";
import UserProfile from "@/components/user/UserProfile";

const ContactsPage: React.FC = () => {
  const [selectedNickname, setSelectedNickname] = useState<string | null>(null);

  const handleUserSelect = (nickname: string) => {
    setSelectedNickname(nickname); // 닉네임 저장
  };

  return (
    <MainLayout
      leftComponent={<Contacts onSelectUser={handleUserSelect} />}
      centerComponent={
        selectedNickname ? (
          <UserProfile nickname={selectedNickname} /> // 닉네임 전달
        ) : (
          <p style={{ color: "#fff", textAlign: "center", marginTop: "1rem" }}>
            연락처를 선택해주세요.
          </p>
        )
      }
      rightComponent={<></>}
    />
  );
};

export default ContactsPage;
