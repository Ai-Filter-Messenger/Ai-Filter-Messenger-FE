import React, { useState } from "react";
import MainLayout from "@/layouts/main";
import Contacts from "@/components/contacts/Contacts";
import UserProfile from "@/components/user/UserProfile";

const ContactsPage = () => {
  // 선택된 유저를 저장하는 상태
  const [selectedUser, setSelectedUser] = useState(null);

  // 유저를 선택했을 때 호출되는 함수
  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
  };

  return (
    <MainLayout
      // 왼쪽: 연락처 목록. 사용자가 연락처를 선택하면 handleUserSelect 호출
      leftComponent={<Contacts onSelectUser={handleUserSelect} />}
      // 중앙: 초기에는 비어있고, 유저가 선택되면 UserProfile 렌더링, 선택되지 않은 경우 undefined
      centerComponent={
        selectedUser ? <UserProfile user={selectedUser} /> : undefined
      }
      // 오른쪽: 빈 공간
      rightComponent={<></>}
    />
  );
};

export default ContactsPage;
