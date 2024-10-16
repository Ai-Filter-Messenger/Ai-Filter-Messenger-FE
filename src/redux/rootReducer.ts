import { combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

// slices
import appReducer from "./slices/app"; // app slice
import authReducer from "./slices/auth"; // auth slice
import chatReducer from "./slices/chat"; // chat slice
import filesReducer from "./slices/files"; // files slice
import userReducer from "./slices/user"; // user slice
import stateReducer from "./slices/state"; // ui state slice

// persist config 설정
const rootPersistConfig = {
  key: "root",
  storage, // localStorage 사용
  keyPrefix: "redux-",
  whitelist: ["auth", "user"], // persist에 추가할 항목
};

// 루트 리듀서 생성
const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  chat: chatReducer,
  files: filesReducer,
  user: userReducer,
  state: stateReducer,
});

export { rootPersistConfig, rootReducer };

// persistReducer 적용 (store.ts에서 사용할 때)
export const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

// 루트 리듀서의 타입 정의
export type RootState = ReturnType<typeof rootReducer>;
