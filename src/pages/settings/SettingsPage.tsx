import React from "react";
import MainLayout from "@/layouts/main";
import ProfileEdit from "@/components/user/ProfileEdit";
import Account from "@/components/user/\bAccount";
import { Typography } from "@mui/material";

const SettingsPage = () => {
  return (
    <MainLayout
      leftComponent={
        <Typography variant="h1" sx={styles.title}>
          settings
        </Typography>
      }
      centerComponent={
        <>
          <Typography variant="h1" sx={styles.title}>
            Profile
          </Typography>
          <ProfileEdit />
          <Typography variant="h1" sx={styles.title}>
            Account
          </Typography>
          <Account />
        </>
      }
      rightComponent={<></>}
    />
  );
};

const styles = {
  title: {
    marginTop: "1rem",
    marginBottom: "1rem",
    padding: "1rem", // 패딩 추가
    fontWeight: "bold",
    color: "#fff",
  },
};

export default SettingsPage;
