import { configureStore } from "@reduxjs/toolkit";
import {
  useDispatch as useAppDispatch,
  useSelector as useAppSelector,
  TypedUseSelectorHook,
} from "react-redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { rootReducer } from "./rootReducer"; // rootReducer 가져오기

// persistConfig 설정
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // 예시로 auth 상태만 저장하도록 설정
};

// persistReducer 생성
const persistedReducer = persistReducer(persistConfig, rootReducer);

// RootState 타입 정의
export type RootState = ReturnType<typeof rootReducer>;

// 스토어 생성
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // 직렬화 경고 방지
      immutableCheck: false, // 불변성 경고 방지
    }),
});

// persistStore 생성
export const persistor = persistStore(store);

// AppDispatch 타입 정의
export type AppDispatch = typeof store.dispatch;

// Redux의 useDispatch와 useSelector 커스텀 훅 생성
export const useDispatch = () => useAppDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = useAppSelector;
