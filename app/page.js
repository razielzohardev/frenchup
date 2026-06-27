"use client";
import "./globals.css";
import { useState, useEffect, useRef } from "react";
import App from "../components/FrenchUp";
import AuthScreen from "../components/AuthScreen";
import { supabase } from "../lib/supabase";

function WelcomeScreen({ user }) {
  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "";
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#1A1A2E 0%,#2D2B55 50%,#1A1A2E 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Assistant',sans-serif", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,600&display=swap');
        @keyframes pulse   { 0%,100%{opacity:.35} 50%{opacity:1} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fillBar { from{width:0%} to{width:100%} }
        .ws-logo-pulse { animation: pulse 1.6s ease-in-out infinite; }
        .ws-logo-in    { animation: fadeUp .5s cubic-bezier(.3,.8,.3,1) both; }
        .ws-sub        { animation: fadeUp .5s .12s cubic-bezier(.3,.8,.3,1) both; }
        .ws-name       { animation: fadeUp .5s .25s cubic-bezier(.3,.8,.3,1) both; }
        .ws-bar        { animation: fillBar 2s linear both; }
      `}</style>

      <h1 className={user ? "ws-logo-in" : "ws-logo-pulse"} style={{
        fontFamily: "'Fraunces',Georgia,serif", fontStyle: "italic", fontWeight: 600,
        fontSize: "52px", color: "#F5F0E8", margin: "0 0 12px", letterSpacing: "-1px",
      }}>
        French<span style={{ color: "#E8503A", fontStyle: "normal" }}>Up</span>
      </h1>

      {user ? (
        <>
          <p className="ws-sub" style={{
            color: "#9B8FC0", fontSize: "13px", fontWeight: 600,
            letterSpacing: ".18em", textTransform: "uppercase", margin: "0 0 14px",
          }}>Bienvenue</p>
          <h2 className="ws-name" style={{
            color: "#F5F0E8", fontSize: "26px", fontWeight: 800,
            margin: "0 0 44px", fontFamily: "'Assistant',sans-serif",
          }}>{name}</h2>
          <div style={{ width: 160, height: 3, background: "rgba(255,255,255,.1)", borderRadius: 4, overflow: "hidden" }}>
            <div className="ws-bar" style={{ height: "100%", background: "#E8503A", borderRadius: 4 }} />
          </div>
        </>
      ) : (
        <p style={{ color: "#4A4060", fontSize: "13px", fontWeight: 600, margin: 0 }}>טוען…</p>
      )}
    </div>
  );
}

export default function Page() {
  const [session, setSession] = useState(undefined);
  const [welcomeUser, setWelcomeUser] = useState(null);
  const prevSessionRef = useRef(undefined);
  const pageLoadRef = useRef(Date.now());

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      prevSessionRef.current = data.session;
      setSession(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_IN" && !prevSessionRef.current) {
        setWelcomeUser(s?.user);
        const elapsed = Date.now() - pageLoadRef.current;
        // OAuth: elapsed includes loading time → show remaining of 2s window
        // Email/password: user was on auth screen a while → elapsed > 5s → fresh 2s
        const remaining = elapsed < 5000 ? Math.max(0, 2000 - elapsed) : 2000;
        setTimeout(() => setWelcomeUser(null), remaining);
      }
      prevSessionRef.current = s;
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <WelcomeScreen user={null} />;
  if (welcomeUser) return <WelcomeScreen user={welcomeUser} />;
  if (!session) return <AuthScreen />;
  return <App userId={session.user.id} />;
}
