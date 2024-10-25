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
    const token = localStorage.getItem("token");

    // 회원가입, 로그인, 아이디 중복 확인 API 경로에서는 Authorization 헤더를 추가하지 않도록 설정(임시)
    const nonAuthRoutes = [
      "/api/user/register",
      "/api/user/check/loginId",
      "/api/user/check/nickname",
      // "/auth/login",
      // "/auth/register",
      // "/auth/find-id",
      // "/auth/find-password",
    ];
    if (token && !nonAuthRoutes.some((route) => config.url?.includes(route))) {
      config.headers.Authorization = `Bearer ${token}`; // Authorization 헤더에 토큰 추가
    }

    return config;
  },
  (error) => {
    // 요청 오류 처리
    return Promise.reject(error);
  }
);

// // 요청 인터셉터
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token"); // 토큰이 있으면 헤더에 추가
//     if (token) {
//       console.log("토큰이 설정되었습니다:", token); // 토큰을 콘솔에 출력
//       config.headers.Authorization = `Bearer ${token}`; // Authorization 헤더에 토큰 추가
//     } else {
//       console.log("토큰이 존재하지 않습니다.");
//     }
//     return config;
//   },
//   (error) => {
//     // 요청 오류 처리
//     return Promise.reject(error);
//   }
// );

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 서버로부터의 응답이 있는 경우
      console.error("HTTP Status:", error.response.status); // 상태 코드 출력
      console.error("응답 데이터:", error.response.data); // 서버로부터의 응답 데이터
      console.error("응답 헤더:", error.response.headers); // 응답 헤더 출력
      console.error("요청 URL:", error.config.url); // 요청한 URL 출력
      console.error("요청 데이터:", error.config.data); // 요청 시 보낸 데이터 출력

      if (error.response.status === 403) {
        console.error("403 Forbidden 에러가 발생했습니다.");
      }
    } else if (error.request) {
      // 요청은 전송되었지만 응답이 없는 경우
      console.error("서버로부터 응답이 없습니다.", error.request);
    } else {
      // 요청 설정 중에 발생한 오류
      console.error("요청 중 오류가 발생했습니다:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
