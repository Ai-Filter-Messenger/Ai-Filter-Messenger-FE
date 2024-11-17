import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
} from "@mui/material";
import { FaPhotoFilm, FaRegFolder, FaBoxArchive } from "react-icons/fa6";

interface SharedProps {
  chatRoomId: string;
}

const Shared: React.FC<SharedProps> = ({ chatRoomId }) => {
  return (
    <Box sx={styles.container}>
      {/* Shared Files Title */}
      <Box sx={styles.titleContainer}>
        <FaBoxArchive style={styles.titleIcon as React.CSSProperties} />
        <Typography variant="h1" sx={styles.title}>
          Shared Files
        </Typography>
      </Box>

      {/* Photos and Videos */}
      <List>
        <ListItem sx={styles.listItem}>
          <Box sx={styles.iconBackground}>
            <FaPhotoFilm style={styles.icon as React.CSSProperties} />
          </Box>
          <ListItemText primary="Photos and Videos" sx={styles.listText} />
          <Badge badgeContent={105} color="primary" sx={styles.badge} />
        </ListItem>

        {/* Files */}
        <ListItem sx={styles.listItem}>
          <Box sx={styles.iconBackground}>
            <FaRegFolder style={styles.icon as React.CSSProperties} />
          </Box>
          <ListItemText primary="Files" sx={styles.listText} />
          <Badge badgeContent={105} color="primary" sx={styles.badge} />
        </ListItem>
      </List>
    </Box>
  );
};

const styles = {
  container: {
    backgroundColor: "#1f1f1f",
    borderRadius: "8px",
    padding: "1rem",
    maxWidth: "100%", // 화면 가로를 넘지 않도록 설정
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1rem",
    marginLeft: "2rem",
  },
  iconBackground: {
    backgroundColor: "#333",
    borderRadius: "1rem",
    width: "3rem",
    height: "3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  titleIcon: {
    color: "#fff",
    fontSize: "1.5rem",
  },
  title: {
    marginLeft: "1rem",
    marginTop: "1rem",
    marginBottom: "1rem",
    fontWeight: "bold",
    color: "#fff",
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    marginLeft: "1rem",
    marginBottom: "1rem",
    "&:hover": {
      backgroundColor: "#333",
    },
  },
  icon: {
    color: "#fff",
    fontSize: "1.5rem",
  },
  listText: {
    color: "#fff",
    fontWeight: "bold",
  },
  badge: {
    "& .MuiBadge-badge": {
      backgroundColor: "#4e4ef7",
      color: "#fff",
    },
  },
};

export default Shared;
