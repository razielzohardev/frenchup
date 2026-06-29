"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useLang } from "../lib/lang";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" style={{ verticalAlign: "middle", flexShrink: 0 }}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export default function AuthScreen() {
  const { lang, setLang, ui } = useLang();
  const [mode, setMode] = useState("login"); // "login" | "signup" | "reset"
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
        setSuccess(ui.auth_signup_success);
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        // onAuthStateChange in page.js will handle the redirect
      }
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("Invalid login credentials")) setError(ui.auth_err_invalid);
      else if (msg.includes("Email not confirmed")) setError(ui.auth_err_unconfirmed);
      else if (msg.includes("User already registered")) setError(ui.auth_err_registered);
      else if (msg.includes("Password should be at least")) setError(ui.auth_err_weak_password);
      else setError(msg || ui.auth_err_generic);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) throw err;
      setSuccess(ui.auth_reset_success);
    } catch (err) {
      setError(err.message || ui.auth_err_generic);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (err) setError(err.message);
    setLoading(false);
  };

  const dir = lang === "he" ? "rtl" : "ltr";

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,600&display=swap');`}</style>
    <div style={{ ...styles.bg, direction: dir }}>
      {/* Language toggle — fixed top-right, outside card */}
      <button onClick={() => setLang(lang === "he" ? "en" : "he")} style={styles.langBtn}>
        {ui.switch_lang}
      </button>

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <h1 style={styles.logoTitle}>
            French<span style={{ color: "#E8503A", fontStyle: "normal" }}>Up</span>
          </h1>
          <p style={styles.logoSub}>{ui.auth_tagline}</p>
        </div>

        {/* Mode toggle — hidden in reset mode */}
        {mode !== "reset" && (
          <div style={styles.toggle}>
            <button
              style={{ ...styles.toggleBtn, ...(mode === "login" ? styles.toggleActive : {}) }}
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
            >
              {ui.auth_login}
            </button>
            <button
              style={{ ...styles.toggleBtn, ...(mode === "signup" ? styles.toggleActive : {}) }}
              onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}
            >
              {ui.auth_signup}
            </button>
          </div>
        )}

        {/* Reset password form */}
        {mode === "reset" ? (
          <form onSubmit={handleReset} style={styles.form}>
            <p style={{ fontSize: "14px", color: "#666", margin: "0 0 16px", lineHeight: 1.5 }}>
              {ui.auth_reset_desc}
            </p>
            <label style={styles.label}>{ui.auth_email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={styles.input}
              dir="ltr"
            />
            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.successMsg}>{success}</p>}
            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? "..." : ui.auth_send_reset}
            </button>
            <p style={{ ...styles.hint, marginTop: 16 }}>
              <span style={styles.link} onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
                {ui.auth_back_to_login}
              </span>
            </p>
          </form>
        ) : (
          /* Login / Signup form */
          <form onSubmit={handle} style={styles.form}>
            <label style={styles.label}>{ui.auth_email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={styles.input}
              dir="ltr"
            />
            <label style={styles.label}>{ui.auth_password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={ui.auth_password_placeholder}
              required
              style={styles.input}
              dir="ltr"
            />
            {mode === "login" && (
              <span
                style={{ fontSize: "12px", color: GOLD, fontWeight: 700, cursor: "pointer", textAlign: lang === "he" ? "left" : "right", marginTop: -4 }}
                onClick={() => { setMode("reset"); setError(""); setSuccess(""); }}
              >
                {ui.auth_forgot_password}
              </span>
            )}

            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.successMsg}>{success}</p>}

            <button type="submit" disabled={loading} style={styles.btn}>
              {loading ? "..." : mode === "login" ? ui.auth_login_btn : ui.auth_signup_btn}
            </button>
          </form>
        )}

        {mode !== "reset" && (
          <>
            <div style={styles.divider}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>{ui.auth_or}</span>
              <span style={styles.dividerLine} />
            </div>
            <button type="button" onClick={handleGoogle} disabled={loading} style={styles.googleBtn}>
              <GoogleIcon /> {ui.auth_google}
            </button>

            <p style={styles.hint}>
              {mode === "login" ? ui.auth_no_account : ui.auth_have_account}{" "}
              <span
                style={styles.link}
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}
              >
                {mode === "login" ? ui.auth_signup_link : ui.auth_login_link}
              </span>
            </p>
          </>
        )}
      </div>
    </div>
    </>
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
  logoTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontStyle: "italic",
    fontWeight: 600,
    fontSize: "48px",
    color: INK,
    margin: "0 0 4px",
    letterSpacing: "-1px",
  },
  logoSub: {
    fontSize: "14px",
    color: "#888",
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
  divider: { display: "flex", alignItems: "center", gap: "10px", margin: "16px 0 12px" },
  dividerLine: { flex: 1, height: "1px", background: "#DDD8CC" },
  dividerText: { fontSize: "12px", color: "#AAA", fontWeight: 600 },
  googleBtn: {
    width: "100%",
    padding: "13px",
    borderRadius: "12px",
    border: "2px solid #DDD8CC",
    background: "#fff",
    color: INK,
    fontSize: "15px",
    fontWeight: "700",
    fontFamily: "'Assistant', sans-serif",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  langBtn: {
    position: "fixed",
    top: 16,
    right: 16,
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "20px",
    padding: "7px 16px",
    fontSize: "13px",
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
    cursor: "pointer",
    fontFamily: "'Assistant', sans-serif",
    letterSpacing: "0.02em",
    backdropFilter: "blur(8px)",
    zIndex: 10,
    direction: "ltr",
  },
};
