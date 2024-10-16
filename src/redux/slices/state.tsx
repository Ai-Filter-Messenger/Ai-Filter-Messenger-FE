import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// UI 상태 정의
export interface UIState {
  modals: {
    gif: boolean;
    audio: boolean;
    media: boolean;
    doc: boolean;
  };
  isLoading: boolean;
  theme: "light" | "dark";
}

const initialState: UIState = {
  modals: {
    gif: false,
    audio: false,
    media: false,
    doc: false,
  },
  isLoading: false,
  theme: "light", // 기본 테마는 'light'
};

// Slice 생성
const slice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // 로딩 상태 설정
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    // GIF 모달 상태 변경
    toggleGifModal(state, action: PayloadAction<boolean>) {
      state.modals.gif = action.payload;
    },
    // 오디오 모달 상태 변경
    toggleAudioModal(state, action: PayloadAction<boolean>) {
      state.modals.audio = action.payload;
    },
    // 미디어 모달 상태 변경
    toggleMediaModal(state, action: PayloadAction<boolean>) {
      state.modals.media = action.payload;
    },
    // 문서 모달 상태 변경
    toggleDocModal(state, action: PayloadAction<boolean>) {
      state.modals.doc = action.payload;
    },
    // 테마 변경
    toggleTheme(state) {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
  },
});

export default slice.reducer;

const {
  setLoading,
  toggleGifModal,
  toggleAudioModal,
  toggleMediaModal,
  toggleDocModal,
  toggleTheme,
} = slice.actions;

// 액션들
export const setLoadingAction = (isLoading: boolean) => (dispatch: any) => {
  dispatch(setLoading(isLoading));
};

export const toggleGifModalAction = (isOpen: boolean) => (dispatch: any) => {
  dispatch(toggleGifModal(isOpen));
};

export const toggleAudioModalAction = (isOpen: boolean) => (dispatch: any) => {
  dispatch(toggleAudioModal(isOpen));
};

export const toggleMediaModalAction = (isOpen: boolean) => (dispatch: any) => {
  dispatch(toggleMediaModal(isOpen));
};

export const toggleDocModalAction = (isOpen: boolean) => (dispatch: any) => {
  dispatch(toggleDocModal(isOpen));
};

export const toggleThemeAction = () => (dispatch: any) => {
  dispatch(toggleTheme());
};
