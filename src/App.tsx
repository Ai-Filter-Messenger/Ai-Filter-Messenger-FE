// src/App.tsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import RouterConfig from "./routes"; // Router 설정 파일

const App = () => {
  return (
    <Router>
      <RouterConfig /> {/* 라우터 설정을 불러옴 */}
    </Router>
  );
};

export default App;
