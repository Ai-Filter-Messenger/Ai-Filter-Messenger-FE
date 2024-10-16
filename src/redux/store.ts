import { configureStore } from "@reduxjs/toolkit";
import {
  useDispatch as useAppDispatch,
  useSelector as useAppSelector,
} from "react-redux";
import { persistStore, persistReducer } from "redux-persist";
import { rootPersistConfig, rootReducer } from "./rootReducer"; // rootReducer를 불러옴
import storage from "redux-persist/lib/storage"; // localStorage에 상태 저장

// persistConfig 설정 (redux-persist)
const persistConfig = {
  key: "root",
  storage,
  //   whitelist: ["auth"], // auth 상태만 저장 (필요한 slice 추가)
  // blacklist: ["state"], // persist에서 제외
};

// persistReducer 생성
const persistedReducer = persistReducer(persistConfig, rootReducer);

// RootState 타입 정의 (중복 제거)
export type RootState = ReturnType<typeof rootReducer>;

// 스토어 생성
const store = configureStore({
  reducer: persistedReducer, // rootReducer 대신 persistReducer 적용
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // 직렬화 경고 방지
      immutableCheck: false, // 불변성 경고 방지
    }),
});

// persistStore 생성
const persistor = persistStore(store);

// 타입 설정
export type AppDispatch = typeof store.dispatch;

// Redux의 useDispatch와 useSelector 커스텀 훅 생성
export const useDispatch = () => useAppDispatch<AppDispatch>();
export const useSelector: typeof useAppSelector = useAppSelector;

export { store, persistor };
