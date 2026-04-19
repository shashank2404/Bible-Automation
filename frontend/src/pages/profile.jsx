import React, { useEffect, useState } from "react";
import TopNav from "../components/Profile/TopNav";
import BottomNav from "../components/Profile/bottomNav";
import ProfileCard from "../components/Profile/ProfileCard";
import StatsCard from "../components/Profile/StatsCard";
import SubscriptionPlans from "../components/Profile/Subscriptionplans";
import { useNavigate } from "react-router-dom";


const COMMUNITIES = [
  { id: 1, name: "Daily Devotionals", members: "12.4k", icon: "📖", joined: true },
  { id: 2, name: "New Testament Study", members: "8.1k", icon: "✝️", joined: false },
  { id: 3, name: "Prayer Circle", members: "5.6k", icon: "🙏", joined: false },
  { id: 4, name: "Psalms & Wisdom", members: "4.2k", icon: "📜", joined: false },
];

const ABOUT_ROWS = [
  { label: "About Bible Chats", value: "GraceWorks Tech Pvt. Ltd." },
  { label: "Version", value: "2.4.1" },
  { label: "Privacy Policy", arrow: true },
  { label: "Terms of Service", arrow: true },
  { label: "Contact Support", arrow: true },
];

const SectionTitle = ({ children }) => (
  <div style={{
    fontFamily: "'Cinzel', serif",
    fontSize: "11px",
    fontWeight: "700",
    color: "#9a8060",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    marginBottom: "8px",
    marginTop: "4px",
    paddingLeft: "2px",
  }}>
    {children}
  </div>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: "#fffaf0",
    border: "1px solid #e8d9b5",
    borderRadius: "18px",
    overflow: "hidden",
    marginBottom: "12px",
    ...style,
  }}>
    {children}
  </div>
);

const Profile = () => {
  const [user, setUser] = useState(null);
  const [communities, setCommunities] = useState(COMMUNITIES);
  const [showPlans, setShowPlans] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => {
        console.error("Profile fetch error:", err);
        navigate("/login");
      });
  }, []);

  // ✅ INFO_ROWS is now INSIDE the component, after user is available
  const getInfoRows = (user) => [
    { label: "Full name", value: user.name },
    { label: "Email", value: user.email },
    {
      label: "Member since",
      value: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "—",
    },
    {
      label: "User ID",
      value: user._id?.toString().slice(-6).toUpperCase(),
    },
  ];

  const toggleCommunity = (id) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, joined: !c.joined } : c))
    );
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingText}>✦</div>
      </div>
    );
  }

  // ✅ Called here with real user data
  const INFO_ROWS = getInfoRows(user);

  return (
    <div style={styles.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap"
        rel="stylesheet"
      />

      <TopNav />

      <div style={styles.container}>
        <ProfileCard user={user} />

        <StatsCard
          xp={user.xp}
          streak={user.streak}
          chaptersRead={user.chaptersRead}
          daysActive={user.daysActive}
        />

        <SectionTitle>Personal Info</SectionTitle>
        <Card>
          {INFO_ROWS.map((row, i) => (
            <div
              key={i}
              style={{
                ...styles.infoRow,
                borderBottom:
                  i < INFO_ROWS.length - 1 ? "1px solid #f0e4c8" : "none",
              }}
            >
              <span style={styles.infoLabel}>{row.label}</span>
              <span style={styles.infoVal}>{row.value || "—"}</span>
            </div>
          ))}
        </Card>

        <div style={styles.planHeader}>
          <SectionTitle>Subscription</SectionTitle>
          <button
            onClick={() => setShowPlans(!showPlans)}
            style={styles.planToggle}
          >
            {showPlans ? "Hide plans" : "View all plans"}
          </button>
        </div>

        {!showPlans ? (
          <Card style={{ padding: "0" }}>
            <div style={styles.currentPlanBanner}>
              <div>
                <div style={styles.planName}>Free Plan</div>
                <div style={styles.planSub}>3 chapters/day · Basic AI chat</div>
              </div>
              <div style={styles.freeBadge}>Active</div>
            </div>
            <button
              onClick={() => setShowPlans(true)}
              style={styles.upgradeBtn}
            >
              ✦ Upgrade for unlimited access
            </button>
          </Card>
        ) : (
          <SubscriptionPlans currentPlan={user.plan || "free"} />
        )}

        <SectionTitle>Communities</SectionTitle>
        <Card>
          {communities.map((c, i) => (
            <div
              key={c.id}
              style={{
                ...styles.commRow,
                borderBottom:
                  i < communities.length - 1 ? "1px solid #f0e4c8" : "none",
              }}
            >
              <div style={styles.commIcon}>{c.icon}</div>
              <div style={styles.commInfo}>
                <div style={styles.commName}>{c.name}</div>
                <div style={styles.commMembers}>{c.members} members</div>
              </div>
              <button
                onClick={() => toggleCommunity(c.id)}
                style={{
                  ...styles.joinBtn,
                  background: c.joined ? "#f0e8d0" : "#d4a437",
                  color: c.joined ? "#9a7030" : "#fff",
                  border: c.joined ? "1px solid #d4b870" : "none",
                }}
              >
                {c.joined ? "Joined ✓" : "Join"}
              </button>
            </div>
          ))}
        </Card>

        <SectionTitle>About</SectionTitle>
        <Card>
          {ABOUT_ROWS.map((row, i) => (
            <div
              key={i}
              style={{
                ...styles.aboutRow,
                borderBottom:
                  i < ABOUT_ROWS.length - 1 ? "1px solid #f0e4c8" : "none",
              }}
            >
              <span style={styles.aboutLabel}>{row.label}</span>
              {row.arrow ? (
                <span style={styles.chevron}>›</span>
              ) : (
                <span style={styles.aboutVal}>{row.value}</span>
              )}
            </div>
          ))}
        </Card>

        <button onClick={handleSignOut} style={styles.signOutBtn}>
          Sign Out
        </button>
      </div>

      <BottomNav active="saved" />
    </div>
  );
};

