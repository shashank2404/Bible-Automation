import React from "react";

const ProfileCard = ({ user }) => {
  if (!user) return null;
  const initial = user.name?.charAt(0).toUpperCase() || "?";

  return (
    <div style={styles.card}>
      <div style={styles.bannerStrip} />
      <div style={styles.content}>
        <div style={styles.avatarRing}>
          <div style={styles.avatar}>{initial}</div>
        </div>
        <div style={styles.name}>{user.name}</div>
        <div style={styles.handle}>@{user.username || user.name?.toLowerCase().replace(/\s/g, "")}</div>
        <div style={styles.email}>{user.email}</div>
        <div style={styles.badgeRow}>
          <span style={styles.badge}>📖 Bible Scholar</span>
          <span style={styles.badge}>🕊️ Faithful Reader</span>
        </div>
        <button style={styles.editBtn}>Edit Profile</button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: "#fffaf0",
    borderRadius: "20px",
    border: "1px solid #e8d9b5",
    overflow: "hidden",
    marginBottom: "12px",
  },
  bannerStrip: {
    height: "6px",
    background: "linear-gradient(90deg, #c8941a 0%, #e8b84b 50%, #c8941a 100%)",
  },
  content: {
    padding: "20px 20px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatarRing: {
    width: "84px",
    height: "84px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #e8b84b, #c8941a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "12px",
    boxShadow: "0 0 0 4px #f0e0b0",
  },
  avatar: {
    width: "76px",
    height: "76px",
    borderRadius: "50%",
    background: "#d4a437",
    color: "white",
    fontSize: "30px",
    fontFamily: "'Cinzel', serif",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontFamily: "'Cinzel', serif",
    fontSize: "20px",
    fontWeight: "700",
    color: "#3a2d1a",
    letterSpacing: "1px",
    marginBottom: "2px",
  },
  handle: {
    fontSize: "13px",
    color: "#c8941a",
    marginBottom: "2px",
    fontWeight: "500",
  },
  email: {
    fontSize: "12px",
    color: "#9a8060",
    marginBottom: "12px",
  },
  badgeRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "16px",
  },
  badge: {
    background: "#fdf0d0",
    border: "1px solid #e8c87a",
    borderRadius: "20px",
    padding: "3px 10px",
    fontSize: "11px",
    color: "#7a5c00",
    fontWeight: "500",
  },
  editBtn: {
    padding: "8px 28px",
    background: "transparent",
    border: "1.5px solid #d4a437",
    borderRadius: "24px",
    color: "#9a6e00",
    fontSize: "13px",
    fontFamily: "'Cinzel', serif",
    fontWeight: "600",
    letterSpacing: "0.5px",
    cursor: "pointer",
  },
};

export default ProfileCard;