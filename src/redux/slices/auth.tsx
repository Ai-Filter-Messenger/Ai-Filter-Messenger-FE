import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/utils/axios";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "@/redux/store";
import { NavigateFunction } from "react-router-dom";

// 초기 상태 정의
export interface AuthState {
  isLoading: boolean;
  error: string | null;
  token: string | null;
  user: Record<string, any>;
  isLoggedIn: boolean;
  emailVerificationCode: string | null;
  isEmailVerified: boolean;
}

const initialState: AuthState = {
  isLoading: false,
  error: null,
  token: null,
  user: {},
  isLoggedIn: false,
  emailVerificationCode: null,
  isEmailVerified: false,
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
      state.user = action.payload;
    },
    loginSuccess(state, action: PayloadAction<string>) {
      state.isLoggedIn = true;
      state.token = action.payload;
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
  },
});

export default slice.reducer;

const {
  setError,
  setLoading,
  loginSuccess,
  logoutSuccess,
  sendEmailVerificationSuccess,
  verifyEmailSuccess,
} = slice.actions;

// 회원가입
export function RegisterUser(
  formValues: Record<string, any>,
  navigate: NavigateFunction
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setError(null));
    dispatch(setLoading(true));

    try {
      const response = await axios.post("/user/register", formValues, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success("회원가입 성공!");
      navigate(`/auth/verify`);
    } catch (error: any) {
      dispatch(setError(error?.message || "회원가입 실패."));
      toast.error(error?.message || "회원가입 실패.");
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// 아이디 중복 확인
export function CheckLoginId(loginId: string) {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await axios.post("/user/checkLoginId", { loginId });
      if (response.data.isAvailable) {
        toast.success("사용 가능한 아이디입니다.");
      } else {
        toast.error("이미 사용 중인 아이디입니다.");
      }
    } catch (error: any) {
      toast.error("아이디 중복 확인 실패.");
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
      const response = await axios.post("/user/login", formValues, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      dispatch(loginSuccess(response.data.token));
      toast.success("로그인 성공!");
      dispatch(SendLoginInfo()); // 로그인 정보 전송
      navigate(`/chat`);
    } catch (error: any) {
      dispatch(setError(error?.message || "로그인 실패."));
      toast.error(error?.message || "로그인 실패.");
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// 로그아웃
export function LogoutUser(navigate: NavigateFunction) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(SendLogoutInfo()); // 로그아웃 정보 전송
      dispatch(logoutSuccess());
      navigate("/login");
      toast.success("로그아웃 완료.");
    } catch (error) {
      console.log(error);
    }
  };
}

// 이메일 인증 코드 발송
export function SendEmailVerification(email: string) {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await axios.post("/mail/send", { email });
      dispatch(sendEmailVerificationSuccess(response.data.code));
      toast.success("인증 코드가 발송되었습니다.");
    } catch (error: any) {
      toast.error("이메일 인증 코드 발송에 실패했습니다.");
    }
  };
}

// 이메일 인증 코드 검증
export function VerifyEmail(verificationCode: string, inputCode: string) {
  return async (dispatch: AppDispatch) => {
    if (verificationCode === inputCode) {
      dispatch(verifyEmailSuccess());
      toast.success("이메일 인증이 완료되었습니다.");
    } else {
      toast.error("인증 코드가 올바르지 않습니다.");
    }
  };
}

// 아이디 찾기
export function FindIdByEmail(email: string, verificationCode: string) {
  return async (dispatch: AppDispatch) => {
    try {
      const response = await axios.post("/mail/check", {
        email,
        verificationCode,
      });
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
      const response = await axios.post("/user/password/find", { email });
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
      const response = await axios.post("/user/password/find", {
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
      await axios.post("/follow/loginInfo", {
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
      await axios.post("/follow/logoutInfo", {
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
      const response = await axios.get("/user/login/kakao");
      dispatch(loginSuccess(response.data.token));
      toast.success("카카오 로그인 성공!");
    } catch (error: any) {
      toast.error("카카오 로그인 실패.");
    }
  };
}

// 소셜 로그인(네이버, 구글) 나중에 추가하기
