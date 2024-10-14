import React from "react";

const Contacts = ({ onSelectUser }: any) => {
  const contacts = [
    { id: 1, name: "User 1" },
    { id: 2, name: "User 2" },
    { id: 3, name: "User 3" },
  ];

  return (
    <div>
      <h2>Contacts</h2>
      <ul>
        {contacts.map((user) => (
          <li key={user.id} onClick={() => onSelectUser(user)}>
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Contacts;
