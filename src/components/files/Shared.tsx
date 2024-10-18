import React from "react";

interface SharedProps {
  chatRoomId: string;
}

const Shared: React.FC<SharedProps> = ({ chatRoomId }) => {
  return (
    <div>
      <h1>Shared Files for Room: {chatRoomId}</h1>
      {/* 공유 파일 UI 렌더링 */}
    </div>
  );
};

export default Shared;
