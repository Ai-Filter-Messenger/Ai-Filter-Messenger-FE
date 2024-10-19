import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/utils/axios";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "@/redux/store";

// 사용자 상태 정의
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface AuthState {
  token: string | null; // Token 속성 추가
  user: User | null; // 현재 사용자 정보
}

export interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,
};

// Slice 생성
const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    fetchUsersSuccess(state, action: PayloadAction<User[]>) {
      state.users = action.payload;
    },
    fetchUserSuccess(state, action: PayloadAction<User>) {
      state.currentUser = action.payload;
    },
  },
});

export default slice.reducer;

const { setError, setLoading, fetchUsersSuccess, fetchUserSuccess } =
  slice.actions;

// 전체 회원 조회
export function GetAllUsers() {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.get("/user/all");
      dispatch(fetchUsersSuccess(response.data.users));
    } catch (error: any) {
      dispatch(setError("사용자 목록을 가져오는 데 실패했습니다."));
      toast.error("사용자 목록을 가져오는 데 실패했습니다.");
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// 친구 추가
export function AddFollow(userId: string) {
  return async (dispatch: AppDispatch) => {
    try {
      await axios.post("/follow/add", { userId });
      toast.success("친구 추가 성공!");
    } catch (error: any) {
      toast.error("친구 추가 실패.");
    }
  };
}

// 친구 삭제
export function CancelFollow(userId: string) {
  return async (dispatch: AppDispatch) => {
    try {
      await axios.post("/follow/cancel", { userId });
      toast.success("친구 삭제 성공!");
    } catch (error: any) {
      toast.error("친구 삭제 실패.");
    }
  };
}

// 로그인 유저의 친구 목록 조회
export function GetFriends() {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.get("/follow/following");
      dispatch(fetchUsersSuccess(response.data.friends));
    } catch (error: any) {
      dispatch(setError("친구 목록을 가져오는 데 실패했습니다."));
      toast.error("친구 목록을 가져오는 데 실패했습니다.");
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// 프로필 수정
export function ProfileEdit(formValues: Record<string, any>) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setLoading(true));
    try {
      const token = getState().auth.token; // Token 가져오기
      const response = await axios.patch("/user", formValues, {
        headers: {
          Authorization: `Bearer ${token}`, // Token 사용
        },
      });
      dispatch(fetchUserSuccess(response.data.user));
      toast.success("프로필 업데이트 성공!");
    } catch (error: any) {
      dispatch(setError("프로필 업데이트에 실패했습니다."));
      toast.error("프로필 업데이트에 실패했습니다.");
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// 닉네임 변경
export function UpdateNickname(newNickname: string) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setLoading(true));
    try {
      const token = getState().auth.token; // Token 가져오기
      const response = await axios.patch(
        "/user/nickname/change",
        { newNickname },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Token 사용
          },
        }
      );
      dispatch(fetchUserSuccess(response.data.user));
      toast.success("닉네임 변경 성공!");
    } catch (error: any) {
      dispatch(setError("닉네임 변경에 실패했습니다."));
      toast.error("닉네임 변경에 실패했습니다.");
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// 프로필 이미지 업데이트
export function UploadProfileImage(imageFile: File) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setLoading(true));
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const token = getState().auth.token; // Token 가져오기

      const response = await axios.patch(
        "/user/profileImage/change",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Token 사용
            "Content-Type": "multipart/form-data",
          },
        }
      );
      dispatch(fetchUserSuccess(response.data.user));
      toast.success("프로필 이미지 업데이트 성공!");
    } catch (error: any) {
      dispatch(setError("프로필 이미지 업데이트에 실패했습니다."));
      toast.error("프로필 이미지 업데이트에 실패했습니다.");
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// 비밀번호 변경
export function UpdatePassword(newPassword: string) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(setLoading(true));
    try {
      await axios.patch(
        "/user/password/change",
        { newPassword },
        {
          headers: {
            Authorization: `Bearer ${getState().auth.token}`,
          },
        }
      );
      toast.success("비밀번호 변경 성공!");
    } catch (error: any) {
      dispatch(setError("비밀번호 변경에 실패했습니다."));
      toast.error("비밀번호 변경에 실패했습니다.");
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// 회원 탈퇴
export function WithdrawUser() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      await axios.post("/user/withdrawal", null, {
        headers: {
          Authorization: `Bearer ${getState().auth.token}`,
        },
      });
      toast.success("회원 탈퇴 성공!");
    } catch (error: any) {
      dispatch(setError("회원 탈퇴에 실패했습니다."));
      toast.error("회원 탈퇴에 실패했습니다.");
    }
  };
}
