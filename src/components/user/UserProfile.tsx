import React from "react";

const UserProfile = ({ user }: any) => {
  return (
    <div>
      <h2>{user.name}'s Profile</h2>
      {/* 추가적인 유저 정보 표시 */}
    </div>
  );
};

export default UserProfile;
