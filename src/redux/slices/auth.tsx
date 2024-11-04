import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/utils/axios";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "@/redux/store";
import { NavigateFunction } from "react-router-dom";

// 환경변수에서 API Base URL 가져오기
const API_BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:8080/api";

// 초기 상태 정의
export interface AuthState {
  isLoading: boolean;
  error: string | null;
  token: string | null;
  user: Record<string, any>;
  isLoggedIn: boolean;
  emailVerificationCode: string | null;
  isEmailVerified: boolean;
  foundLoginId: string | null;
}

const initialState: AuthState = {
  isLoading: false,
  error: null,
  token: null,
  user: {},
  isLoggedIn: false,
  emailVerificationCode: null,
  isEmailVerified: false,
  foundLoginId: null,
};

// Slice 생성
const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    fetchUserSuccess(state, action: PayloadAction<Record<string, any>>) {
      state.user = action.payload; // user 객체에 loginId를 포함한 유저 정보가 저장
    },
    loginSuccess(
      state,
      action: PayloadAction<{ token: string; user: Record<string, any> }>
    ) {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.user = action.payload.user; // 유저 정보를 상태에 저장
    },
    logoutSuccess(state) {
      state.isLoggedIn = false;
      state.token = null;
      state.user = {}; // 로그아웃 시 유저 정보 초기화
    },
    sendEmailVerificationSuccess(state, action: PayloadAction<string>) {
      state.emailVerificationCode = action.payload;
    },
    verifyEmailSuccess(state) {
      state.isEmailVerified = true;
    },
    resetEmailVerification(state) {
      state.emailVerificationCode = null;
      state.isEmailVerified = false;
    },
    setFoundLoginId(state, action: PayloadAction<string | null>) {
      state.foundLoginId = action.payload;
    },
  },
});

export default slice.reducer;

// 액션 내보내기
export const {
  setError,
  setLoading,
  loginSuccess,
  logoutSuccess,
  fetchUserSuccess,
  sendEmailVerificationSuccess,
  verifyEmailSuccess,
  resetEmailVerification,
  setFoundLoginId,
} = slice.actions;

// 회원가입
export function RegisterUser(
  formValues: {
    loginId: string;
    password: string;
    nickname: string;
    email: string;
    name: string;
  },
  navigate: NavigateFunction
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setError(null));
    dispatch(setLoading(true));

    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/register`,
        {
          loginId: formValues.loginId,
          password: formValues.password,
          nickname: formValues.nickname,
          email: formValues.email,
          name: formValues.name,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("회원가입 성공!");
      navigate(`/auth/login`);
    } catch (error: any) {
      dispatch(setError(error?.response?.data?.message || "회원가입 실패."));
      toast.error(error?.response?.data?.message || "회원가입 실패.");
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// 로그인
export function LoginUser(
  formValues: Record<string, any>,
  navigate: NavigateFunction
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setError(null));
    dispatch(setLoading(true));

    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/login`,
        formValues,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const accessToken = response.data.accessToken;
      const nickname = response.data.nickname;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("nickname", nickname);

      // 유저 정보 가져오기
      const userResponse = await axios.get(`${API_BASE_URL}/user/info`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // dispatch(loginSuccess({ token: accessToken, user: formValues }));
      dispatch(loginSuccess({ token: accessToken, user: userResponse.data }));

      // console.log("User object in Redux:", formValues);
      console.log("User object in Redux:", userResponse.data);

      toast.success("로그인 성공!");
      console.log(response.data.accessToken);

      // navigate(`/chat/${formValues.loginId}`);
      navigate(`/chat/${userResponse.data.loginId}`);
    } catch (error: any) {
      dispatch(setError(error?.response?.data?.message || "로그인 실패."));
      toast.error(error?.response?.data?.message || "로그인 실패.");
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// 로그아웃
export function LogoutUser(navigate: NavigateFunction) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(logoutSuccess());
      navigate("/login");
      toast.success("로그아웃 완료.");
    } catch (error) {
      console.log(error);
    }
  };
}

