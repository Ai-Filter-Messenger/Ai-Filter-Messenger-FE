import React from "react";

const ProfileEdit = () => {
  const user = {
    name: "",
    nickname: "",
    password: "",
    email: "",
    phone: "",
    bio: "",
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Profile</h2>
      <div>
        <label>이름</label>
        <input type="text" value={user.name} readOnly />
      </div>
      <div>
        <label>닉네임</label>
        <input type="text" value={user.nickname} readOnly />
      </div>
      <div>
        <label>비밀번호</label>
        <input type="password" value={user.password} readOnly />
      </div>
      <div>
        <label>Email</label>
        <input type="email" value={user.email} readOnly />
      </div>
      <div>
        <label>전화번호</label>
        <input type="text" value={user.phone} readOnly />
      </div>
      <div>
        <label>소개</label>
        <textarea maxLength={150} value={user.bio} />
      </div>
    </div>
  );
};

export default ProfileEdit;
