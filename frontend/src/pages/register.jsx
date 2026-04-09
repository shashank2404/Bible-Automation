import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const style = `/* ── Google Fonts Import ── */
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&display=swap');

/* ── CSS Variables ── */
:root {
  --ink:        #2b1a0e;
  --ink-light:  #5c3d1e;
  --ink-mid:    #6b4a10;
  --gold:       #c9a227;
  --gold-light: #f0cc6a;
  --gold-dim:   #9a7510;
  --crimson:    #8b1a1a;
  --parchment:  rgba(255, 252, 235, 0.7);
}

/* ── Background ── */
.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(ellipse at 20% 20%, #fff8e7 0%, #f0d98a 40%, #e0c060 100%);
  font-family: 'IM Fell English', serif;
  position: relative;
  overflow: hidden;
}

/* Sunlight ray overlay */
.register-container::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255,255,220,.7) 0%, transparent 70%),
    radial-gradient(ellipse 40% 40% at 80% 80%, rgba(255,240,180,.4) 0%, transparent 60%);
  pointer-events: none;
}

/* Cross watermark */
.register-container::after {
  content: '✝';
  position: fixed;
  font-size: 520px;
  color: rgba(180,140,20,.06);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  font-family: serif;
  line-height: 1;
}

/* ── Card ── */
.card {
  position: relative;
  background: linear-gradient(160deg, #fdf6e0 0%, #f5e8b0 50%, #ead898 100%);
  padding: 42px 38px 36px;
  border-radius: 6px;
  width: 380px;
  text-align: center;
  box-shadow:
    0 0 0 1px rgba(160,120,10,.35),
    0 0 0 4px rgba(201,162,39,.12),
    0 8px 32px rgba(120,80,0,.25),
    0 2px 6px rgba(0,0,0,.12),
    inset 0 1px 0 rgba(255,255,255,.6);
  animation: cardReveal .8s cubic-bezier(.22,1,.36,1) both;
}

@keyframes cardReveal {
  from { opacity: 0; transform: translateY(20px) scale(.97); }
  to   { opacity: 1; transform: none; }
}

/* Top & bottom gold rules */
.card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 5px;
  border-radius: 6px 6px 0 0;
  background: linear-gradient(90deg, transparent, var(--gold) 20%, var(--gold-light) 50%, var(--gold) 80%, transparent);
}

.card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 0 0 6px 6px;
  background: linear-gradient(90deg, transparent, var(--gold-dim) 20%, var(--gold) 50%, var(--gold-dim) 80%, transparent);
}

/* ── Title ── */
.card h2 {
  font-family: 'Cinzel Decorative', serif;
  font-size: 14px;
  letter-spacing: .14em;
  color: var(--crimson);
  text-shadow: 0 1px 0 rgba(255,255,255,.5);
  margin-bottom: 3px;
}

/* ── Inputs ── */
input {
  width: 100%;
  padding: 10px 14px;
  margin: 6px 0 14px;
  border-radius: 3px;
  border: 1px solid rgba(154,117,16,.45);
  background: var(--parchment);
  color: var(--ink);
  font-family: 'IM Fell English', serif;
  font-size: 14px;
  outline: none;
  transition: border .2s, box-shadow .2s, background .2s;
  box-shadow: inset 0 1px 3px rgba(0,0,0,.07);
}

input::placeholder {
  color: rgba(91,61,30,.35);
  font-style: italic;
}

input:focus {
  border-color: var(--gold);
  background: rgba(255,252,235,.95);
  box-shadow:
    inset 0 1px 3px rgba(0,0,0,.06),
    0 0 0 3px rgba(201,162,39,.2);
}

/* ── Button ── */
button {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--gold-dim);
  border-radius: 3px;
  background: linear-gradient(180deg, var(--gold) 0%, var(--gold-dim) 100%);
  color: var(--ink);
  font-family: 'Cinzel Decorative', serif;
  font-size: 11px;
  letter-spacing: .15em;
  cursor: pointer;
  transition: all .25s;
  box-shadow:
    0 2px 8px rgba(120,80,0,.25),
    inset 0 1px 0 rgba(255,255,255,.3);
  margin-top: 4px;
}

button:hover {
  background: linear-gradient(180deg, var(--gold-light) 0%, #b08518 100%);
  box-shadow: 0 4px 16px rgba(180,120,0,.3), inset 0 1px 0 rgba(255,255,255,.35);
  transform: translateY(-1px);
}

button:active {
  transform: none;
}

/* ── Messages ── */
.error {
  color: var(--crimson);
  margin-bottom: 10px;
  font-style: italic;
  font-size: 12px;
}

.success {
  color: #3a6b2a;
  margin-bottom: 10px;
  font-style: italic;
  font-size: 12px;
}

/* ── Switch link ── */
.switch {
  margin-top: 18px;
  color: var(--ink-light);
  font-size: 12px;
}

.switch a {
  color: var(--crimson);
  text-decoration: none;
  font-style: italic;
  border-bottom: 1px dotted var(--crimson);
  transition: color .2s, border-color .2s;
}

.switch a:hover {
  color: var(--gold-dim);
  border-color: var(--gold-dim);
}`;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setSuccess("Account created successfully ✅");
        localStorage.setItem("token", data.token);
        setName("");
        setEmail("");
        setPassword("");
        navigate("/onboarding");
      } else {
        // ❌ user already exists case
        if (data.error === "User already exists") {
          setError("User already exists! Please login instead.");
          setName("");
          setEmail("");
          setPassword("");
        } else {
          setError(data.error || "Registration failed");
        }
      }
    } catch (err) {
      setLoading(false);
      setError("Server error. Try again.");
    }
  };

  return (
    <>
      <style>{style}</style>

      <div className="register-container">
        <div className="card">
          <h2>Create Account</h2>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="switch">
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </>
  );
}