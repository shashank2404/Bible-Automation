import React from "react";

const ProfileCard = ({ user }) => {
  if (!user) return null;

  const initial = user.name?.charAt(0).toUpperCase();

  return (
    <div style={styles.card}>
      <div style={styles.avatar}>{initial}</div>
      <div style={styles.name}>{user.name}</div>
      <div style={styles.email}>{user.email}</div>
    </div>
  );
};

const styles = {
  card: {
    textAlign: "center",
    padding: "20px",
    background: "#fffaf0",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  avatar: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "#d4a437",
    color: "white",
    fontSize: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 10px",
  },
  name: {
    fontFamily: "Cinzel, serif",
    fontSize: "18px",
  },
  email: {
    fontSize: "12px",
    color: "#777",
  },
};

export default ProfileCard;