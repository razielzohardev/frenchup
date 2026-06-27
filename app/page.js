"use client";
import "./globals.css";
import { useState, useEffect } from "react";
import App from "../components/FrenchUp";
import AuthScreen from "../components/AuthScreen";
import { supabase } from "../lib/supabase";

export default function Page() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #1A1A2E 0%, #2D2B55 50%, #1A1A2E 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Assistant', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,600&display=swap');
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        .fu-loading-logo { animation: pulse 1.6s ease-in-out infinite; }
      `}</style>
      <h1 className="fu-loading-logo" style={{
        fontFamily: "'Fraunces', Georgia, serif", fontStyle: "italic", fontWeight: 600,
        fontSize: "52px", color: "#F5F0E8", margin: "0 0 16px", letterSpacing: "-1px",
      }}>
        French<span style={{ color: "#E8503A", fontStyle: "normal" }}>Up</span>
      </h1>
      <p style={{ color: "#6B6080", fontSize: "14px", fontWeight: 600 }}>טוען…</p>
    </div>
  );
  if (!session) return <AuthScreen />;
  return <App userId={session.user.id} />;
}
