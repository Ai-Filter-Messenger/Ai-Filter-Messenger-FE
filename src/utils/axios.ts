import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 요청 타임아웃 시간 (밀리초)
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    // 요청 전에 실행
    const token = localStorage.getItem("token"); // 토큰이 있으면 헤더에 추가
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Authorization 헤더에 토큰 추가
    }
    return config;
  },
  (error) => {
    // 요청 오류 처리
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    // 응답 데이터를 처리
    return response;
  },
  (error) => {
    // 응답 오류 처리 (예: 토큰 만료 등)
    if (error.response && error.response.status === 401) {
      // 401 Unauthorized 에러 처리 (예: 로그아웃 처리 등)
      console.log("Unauthorized access - Redirecting to login.");
      // 로그아웃 처리 및 로그인 페이지로 리다이렉트 등
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
