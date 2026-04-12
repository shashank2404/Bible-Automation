import React from "react";

const NAV_ITEMS = [
  { icon: "💬", label: "Chat", key: "chat" },
  { icon: "👥", label: "Friends", key: "friends" },
  { icon: "❤️", label: "Saved", key: "saved" },
  { icon: "📖", label: "Bible", key: "bible" },
  { icon: "🔍", label: "Search", key: "search" },
];

const BottomNav = ({ active = "saved" }) => {
  return (
    <div style={styles.nav}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <div key={item.key} style={styles.item}>
            <div style={{ ...styles.iconWrap, ...(isActive ? styles.activeWrap : {}) }}>
              <span style={styles.icon}>{item.icon}</span>
            </div>
            <span style={{ ...styles.label, ...(isActive ? styles.activeLabel : {}) }}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "8px 0 16px",
    background: "#fffaf0",
    borderTop: "1px solid #e8d9b5",
    zIndex: 100,
  },
  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
    cursor: "pointer",
    minWidth: "56px",
  },
  iconWrap: {
    width: "42px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "16px",
    transition: "background 0.2s",
  },
  activeWrap: {
    background: "#f0e0b0",
  },
  icon: {
    fontSize: "20px",
    lineHeight: 1,
  },
  label: {
    fontSize: "10px",
    color: "#9a8060",
    fontFamily: "'Cinzel', serif",
    letterSpacing: "0.3px",
  },
  activeLabel: {
    color: "#c8941a",
    fontWeight: "600",
  },
};

export default BottomNav;