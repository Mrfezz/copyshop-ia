"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const COLORS = {
  bgTop: "#0b1026",
  bgMid: "#0f1635",
  bgBottom: "#171a52",
  text: "#eef1ff",
  muted: "#c9d2ff",
  cardBg: "rgba(14,18,48,0.92)",
  border: "rgba(255,255,255,0.12)",
  violet: "#6a2fd6",
  violetDeep: "#4338ca",
  pink: "#e64aa7",
};

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMsg("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    // redirige vers l'espace client
    window.location.href = "/compte-client";
  }

  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.container}>
        <div style={styles.card}>
          <p style={styles.kicker}>Espace client</p>
          <h1 style={styles.title}>Connexion</h1>
          <p style={styles.sub}>Connecte-toi pour accéder à tes achats et à l’outil IA.</p>

          <form onSubmit={onSubmit} style={styles.form}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@gmail.com"
              style={styles.input}
            />

            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              style={styles.input}
            />

            {msg && <div style={styles.msg}>{msg}</div>}

            <button disabled={loading} style={styles.button}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div style={styles.bottom}>
            Pas encore de compte ?{" "}
            <a href="/inscription" style={styles.link}>
              S’inscrire
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    padding: "3rem 1.25rem",
    color: COLORS.text,
    overflow: "hidden",
  },
  bgGradient: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(1200px circle at 10% -10%, #3a6bff33, transparent 50%)," +
      "radial-gradient(900px circle at 90% 10%, #8b5cf633, transparent 45%)," +
      `linear-gradient(180deg, ${COLORS.bgTop} 0%, ${COLORS.bgMid} 45%, ${COLORS.bgBottom} 100%)`,
    zIndex: -2,
  },
  bgDots: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "radial-gradient(circle at 8% 12%, #6aa2ff66 0 2px, transparent 3px)," +
      "radial-gradient(circle at 12% 18%, #6aa2ff44 0 1.5px, transparent 3px)," +
      "radial-gradient(circle at 16% 8%, #6aa2ff55 0 2px, transparent 4px)",
    backgroundRepeat: "repeat",
    backgroundSize: "32px 32px",
    opacity: 0.7,
    zIndex: -1,
    pointerEvents: "none",
  },
  container: {
    maxWidth: 520,
    margin: "0 auto",
    paddingTop: 40,
  },
  card: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: "26px 24px",
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
  },
  kicker: {
    fontSize: "0.8rem",
    color: COLORS.muted,
    fontWeight: 800,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    margin: 0,
    textAlign: "center",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: 900,
    margin: "8px 0 6px",
    textAlign: "center",
  },
  sub: {
    fontSize: "1rem",
    color: COLORS.muted,
    margin: "0 0 18px",
    textAlign: "center",
  },
  form: {
    display: "grid",
    gap: 10,
  },
  label: {
    fontWeight: 800,
    fontSize: "0.95rem",
  },
  input: {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 10,
    background: "rgba(0,0,0,0.25)",
    border: `1px solid ${COLORS.border}`,
    color: COLORS.text,
    outline: "none",
  },
  msg: {
    background: "rgba(255,80,80,0.12)",
    border: "1px solid rgba(255,80,80,0.35)",
    padding: "8px 10px",
    borderRadius: 8,
    fontSize: "0.95rem",
  },
  button: {
    marginTop: 6,
    padding: "12px 14px",
    borderRadius: 999,
    fontWeight: 900,
    color: "#fff",
    border: "none",
    cursor: "pointer",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    boxShadow: "0 8px 20px rgba(106,47,214,0.35)",
  },
  bottom: {
    marginTop: 14,
    textAlign: "center",
    color: COLORS.muted,
    fontSize: "0.98rem",
  },
  link: {
    color: COLORS.text,
    fontWeight: 900,
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
};
