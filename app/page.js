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

  if (session === undefined) return null; // loading — blank screen briefly
  if (!session) return <AuthScreen />;
  return <App userId={session.user.id} />;
}
