import React, { useState } from "react";
import MainLayout from "@/layouts/main";
import Contacts from "@/components/contacts/Contacts";
import UserProfile from "@/components/user/UserProfile";

interface User {
  id: number;
  loginId: string;
  email: string;
  nickname: string;
  name: string;
  profileImageUrl: string;
  state: string;
  userRole: string;
}

const ContactsPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  return (
    <MainLayout
      leftComponent={<Contacts onSelectUser={handleUserSelect} />}
      centerComponent={
        selectedUser ? (
          <UserProfile userId={selectedUser.id} />
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
