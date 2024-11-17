import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Modal,
  Button,
} from "@mui/material";
import { FaUserPlus, FaEnvelope } from "react-icons/fa";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNavigate } from "react-router-dom";

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

interface ContactsProps {
  onSelectUser: (user: User) => void;
}

const API_BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:8080/api";

const Contacts: React.FC<ContactsProps> = ({ onSelectUser }) => {
  const [contacts, setContacts] = useState<User[]>([]);
  const [followingList, setFollowingList] = useState<User[]>([]); // 타입 명시
  const [filteredContacts, setFilteredContacts] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]); // 타입 명시
  const token = useSelector((state: RootState) => state.auth.token);
  const navigate = useNavigate();

  // 팔로잉 리스트 가져오기
  useEffect(() => {
    const fetchFollowingList = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/user/following/list`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("팔로잉 리스트 응답 데이터:", response.data); // 콘솔 로그 추가
        setFollowingList(response.data);

        // 처음 로드 시 검색 필터에도 추가
        setFilteredContacts(response.data);
      } catch (error) {
        console.error("팔로잉 리스트 가져오기 실패:", error);
      }
    };
    fetchFollowingList();
  }, [token]);

  // 팔로우 가능한 유저 리스트 가져오기
  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(response.data);
    } catch (error) {
      console.error("유저 리스트 가져오기 실패:", error);
    }
  };

  // 검색 기능
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query === "") {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(
        (contact) =>
          contact.nickname.toLowerCase().includes(query.toLowerCase()) ||
          contact.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  };

  // 메시지 버튼 클릭
  const handleMessageClick = async (contact: User) => {
    try {
      // 채팅방 생성 또는 기존 방으로 이동
      const response = await axios.post(
        "/chat/create-or-get",
        { nickname: contact.nickname },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const chatRoomId = response.data.chatRoomId;
      navigate(`/chat/${chatRoomId}`);
    } catch (error) {
      console.error("Failed to open chat:", error);
    }
  };

  // 팔로우/언팔로우 핸들러
  const handleFollowToggle = async (nickname: string, isFollowing: boolean) => {
    try {
      const url = isFollowing ? "/user/unfollow" : "/user/follow";
      await axios.put(
        `${API_BASE_URL}${url}`,
        { nickname },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(isFollowing ? "언팔로우 성공!" : "팔로우 성공!");
      setFollowingList((prev) =>
        isFollowing
          ? prev.filter((user) => user.nickname !== nickname)
          : [...prev, allUsers.find((user) => user.nickname === nickname)!]
      );
    } catch (error) {
      console.error("팔로우/언팔로우 실패:", error);
    }
  };

  // 모달 열기/닫기
  const toggleModal = () => {
    setModalOpen((prev) => !prev);
    if (!isModalOpen) fetchAllUsers(); // 모달 열 때 유저 리스트 가져오기
  };

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={styles.header}>
        <Typography variant="h1" sx={styles.title}>
          Contacts
        </Typography>
        <IconButton>
          <FaUserPlus />
        </IconButton>
      </Box>

      {/* 검색 바
      <TextField
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        sx={styles.searchBar}
        InputProps={{
          startAdornment: (
            <Box sx={{ color: "#aaa", paddingRight: "0.5rem" }}></Box>
          ),
        }}
      /> */}

      {/* 연락처 리스트 */}
      {filteredContacts.map((contact) => (
        <Box key={contact.id} sx={styles.contactItem}>
          <Avatar
            src={contact.profileImageUrl}
            alt={contact.nickname}
            sx={styles.avatar}
          />
          <Box sx={styles.contactDetails}>
            <Typography sx={styles.contactName}>{contact.nickname}</Typography>
            <Typography sx={styles.contactEmail}>{contact.email}</Typography>
          </Box>
          <IconButton onClick={() => handleMessageClick(contact)}>
            <FaEnvelope style={{ fontSize: "1.2rem" }} />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};

const styles = {
  container: {
    padding: "1rem",
    backgroundColor: "#1f1f1f",
    borderRadius: "8px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  title: {
    marginTop: "1rem",
    marginBottom: "1rem",
    padding: "1rem", // 패딩 추가
    fontWeight: "bold",
    color: "#fff",
  },
  searchBar: {
    backgroundColor: "#333",
    borderRadius: "8px",
    marginBottom: "1rem",
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      padding: "0.5rem",
    },
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    padding: "0.75rem 1rem",
    backgroundColor: "#292929",
    borderRadius: "8px",
    marginBottom: "0.5rem",
    "&:hover": {
      backgroundColor: "#333",
    },
  },
  avatar: {
    width: "2rem",
    height: "2rem",
    marginRight: "1rem",
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "bold",
  },
  contactEmail: {
    color: "#aaa",
    fontSize: "0.875rem",
  },
};

export default Contacts;
