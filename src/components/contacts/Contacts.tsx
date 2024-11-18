import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Button,
  Modal,
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
  onSelectUser: (nickname: string) => void; // 닉네임 전달
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
  const [followNickname, setFollowNickname] = useState("");
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

  // const handleMessageClick = async (contact: User) => {
  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/chat/find/list`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     const chatRooms = response.data;
  //     const existingRoom = chatRooms.find((room: any) => {
  //       const participants = room.userInfo.map((user: any) => user.nickname);
  //       const isOneOnOneChat =
  //         participants.length === 2 &&
  //         participants.includes(contact.nickname) &&
  //         participants.includes(localStorage.getItem("nickname") || "");

  //       return isOneOnOneChat;
  //     });

  //     if (existingRoom) {
  //       navigate(`/chat/${existingRoom.chatRoomId}`);
  //     } else {
  //       const createResponse = await axios.post(
  //         `${API_BASE_URL}/chat/create`,
  //         {
  //           type: "GENERAL",
  //           nicknames: [contact.nickname],
  //         },
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );

  //       const newRoomId = createResponse.data.chatRoomId;
  //       navigate(`/chat/${newRoomId}`);
  //     }
  //   } catch (error) {
  //     console.error("Failed to handle message click:", error);
  //   }
  // };

  // 팔로우 핸들러
  const handleFollow = async () => {
    if (!followNickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/user/follow?nickname=${encodeURIComponent(followNickname)}`, // 쿼리스트링으로 전달
        { nickname: followNickname },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("친구 추가가 완료되었습니다!");
      setFollowNickname(""); // 입력 필드 초기화
      setModalOpen(false); // 모달 닫기
    } catch (error) {
      console.error("친구 추가 실패:", error);
      alert("친구 추가에 실패했습니다.");
    }
  };

  // 모달 열기/닫기
  const toggleModal = () => setModalOpen((prev) => !prev);

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={styles.header}>
        <Typography variant="h1" sx={styles.title}>
          Contacts
        </Typography>
        <IconButton onClick={toggleModal}>
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
      {followingList.map((contact) => (
        <Box
          key={contact.id}
          sx={styles.contactItem}
          onClick={() => onSelectUser(contact.nickname)} // 유저 닉네임 전달
        >
          <Avatar
            src={contact.profileImageUrl}
            alt={contact.nickname}
            sx={styles.avatar}
          />
          <Box sx={styles.contactDetails}>
            <Typography sx={styles.contactName}>{contact.nickname}</Typography>
            <Typography sx={styles.contactEmail}>{contact.email}</Typography>
          </Box>
          <IconButton>
            <FaEnvelope style={{ fontSize: "1.2rem" }} />
          </IconButton>
        </Box>
      ))}

      {/* 모달 */}
      <Modal open={isModalOpen} onClose={toggleModal}>
        <Box sx={styles.modal}>
          <Typography variant="h6" sx={styles.modalTitle}>
            친구 추가하기
          </Typography>
          <TextField
            placeholder="닉네임을 입력하세요"
            value={followNickname}
            onChange={(e) => setFollowNickname(e.target.value)}
            fullWidth
            sx={styles.textField}
          />
          <Box sx={styles.modalActions}>
            <Button onClick={toggleModal} variant="outlined" color="primary">
              취소
            </Button>
            <Button onClick={handleFollow} variant="contained" color="primary">
              추가
            </Button>
          </Box>
        </Box>
      </Modal>
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
    padding: "1rem",
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
  modal: {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#1f1f1f",
    padding: "2rem",
    borderRadius: "8px",
    width: "300px",
  },
  modalTitle: {
    marginBottom: "1rem",
    fontWeight: "bold",
    color: "#fff",
  },
  textField: {
    marginBottom: "1rem",
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#333",
      color: "#fff",
    },
  },
  modalActions: {
    display: "flex",
    justifyContent: "space-between",
  },
};

export default Contacts;