// 아이디 중복 확인
export function CheckLoginId(loginId: string, nickname: string) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/check/loginId`,
        {
          loginId,
          nickname,
        },
        { validateStatus: (status) => status === 200 || status === 400 }
      );
      if (response.status === 200) {
        toast.success("사용 가능한 아이디입니다.");
        alert("사용 가능한 아이디입니다."); // 200 상태일 때 메시지
      } else if (response.status === 400) {
        toast.error("이미 사용 중인 아이디입니다.");
        alert("이미 사용 중인 아이디입니다."); // 400 상태일 때 메시지
      }
    } catch (error: any) {
      toast.error("아이디 중복 확인 실패.");
      alert("아이디 중복 확인 실패."); // 기타 오류 발생 시 메시지
    }
  };
}

// 이메일 인증 코드 발송
export function SendEmailVerification(
  email: string,
  state: string = "defaultState",
  authNumber: number = 0
) {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/mail/send`, {
        email,
        state,
        authNumber,
      });

      if (response.status === 200) {
        dispatch(sendEmailVerificationSuccess(response.data.code));
        toast.success("인증 코드가 발송되었습니다.");
        alert("메일 전송에 성공하였습니다."); // 메일 전송 성공 시 alert 메시지
      }
    } catch (error: any) {
      toast.error("이메일 인증 코드 발송에 실패했습니다.");
      alert("이메일 인증 코드 발송에 실패했습니다."); // 실패 시 alert 메시지
    }
  };
}

// 이메일 인증 코드 검증
export function VerifyEmail(email: string, state: string, authNumber: number) {
  return async (dispatch: AppDispatch) => {
    try {
      console.log("이메일 인증 요청:", email, state, authNumber);
      const response = await axios.post(
        `${API_BASE_URL}/mail/confirm`,
        {
          email,
          state,
          authNumber,
        },
        {
          headers: {
            "Content-Type": "application/json", // 헤더에 Content-Type 명시
          },
        }
      );

      console.log("이메일 인증 코드 검증:", response);

      if (response.status === 200) {
        dispatch(verifyEmailSuccess());
        toast.success("이메일 인증이 완료되었습니다.");
      } else {
        toast.error("이메일 인증에 실패했습니다.");
      }
    } catch (error: any) {
      toast.error("이메일 인증에 실패했습니다.");
    }
  };
}

// 아이디 찾기
export function FindIdByEmail(email: string, verificationCode: string) {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/find/loginId`, {
        email,
        verificationCode,
      });
      const { loginId } = response.data.loginId;
      console.log(response.data.loginId);
      dispatch(setFoundLoginId(loginId));
      toast.success("아이디가 이메일로 전송되었습니다.");
    } catch (error: any) {
      toast.error("아이디 찾기에 실패했습니다.");
    }
  };
}

// 비밀번호 찾기
export function FindPassword(email: string) {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/password/find`, {
        email,
      });
      toast.success("임시 비밀번호가 발송되었습니다.");
    } catch (error: any) {
      toast.error("비밀번호 찾기에 실패했습니다.");
    }
  };
}

// 임시 비밀번호 반환
export function ResetPassword(email: string, verificationCode: string) {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/user/password/find`, {
        email,
        verificationCode,
      });
      toast.success("새 임시 비밀번호가 전송되었습니다.");
    } catch (error: any) {
      toast.error("임시 비밀번호 반환에 실패했습니다.");
    }
  };
}

// 친구에게 로그인 정보 전송
export function SendLoginInfo() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      await axios.post(`${API_BASE_URL}/follow/loginInfo`, {
        userId: getState().auth.user.id,
      });
      toast.success("친구에게 로그인 정보가 전송되었습니다.");
    } catch (error: any) {
      toast.error("로그인 정보 전송 실패.");
    }
  };
}

// 친구에게 로그아웃 정보 전송
export function SendLogoutInfo() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      await axios.post(`${API_BASE_URL}/follow/logoutInfo`, {
        userId: getState().auth.user.id,
      });
      toast.success("친구에게 로그아웃 정보가 전송되었습니다.");
    } catch (error: any) {
      toast.error("로그아웃 정보 전송 실패.");
    }
  };
}

// 카카오 로그인
export function KakaoLogin() {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/login/kakao`);
      dispatch(loginSuccess(response.data.token));
      toast.success("카카오 로그인 성공!");
    } catch (error: any) {
      toast.error("카카오 로그인 실패.");
    }
  };
}

// 나머지 소셜 로그인
