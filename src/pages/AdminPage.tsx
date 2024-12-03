import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
} from "@mui/material";
import axios from "@/utils/axios";

const AdminPage: React.FC = () => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get("/file/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (Array.isArray(response.data)) {
          setFileList(response.data);
        } else {
          setError("API 응답 데이터가 올바르지 않습니다.");
          setFileList([]);
        }
      } catch (err) {
        setError("파일 목록을 가져오지 못했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  return (
    <Box display="flex" width="100%">
      <Box flex={4} p={10}>
        <Typography variant="h1" mb={2}>
          All Files
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                  File Name
                </TableCell>
                <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                  Uploaded
                </TableCell>
                <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                  File Size
                </TableCell>
                <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                  Uploader
                </TableCell>
                <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                  Info
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fileList.map((file, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ fontSize: "0.9rem" }}>
                    {file.fileUrl || "URL 없음"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.9rem" }}>
                    {file.createAt
                      ? `${new Date(file.createAt).toLocaleDateString()} ${new Date(
                          file.createAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : "업로드 시간 없음"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.9rem" }}>
                    {file.fileSize ? `${file.fileSize} KB` : "크기 없음"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "1rem" }}>
                    {file.nickname || "업로더 없음"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "1rem" }}>
                    {file.reported ? "비정상" : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </Box>
  );
};

export default AdminPage;
