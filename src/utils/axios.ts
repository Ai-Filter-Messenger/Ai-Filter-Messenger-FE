import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8080";

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
    return response;
  },
  (error) => {
    if (error.response) {
      // 서버로부터의 응답이 있는 경우
      console.error(
        "Response error",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      // 요청은 전송되었지만 응답이 없는 경우
      console.error("No response received", error.request);
    } else {
      // 요청 설정 중에 발생한 오류
      console.error("Error in request", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
