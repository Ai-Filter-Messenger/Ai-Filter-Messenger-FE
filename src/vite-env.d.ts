/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_API_KEY: string;
  // 여기에 다른 환경 변수를 추가
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
