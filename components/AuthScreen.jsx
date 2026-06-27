"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthScreen() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handle = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setSuccess("נשלח מייל אימות — בדוק את תיבת הדואר שלך ולחץ על הקישור.");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        // onAuthStateChange in page.js will handle the redirect
      }
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("Invalid login credentials")) setError("אימייל או סיסמה שגויים.");
      else if (msg.includes("Email not confirmed")) setError("יש לאמת את האימייל תחילה — בדוק את תיבת הדואר.");
      else if (msg.includes("User already registered")) setError("כתובת אימייל זו כבר רשומה. נסה להתחבר.");
      else if (msg.includes("Password should be at least")) setError("הסיסמה חייבת להכיל לפחות 6 תווים.");
      else setError(msg || "אירעה שגיאה, נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <span style={styles.logoEmoji}>🗼</span>
          <h1 style={styles.logoTitle}>FrenchUp</h1>
          <p style={styles.logoSub}>למד צרפתית עם מטרו פריז</p>
        </div>

        {/* Mode toggle */}
        <div style={styles.toggle}>
          <button
            style={{ ...styles.toggleBtn, ...(mode === "login" ? styles.toggleActive : {}) }}
            onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
          >
            התחברות
          </button>
          <button
            style={{ ...styles.toggleBtn, ...(mode === "signup" ? styles.toggleActive : {}) }}
            onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}
          >
            הרשמה
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handle} style={styles.form}>
          <label style={styles.label}>אימייל</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            style={styles.input}
            dir="ltr"
          />
          <label style={styles.label}>סיסמה</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="לפחות 6 תווים"
            required
            style={styles.input}
            dir="ltr"
          />

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.successMsg}>{success}</p>}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "..." : mode === "login" ? "התחבר" : "צור חשבון"}
          </button>
        </form>

        <p style={styles.hint}>
          {mode === "login" ? "אין לך חשבון? " : "כבר רשום? "}
          <span
            style={styles.link}
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}
          >
            {mode === "login" ? "הירשם עכשיו" : "התחבר"}
          </span>
        </p>
      </div>
    </div>
  );
}

const INK = "#1A1A2E";
const GOLD = "#C8A23A";
const BG = "#F5F0E8";

const styles = {
  bg: {
    minHeight: "100vh",
    background: `linear-gradient(160deg, #1A1A2E 0%, #2D2B55 50%, #1A1A2E 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Assistant', sans-serif",
    direction: "rtl",
    padding: "20px",
  },
  card: {
    background: BG,
    borderRadius: "20px",
    padding: "40px 36px 32px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  },
  logoWrap: {
    textAlign: "center",
    marginBottom: "28px",
  },
  logoEmoji: {
    fontSize: "48px",
    display: "block",
    marginBottom: "8px",
  },
  logoTitle: {
    fontSize: "28px",
    fontWeight: "900",
    color: INK,
    margin: "0 0 4px",
    letterSpacing: "-0.5px",
  },
  logoSub: {
    fontSize: "14px",
    color: "#666",
    margin: 0,
  },
  toggle: {
    display: "flex",
    background: "#E8E2D6",
    borderRadius: "10px",
    padding: "3px",
    marginBottom: "24px",
    gap: "3px",
  },
  toggleBtn: {
    flex: 1,
    padding: "8px",
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    color: "#888",
    fontFamily: "'Assistant', sans-serif",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  toggleActive: {
    background: "#fff",
    color: INK,
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: INK,
    marginBottom: "2px",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "2px solid #DDD8CC",
    fontSize: "15px",
    fontFamily: "'Assistant', sans-serif",
    outline: "none",
    background: "#fff",
    marginBottom: "8px",
    transition: "border-color 0.2s",
  },
  error: {
    color: "#E53E3E",
    fontSize: "13px",
    fontWeight: "600",
    margin: "4px 0",
    textAlign: "center",
  },
  successMsg: {
    color: "#276749",
    fontSize: "13px",
    fontWeight: "600",
    margin: "4px 0",
    textAlign: "center",
    background: "#C6F6D5",
    padding: "10px",
    borderRadius: "8px",
  },
  btn: {
    marginTop: "8px",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: GOLD,
    color: "#fff",
    fontSize: "16px",
    fontWeight: "800",
    fontFamily: "'Assistant', sans-serif",
    cursor: "pointer",
    letterSpacing: "0.3px",
  },
  hint: {
    textAlign: "center",
    fontSize: "13px",
    color: "#888",
    marginTop: "16px",
  },
  link: {
    color: GOLD,
    fontWeight: "700",
    cursor: "pointer",
  },
};
