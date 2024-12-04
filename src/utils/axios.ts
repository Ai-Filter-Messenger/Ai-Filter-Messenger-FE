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
    // const token = localStorage.getItem("accessToken"); // JWT 토큰 확인
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Authorization 헤더에 토큰 추가
    } else {
      console.warn("JWT 토큰이 없습니다.");
    }

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

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error("HTTP Status:", error.response.status);
      if (error.response.status === 401) {
        // 401 Unauthorized 에러 처리
        console.warn("AccessToken이 만료되었습니다. 갱신 시도 중...");
        const originalRequest = error.config;

        // 이미 한 번 갱신을 시도한 요청인지 확인
        if (!originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            try {
              // RefreshToken으로 AccessToken 갱신 요청
              const response = await axios.post(
                `${BASE_URL}/auth/refresh`, // RefreshToken 갱신 엔드포인트
                { refreshToken }
              );

              const { accessToken } = response.data;
              localStorage.setItem("accessToken", accessToken);

              // 갱신된 AccessToken으로 원래 요청 재시도
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return axiosInstance(originalRequest);
            } catch (refreshError) {
              console.error("RefreshToken 갱신 실패:", refreshError);
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              window.location.href = "/auth/login"; // 로그인 페이지로 리디렉션
            }
          } else {
            console.error("RefreshToken이 존재하지 않습니다. 로그아웃 처리.");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/auth/login"; // 로그인 페이지로 리디렉션
          }
        }
      }
      if (error.response.status === 403) {
        console.error("403 Forbidden 에러가 발생했습니다.");
      }
    } else if (error.request) {
      console.error("서버로부터 응답이 없습니다.", error.request);
    } else {
      console.error("요청 중 오류가 발생했습니다:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
