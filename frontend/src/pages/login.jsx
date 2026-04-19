import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --gold: #8B5E1A;
    --gold-mid: #A8722A;
    --gold-light: #C9943A;
    --gold-accent: #D4A843;
    --parchment: #FBF5E6;
    --parchment-deep: #F2E8D0;
    --parchment-border: #DDD0B3;
    --ink: #2C1A0E;
    --ink-soft: #5C3D22;
    --ink-muted: #8B6B4A;
    --warm-white: #FFFDF7;
    --shadow-warm: rgba(139,94,26,0.12);
    --shadow-deep: rgba(44,26,14,0.15);
  }

  body {
    font-family: 'Crimson Pro', serif;
    background: var(--parchment);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .scene {
    position: fixed; inset: 0;
    background:
      radial-gradient(ellipse 70% 50% at 50% 0%, #F0E2C0 0%, transparent 70%),
      radial-gradient(ellipse 60% 40% at 20% 100%, #EDD9A8 0%, transparent 60%),
      radial-gradient(ellipse 50% 50% at 80% 80%, #F5ECD5 0%, transparent 60%),
      linear-gradient(160deg, #FBF5E6 0%, #F0E4C8 50%, #F8F0DC 100%);
    overflow: hidden;
  }

  .texture {
    position: absolute; inset: 0;
    background-image:
      url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B5E1A' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.6;
  }

  .light-rays {
    position: absolute;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 500px;
    background: conic-gradient(
      from 260deg at 50% 0%,
      transparent 0deg,
      rgba(201,148,58,0.06) 5deg,
      transparent 10deg,
      rgba(201,148,58,0.04) 18deg,
      transparent 24deg,
      rgba(201,148,58,0.07) 32deg,
      transparent 38deg,
      rgba(201,148,58,0.05) 46deg,
      transparent 52deg,
      rgba(201,148,58,0.06) 58deg,
      transparent 64deg,
      rgba(201,148,58,0.04) 72deg,
      transparent 80deg
    );
    filter: blur(8px);
    animation: rayPulse 6s ease-in-out infinite alternate;
  }

  @keyframes rayPulse {
    0% { opacity: 0.7; transform: translateX(-50%) scaleX(0.95); }
    100% { opacity: 1; transform: translateX(-50%) scaleX(1.05); }
  }

  .cross {
    position: absolute;
    top: 3%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0.18;
  }

  .cross-v {
    width: 2px;
    height: 52px;
    background: linear-gradient(to bottom, var(--gold), transparent);
    margin: 0 auto;
  }

  .cross-h {
    width: 26px;
    height: 2px;
    background: var(--gold);
    margin: -36px auto 0;
    opacity: 0.8;
  }

  .corner {
    position: absolute;
    width: 70px;
    height: 70px;
    border-color: rgba(139,94,26,0.2);
    border-style: solid;
  }
  .corner-tl { top: 18px; left: 18px; border-width: 1px 0 0 1px; }
  .corner-tr { top: 18px; right: 18px; border-width: 1px 1px 0 0; }
  .corner-bl { bottom: 18px; left: 18px; border-width: 0 0 1px 1px; }
  .corner-br { bottom: 18px; right: 18px; border-width: 0 1px 1px 0; }

  .card {
    position: relative;
    z-index: 10;
    width: 440px;
    max-width: 95vw;
    background: var(--warm-white);
    border: 1px solid var(--parchment-border);
    border-radius: 3px;
    padding: 50px 46px;
    box-shadow:
      0 2px 6px var(--shadow-warm),
      0 12px 40px var(--shadow-deep),
      0 0 0 4px rgba(139,94,26,0.04),
      inset 0 1px 0 rgba(255,255,255,0.9);
    animation: cardRise 0.8s cubic-bezier(0.16,1,0.3,1) both;
  }

  @keyframes cardRise {
    from { opacity: 0; transform: translateY(20px) scale(0.99); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .card::before {
    content: '';
    position: absolute;
    inset: 5px;
    border: 1px solid rgba(139,94,26,0.08);
    border-radius: 2px;
    pointer-events: none;
  }

  .card::after {
    content: '';
    position: absolute;
    top: 0; left: 10%; right: 10%;
    height: 2px;
    background: linear-gradient(to right, transparent, var(--gold-accent), transparent);
    border-radius: 0 0 2px 2px;
  }

  .ornament {
    text-align: center;
    margin-bottom: 8px;
    color: var(--gold-mid);
    font-size: 10px;
    letter-spacing: 8px;
    animation: fadeIn 1s 0.2s both;
  }

  .brand {
    text-align: center;
    margin-bottom: 6px;
    animation: fadeIn 1s 0.3s both;
  }

  .brand h1 {
    font-family: 'Cinzel', serif;
    font-size: 27px;
    font-weight: 700;
    letter-spacing: 5px;
    color: var(--ink);
    line-height: 1.1;
  }

  .brand .subtitle {
    font-style: italic;
    font-size: 13px;
    color: var(--ink-muted);
    letter-spacing: 2px;
    margin-top: 5px;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0 18px;
    animation: fadeIn 1s 0.4s both;
  }

  .divider-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--parchment-border), transparent);
  }

  .divider-diamond {
    width: 5px; height: 5px;
    background: var(--gold-accent);
    transform: rotate(45deg);
    opacity: 0.6;
  }

  .verse {
    text-align: center;
    font-style: italic;
    font-size: 13.5px;
    color: var(--ink-muted);
    margin-bottom: 28px;
    line-height: 1.7;
    background: var(--parchment-deep);
    border-left: 2px solid var(--gold-accent);
    padding: 10px 14px;
    border-radius: 0 2px 2px 0;
    animation: fadeIn 1s 0.45s both;
  }

  .field-group { margin-bottom: 18px; }
  .field-group:nth-of-type(1) { animation: fadeIn 1s 0.55s both; }
  .field-group:nth-of-type(2) { animation: fadeIn 1s 0.65s both; }

  .field-label {
    font-family: 'Cinzel', serif;
    font-size: 9.5px;
    letter-spacing: 3px;
    color: var(--ink-soft);
    margin-bottom: 8px;
    display: block;
    text-transform: uppercase;
  }

  .field-wrap { position: relative; }

  .field-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ink-muted);
    font-size: 14px;
    pointer-events: none;
    opacity: 0.6;
  }

  .field-input {
    width: 100%;
    padding: 13px 14px 13px 40px;
    background: var(--parchment);
    border: 1px solid var(--parchment-border);
    border-radius: 2px;
    color: var(--ink);
    font-family: 'Crimson Pro', serif;
    font-size: 16px;
    outline: none;
    transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
  }

  .field-input::placeholder { color: var(--ink-muted); opacity: 0.5; }

  .field-input:focus {
    border-color: var(--gold-mid);
    background: var(--warm-white);
    box-shadow: 0 0 0 3px rgba(139,94,26,0.08), 0 1px 3px rgba(44,26,14,0.06);
  }

  .toggle-pass {
    position: absolute;
    right: 13px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    color: var(--ink-muted);
    cursor: pointer; font-size: 14px; padding: 0;
    opacity: 0.5; transition: opacity 0.2s;
  }
  .toggle-pass:hover { opacity: 0.9; }

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    animation: fadeIn 1s 0.72s both;
  }

  .remember { display: flex; align-items: center; gap: 8px; cursor: pointer; }

  .remember input[type="checkbox"] {
    appearance: none;
    width: 14px; height: 14px;
    border: 1px solid var(--parchment-border);
    background: var(--parchment);
    cursor: pointer; position: relative; border-radius: 1px;
    transition: border-color 0.2s, background 0.2s;
  }

  .remember input[type="checkbox"]:checked {
    background: var(--gold-mid);
    border-color: var(--gold-mid);
  }

  .remember input[type="checkbox"]:checked::after {
    content: '✓';
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 9px;
  }

  .remember span { font-size: 13px; color: var(--ink-soft); }

  .forgot {
    font-size: 13px; color: var(--gold-mid);
    text-decoration: none; font-style: italic;
    transition: color 0.2s;
  }
  .forgot:hover { color: var(--gold); }

  .btn-login {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 50%, var(--gold) 100%);
    background-size: 200% 100%;
    background-position: 100% 0;
    border: none; border-radius: 2px;
    color: var(--warm-white);
    font-family: 'Cinzel', serif;
    font-size: 11.5px; font-weight: 600;
    letter-spacing: 4px; text-transform: uppercase;
    cursor: pointer;
    transition: background-position 0.4s, transform 0.15s, box-shadow 0.3s;
    box-shadow: 0 3px 14px rgba(139,94,26,0.3), 0 1px 3px rgba(139,94,26,0.2);
    animation: fadeIn 1s 0.8s both;
    position: relative; overflow: hidden;
  }

  .btn-login::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%);
    transform: translateX(-100%);
    transition: transform 0.5s;
  }

  .btn-login:hover {
    background-position: 0% 0;
    box-shadow: 0 5px 20px rgba(139,94,26,0.35);
    transform: translateY(-1px);
  }
  .btn-login:hover::after { transform: translateX(100%); }
  .btn-login:active { transform: translateY(0); }
  .btn-login:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

  .error-msg {
    background: rgba(180,50,50,0.07);
    border: 1px solid rgba(180,50,50,0.25);
    border-radius: 2px; padding: 10px 14px;
    color: #9B3030; font-size: 13.5px;
    margin-bottom: 16px;
    animation: fadeIn 0.3s ease;
  }

  .separator {
    display: flex; align-items: center; gap: 14px;
    margin: 22px 0;
    animation: fadeIn 1s 0.85s both;
  }

  .sep-line { flex: 1; height: 1px; background: var(--parchment-border); opacity: 0.7; }
  .sep-text { font-style: italic; font-size: 12px; color: var(--ink-muted); letter-spacing: 0.8px; }

  .btn-google {
    width: 100%;
    padding: 13px;
    background: var(--warm-white);
    border: 1px solid var(--parchment-border);
    border-radius: 2px;
    color: var(--ink-soft);
    font-family: 'Crimson Pro', serif;
    font-size: 15px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
    animation: fadeIn 1s 0.9s both;
    box-shadow: 0 1px 3px var(--shadow-warm);
  }

  .btn-google:hover {
    border-color: var(--gold-mid);
    background: var(--parchment);
    box-shadow: 0 2px 8px var(--shadow-warm);
    color: var(--ink);
  }

  .footer-link {
    text-align: center; margin-top: 24px;
    font-size: 13.5px; color: var(--ink-muted);
    animation: fadeIn 1s 1s both;
  }

  .footer-link a {
    color: var(--gold); text-decoration: none;
    font-style: italic; font-weight: 600;
    transition: color 0.2s;
  }
  .footer-link a:hover { color: var(--gold-mid); }

  .footer-ornament {
    text-align: center; margin-top: 20px;
    color: var(--parchment-border); font-size: 10px; letter-spacing: 6px;
    animation: fadeIn 1s 1.1s both;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .spinner {
    width: 13px; height: 13px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: white;
    border-radius: 50%;
    display: inline-block;
    animation: spin 0.7s linear infinite;
    vertical-align: middle; margin-right: 8px;
  }
    .create-account-btn {
  margin-top: 12px;
  width: 100%;
  padding: 10px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  background: transparent;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(6px);
}

.create-account-btn {
  margin-top: 12px;
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  background: #ffffff;       /* 👈 white background */
  color: #111;               /* 👈 dark text */
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

/* Hover */
.create-account-btn:hover {
  background: #f1f1f1;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

/* Active */
.create-account-btn:active {
  transform: scale(0.97);
}
  @keyframes spin { to { transform: rotate(360deg); } }
`;
const navigate = useNavigate;
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verse, setVerse] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/random-verse`)
      .then(res => res.json())
      .then(data => setVerse(data))
      .catch(err => {
        console.log(err);
        setVerse(null); // loading se bahar niklega
      });
  }, []);
  const handleRegister = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      console.log("REGISTER RESPONSE:", data); // 👈 ye add karo

      // LoginPage.jsx — after successful login
      if (data.onboardingComplete) {
        navigate("/home");        // ← was "/chat"
      } else {
        navigate("/onboarding");
      }

    } catch (err) {
      console.log(err);
      setError("Register failed");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      setLoading(false);

      if (data.token) {
        // ✅ SAVE TOKEN
        localStorage.setItem("token", data.token);

        // ✅ REDIRECT
        window.location.href = "/home"; // ya "/" (chat page)

      } else {
        setError(data.error || "Login failed");
      }

    } catch (err) {
      setLoading(false);
      setError("Server error. Try again.");
    }
  };

  return (
    <>
      <style>{style}</style>

      <div className="scene">
        <div className="texture" />
        <div className="light-rays" />
        <div className="cross">
          <div className="cross-v" />
          <div className="cross-h" />
        </div>
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />
      </div>

      <div className="card">
        <div className="ornament">✦ &nbsp; ✦ &nbsp; ✦</div>

        <div className="brand">
          <h1>BIBLE GLORY</h1>
          <div className="subtitle">Holy Bible Study &amp; Bible Chat</div>
        </div>

        <div className="divider">
          <div className="divider-line" />
          <div className="divider-diamond" />
          <div className="divider-line" />
        </div>

        <div className="verse">
          {verse ? (
            <>
              "{verse.text}"
              <br />— {verse.reference}
            </>
          ) : "Loading..."}
        </div>
        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="error-msg">{error}</div>}

          <div className="field-group">
            <label className="field-label">Email Address</label>
            <div className="field-wrap">
              <span className="field-icon">✉</span>
              <input
                className="field-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Password</label>
            <div className="field-wrap">
              <span className="field-icon">🔑</span>
              <input
                className="field-input"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: "42px" }}
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPass(v => !v)}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div className="row">
            <label className="remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot">Forgot password?</a>
          </div>

          <button className="btn-login" type="submit" disabled={loading}>
            {loading && <span className="spinner" />}
            {loading ? "Entering…" : "Enter the Word"}
          </button>
        </form>

        <div className="separator">
          <div className="sep-line" />
          <span className="sep-text">or continue with</span>
          <div className="sep-line" />
        </div>

        <button className="btn-google" type="button">
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
            <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
          </svg>
          Sign in with Google
        </button>

        <button
          type="button"
          className="create-account-btn"
          onClick={() => window.location.href = "/register"}
        >
          ✨ Create an Account
        </button>

        <div className="footer-ornament">— ✦ —</div>
      </div>
    </>
  );
}
