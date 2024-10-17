import React, { useState } from "react";
import { Box, TextField, IconButton, InputAdornment } from "@mui/material";
import { FaSearch } from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleClear = () => {
    setSearchQuery("");
    onSearch("");
  };

  return (
    <Box sx={styles.searchBarContainer}>
      <TextField
        variant="outlined"
        placeholder={isFocused ? "" : "Search"}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box sx={styles.iconPadding}>
                <FaSearch color="#6c6c6c" />
              </Box>
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton onClick={handleClear} sx={styles.iconPadding}>
                <FaCircleXmark color="#6c6c6c" />
              </IconButton>
            </InputAdornment>
          ),
          sx: styles.input,
        }}
        sx={styles.textField}
      />
    </Box>
  );
};

// 스타일 정의
const styles = {
  searchBarContainer: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    borderRadius: "8px",
    padding: "0.5rem",
    marginBottom: "0.5rem",
  },
  iconPadding: {
    display: "flex",
    alignItems: "center", // 아이콘을 중앙에 위치시키기 위해 추가
    paddingLeft: "1.3rem", // 왼쪽 패딩
    paddingRight: "1.3rem", // 오른쪽 패딩
  },
  input: {
    backgroundColor: "#2c2c2c",
    color: "#ffffff",
    border: "none",
    borderRadius: "20px",
    height: "3rem", // 높이 설정
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        display: "none", // 외곽선 제거
      },
      "&:hover fieldset": {
        display: "none", // 호버 시 외곽선 유지하지 않음
      },
      "&.Mui-focused fieldset": {
        display: "none", // 포커스 시 외곽선 유지하지 않음
      },
    },
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      height: "3rem", // 높이 설정
      padding: "0", // 패딩 제거
      display: "flex", // 아이콘을 중앙에 배치하기 위해 flex 사용
      alignItems: "center",
    },
    "& .MuiInputBase-input": {
      padding: "8px", // 텍스트 입력 패딩
    },
  },
};

export default SearchBar;
