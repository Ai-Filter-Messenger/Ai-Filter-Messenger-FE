import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 초기 상태 정의
export interface AppState {
  modals: {
    file: boolean; // 파일 첨부 모달
    gif: boolean; // GIF 첨부 모달
  };
  selectedGifUrl: string;
}

const initialState: AppState = {
  modals: {
    file: false, // 기본적으로 파일 첨부 모달은 닫힘 상태
    gif: false, // 기본적으로 GIF 첨부 모달은 닫힘 상태
  },
  selectedGifUrl: "",
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // 파일 첨부 모달 상태 업데이트
    updateFileModal(state, action: PayloadAction<boolean>) {
      state.modals.file = action.payload;
    },
    // GIF 모달 상태 및 URL 업데이트
    updateGifModal(
      state,
      action: PayloadAction<{ value: boolean; url: string }>
    ) {
      state.modals.gif = action.payload.value;
      state.selectedGifUrl = action.payload.url;
    },
  },
});

// 리듀서 내보내기
export default appSlice.reducer;

// 액션 생성자 내보내기
export const { updateFileModal, updateGifModal } = appSlice.actions;

// 비동기 액션 생성 함수
export const ToggleFileModal = (value: boolean) => async (dispatch: any) => {
  dispatch(updateFileModal(value));
};

export const ToggleGifModal =
  (value: { value: boolean; url: string }) => async (dispatch: any) => {
    dispatch(updateGifModal(value));
  };
