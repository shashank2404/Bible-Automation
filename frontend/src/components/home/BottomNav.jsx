// src/components/home/BottomNav.jsx
import { useNavigate } from "react-router-dom";

const style = `
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 430px;
    background: rgba(18, 15, 10, 0.96);
    backdrop-filter: blur(16px);
    border-top: 1px solid #2A2318;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 10px 0 22px;
    z-index: 100;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 4px 16px;
    border-radius: 12px;
    transition: background 0.2s;
    min-width: 60px;
    position: relative;
  }

  .nav-item:hover { background: rgba(232,168,56,0.06); }

  .nav-icon {
    font-size: 20px;
    position: relative;
  }

  .nav-icon.heart-icon { color: #E8A838; }

  .nav-label {
    font-family: 'Cinzel', serif;
    font-size: 10px;
    letter-spacing: 0.5px;
    color: #7A6A52;
  }

  .nav-item.active .nav-label { color: #E8A838; }
  .nav-item.active .nav-icon  { filter: brightness(1.3); }
`;

const items = [
  { id: "chat",      icon: "💬", label: "Chat",      route: "/chat" },
  { id: "community", icon: "👥", label: "Community", route: "/community" },
  { id: "today",     icon: "❤️", label: "Today",     route: "/home" },
  { id: "bible",     icon: "📖", label: "Bible",     route: "/bible" },
  { id: "explore",   icon: "🔍", label: "Explore",   route: "/explore" },
];

export default function BottomNav({ active = "today" }) {
  const navigate = useNavigate();

  return (
    <>
      <style>{style}</style>
      <nav className="bottom-nav">
        {items.map(item => (
          <div
            key={item.id}
            className={`nav-item ${active === item.id ? "active" : ""}`}
            onClick={() => navigate(item.route)}
          >
            <span className={`nav-icon ${item.id === "today" ? "heart-icon" : ""}`}>
              {item.icon}
            </span>
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </nav>
    </>
  );
}
