import React from "react";

const Account = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Account</h2>
      <button>계정 비활성화</button>
      <button
        style={{
          marginLeft: "10px",
          backgroundColor: "purple",
          color: "white",
        }}
      >
        계정 삭제하기
      </button>
    </div>
  );
};

export default Account;