const styles = {
  page: {
    background: "#f5efe3",
    minHeight: "100vh",
    paddingBottom: "80px",
    fontFamily: "'Lora', serif",
  },
  loading: {
    minHeight: "100vh",
    background: "#f5efe3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: "32px",
    color: "#d4a437",
  },
  container: {
    padding: "16px 16px 0",
    maxWidth: "480px",
    margin: "0 auto",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "13px 16px",
  },
  infoLabel: { fontSize: "13px", color: "#9a8060" },
  infoVal: { fontSize: "13px", color: "#3a2d1a", fontWeight: "500" },
  planHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planToggle: {
    background: "none",
    border: "none",
    fontSize: "12px",
    color: "#c8941a",
    cursor: "pointer",
    fontWeight: "600",
    marginBottom: "8px",
  },
  currentPlanBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderBottom: "1px solid #f0e4c8",
  },
  planName: {
    fontFamily: "'Cinzel', serif",
    fontSize: "15px",
    fontWeight: "700",
    color: "#3a2d1a",
  },
  planSub: { fontSize: "11px", color: "#9a8060", marginTop: "2px" },
  freeBadge: {
    background: "#e8f5e0",
    color: "#3a7a20",
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 10px",
    borderRadius: "20px",
    border: "1px solid #b8dca0",
  },
  upgradeBtn: {
    width: "100%",
    padding: "12px",
    background: "#d4a437",
    border: "none",
    color: "#fff",
    fontFamily: "'Cinzel', serif",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    cursor: "pointer",
  },
  commRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
  },
  commIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#fdf0d0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
    border: "1px solid #e8d9b5",
  },
  commInfo: { flex: 1 },
  commName: { fontSize: "13px", fontWeight: "600", color: "#3a2d1a" },
  commMembers: { fontSize: "11px", color: "#9a8060", marginTop: "1px" },
  joinBtn: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  aboutRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "13px 16px",
  },
  aboutLabel: { fontSize: "13px", color: "#3a2d1a" },
  aboutVal: { fontSize: "12px", color: "#9a8060" },
  chevron: { fontSize: "20px", color: "#c8b080" },
  signOutBtn: {
    width: "100%",
    padding: "13px",
    background: "transparent",
    border: "1.5px solid #e88080",
    borderRadius: "14px",
    color: "#c04040",
    fontSize: "14px",
    fontFamily: "'Cinzel', serif",
    fontWeight: "700",
    letterSpacing: "0.5px",
    cursor: "pointer",
    marginBottom: "16px",
  },
};

export default Profile;