import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/utils/axios";
import { toast } from "react-toastify";
import { AppDispatch, RootState } from "@/redux/store";

// 파일 상태 정의
export interface File {
  id: string;
  name: string;
  url: string;
  type: string; // ex: 'image', 'video', 'document'
}

export interface FileState {
  files: File[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FileState = {
  files: [],
  isLoading: false,
  error: null,
};

// Slice 생성
const slice = createSlice({
  name: "files",
  initialState,
  reducers: {
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    fetchFilesSuccess(state, action: PayloadAction<File[]>) {
      state.files = action.payload;
    },
    uploadFileSuccess(state, action: PayloadAction<File>) {
      state.files.push(action.payload);
    },
    deleteFileSuccess(state, action: PayloadAction<string>) {
      state.files = state.files.filter((file) => file.id !== action.payload);
    },
  },
});

export default slice.reducer;

const {
  setError,
  setLoading,
  fetchFilesSuccess,
  uploadFileSuccess,
  deleteFileSuccess,
} = slice.actions;

// 파일 목록 조회
export function fetchFiles(conversationId: string) {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.get(`/chatRoom/${conversationId}/files`);
      dispatch(fetchFilesSuccess(response.data.files));
    } catch (error: any) {
      dispatch(setError("파일 목록을 가져오는 데 실패했습니다."));
      toast.error("파일 목록을 가져오는 데 실패했습니다.");
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// 파일 업로드
export function uploadFile(conversationId: string, fileData: FormData) {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await axios.post(
        `/chatRoom/${conversationId}/upload`,
        fileData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      dispatch(uploadFileSuccess(response.data.file));
      toast.success("파일 업로드 성공!");
    } catch (error: any) {
      dispatch(setError("파일 업로드에 실패했습니다."));
      toast.error("파일 업로드에 실패했습니다.");
    } finally {
      dispatch(setLoading(false));
    }
  };
}

// 파일 삭제
export function deleteFile(conversationId: string, fileId: string) {
  return async (dispatch: AppDispatch) => {
    try {
      await axios.delete(`/chatRoom/${conversationId}/files/${fileId}`);
      dispatch(deleteFileSuccess(fileId));
      toast.success("파일 삭제 성공!");
    } catch (error: any) {
      dispatch(setError("파일 삭제에 실패했습니다."));
      toast.error("파일 삭제에 실패했습니다.");
    }
  };
}

// 파일 다운로드 링크 생성
export function getDownloadLink(fileUrl: string) {
  return (dispatch: AppDispatch) => {
    try {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("파일 다운로드 시작!");
    } catch (error) {
      toast.error("파일 다운로드에 실패했습니다.");
    }
  };
}

// 파일 미리보기(이미지, 비디오 등)
export function previewFile(fileUrl: string, fileType: string) {
  return (dispatch: AppDispatch) => {
    if (fileType === "image" || fileType === "video") {
      window.open(fileUrl, "_blank");
    } else {
      toast.info("이 파일 형식은 미리보기를 지원하지 않습니다.");
    }
  };
}
