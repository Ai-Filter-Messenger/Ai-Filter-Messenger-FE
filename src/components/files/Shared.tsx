import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Badge,
} from "@mui/material";
import { FaPhotoFilm, FaRegFolder, FaBoxArchive } from "react-icons/fa6";
import axios from "@/utils/axios";

interface SharedProps {
  chatRoomId: string;
  refreshTrigger?: number; // 새로고침 트리거
}

interface SharedFile {
  nickname: string;
  fileUrl: string;
  createAt: string;
  fileSize: number;
  reported: boolean;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "오후" : "오전";
  const formattedHours = hours > 12 ? hours - 12 : hours;
  return `${year}.${month}.${day}. ${ampm} ${formattedHours}:${minutes}`;
};

const Shared: React.FC<SharedProps> = ({ chatRoomId, refreshTrigger }) => {
  const [photosAndVideos, setPhotosAndVideos] = useState<SharedFile[]>([]);
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [previewFileInfo, setPreviewFileInfo] = useState<SharedFile | null>(
    null
  );

  const fetchSharedFiles = async () => {
    try {
      const response = await axios.get("/file/chatroom/find", {
        params: { chatRoomId },
      });
      const sharedFiles: SharedFile[] = response.data;

      // 불법 파일은 표시하지 않도록 필터링
      const validFiles = sharedFiles.filter((file) => !file.reported);

      setPhotosAndVideos(
        validFiles.filter((file) =>
          /\.(jpg|jpeg|png|gif|mp4|mov|avi)$/i.test(file.fileUrl)
        )
      );
      setFiles(
        validFiles.filter(
          (file) => !/.(jpg|jpeg|png|gif|mp4|mov|avi)$/i.test(file.fileUrl)
        )
      );
    } catch (error) {
      console.error("Failed to fetch shared files:", error);
    }
  };

  // chatRoomId 또는 refreshTrigger 변경 시 파일 목록 갱신
  useEffect(() => {
    if (chatRoomId) fetchSharedFiles();
  }, [chatRoomId, refreshTrigger]);

  const handlePreview = (file: SharedFile) => {
    const fileExtension = file.fileUrl.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(fileExtension || "")) {
      setPreviewType("image");
    } else if (["mp4", "mov", "avi"].includes(fileExtension || "")) {
      setPreviewType("video");
    } else {
      setPreviewType(null);
    }
    setPreviewUrl(file.fileUrl);
    setPreviewFileInfo(file);
  };

  const handleClosePreview = () => {
    setPreviewUrl(null);
    setPreviewType(null);
    setPreviewFileInfo(null);
  };

  return (
    <Box sx={styles.container}>
      <Box sx={styles.titleContainer}>
        <FaBoxArchive style={styles.titleIcon as React.CSSProperties} />
        <Typography variant="h1" sx={styles.title}>
          Shared Files
        </Typography>
      </Box>

      {/* Photos and Videos */}
      <ListItem sx={styles.listItem}>
        <Box sx={styles.iconBackground}>
          <FaPhotoFilm style={styles.icon as React.CSSProperties} />
        </Box>
        <ListItemText
          primary={`Photos and Videos (${photosAndVideos.length})`}
          sx={styles.listText}
        />
      </ListItem>
      <Box sx={styles.mediaContainer}>
        {photosAndVideos.map((file) => (
          <Box
            key={file.fileUrl}
            sx={styles.mediaItem}
            onClick={() => handlePreview(file)}
          >
            {file.fileUrl.toLowerCase().endsWith("mp4") ? (
              <video
                src={file.fileUrl}
                controls
                style={{
                  ...styles.mediaPreview,
                  objectFit: "cover" as const,
                }}
              />
            ) : (
              <img
                src={file.fileUrl}
                alt={file.nickname}
                style={{
                  ...styles.mediaPreview,
                  objectFit: "cover" as const,
                }}
              />
            )}
          </Box>
        ))}
      </Box>

      {/* Files */}
      <ListItem sx={styles.listItem}>
        <Box sx={styles.iconBackground}>
          <FaRegFolder style={styles.icon as React.CSSProperties} />
        </Box>
        <ListItemText
          primary={`Files (${files.length})`}
          sx={styles.listText}
        />
      </ListItem>
      <List>
        {files.map((file) => (
          <ListItem
            key={file.fileUrl}
            sx={{ ...styles.listItem, marginLeft: "2rem" }}
          >
            <ListItemText
              primary={file.fileUrl.split("/").pop()}
              secondary={`Uploaded by: ${file.nickname}`}
              sx={styles.fileText}
            />
          </ListItem>
        ))}
      </List>

      {/* Overlay */}
      {previewUrl && (
        <Box sx={styles.overlay} onClick={handleClosePreview}>
          <Box
            sx={styles.previewContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography sx={styles.nickname}>
              {previewFileInfo?.nickname || "Unknown"}
            </Typography>
            <Typography sx={styles.date}>
              {formatDate(previewFileInfo?.createAt || "")}
            </Typography>
            {previewType === "image" && (
              <img src={previewUrl} alt="Preview" style={styles.previewMedia} />
            )}
            {previewType === "video" && (
              <video
                src={previewUrl}
                controls
                style={{
                  ...styles.previewMedia,
                  objectFit: "cover" as const,
                }}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

const styles = {
  container: {
    backgroundColor: "#1f1f1f",
    borderRadius: "8px",
    padding: "2rem",
    maxWidth: "100%",
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1rem",
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
    marginLeft: "0.75rem",
  },
  title: {
    marginLeft: "1rem",
    fontWeight: "bold",
    color: "#fff",
  },
  mediaContainer: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "1rem",
  },
  mediaItem: {
    width: "100px",
    height: "100px",
    overflow: "hidden",
    borderRadius: "8px",
    cursor: "pointer",
  },
  mediaPreview: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.75rem 0rem",
    borderRadius: "8px",
    marginTop: "2rem",
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
  fileText: {
    color: "#aaa",
  },
  previewContainer: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    backgroundColor: "#2b2b2b",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    maxWidth: "400px",
  },
  nickname: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: "0.5rem",
  },
  date: {
    fontSize: "1rem",
    color: "#cccccc",
    marginBottom: "1rem",
  },
  previewMedia: {
    // borderRadius: "12px",
    maxWidth: "100%",
    maxHeight: "300px",
    objectFit: "cover" as "cover",
  },
};

export default Shared;
