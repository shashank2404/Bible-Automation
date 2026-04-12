import React from "react";

const TopNav = ({ onBack }) => {
  return (
    <div style={styles.nav}>
      {onBack && (
        <button onClick={onBack} style={styles.back}>‹</button>
      )}
      <div style={styles.title}>Profile</div>
    </div>
  );
};

const styles = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    background: "#fffaf0",
    borderBottom: "1px solid #e8d9b5",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: "17px",
    fontWeight: "600",
    letterSpacing: "3px",
    color: "#3a2d1a",
    flex: 1,
    textAlign: "center",
  },
  back: {
    background: "none",
    border: "none",
    fontSize: "24px",
    color: "#8a6d3b",
    cursor: "pointer",
    padding: "0 8px",
    lineHeight: 1,
  },
  settings: {
    background: "none",
    border: "none",
    fontSize: "18px",
    color: "#8a6d3b",
    cursor: "pointer",
    padding: "0 8px",
  },
};

export default TopNav;