import React from "react";
import MainLayout from "@/layouts/main";
import AllFiles from "@/components/files/AllFiles";

const AdminPage: React.FC = () => {
  return (
    <MainLayout
      leftComponent={<></>}
      centerComponent={<AllFiles />}
      rightComponent={<></>}
    />
  );
};

export default AdminPage;
