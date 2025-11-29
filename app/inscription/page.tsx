"use client";

// app/inscription/page.tsx
import React, { useState } from "react";
import Link from "next/link";
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

export default function InscriptionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Remplis tous les champs.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Mot de passe trop court (min 6 caractères).");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // optionnel : redirection après confirmation email
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/compte-client`
              : undefined,
        },
      });

      if (error) throw error;

      setSuccessMsg(
        "Compte créé ✅ Vérifie tes emails pour confirmer ton inscription."
      );
      setEmail("");
      setPassword("");
      setConfirm("");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Erreur inscription.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.container}>
        <header style={styles.header}>
          <p style={styles.kicker}>Inscription</p>
          <h1 style={styles.title}>Créer ton compte</h1>
          <p style={styles.sub}>
            Accède à ton espace client, tes packs IA et ton historique.
          </p>
        </header>

        <div className="ins-grid" style={styles.grid}>
          {/* LEFT / INFOS */}
          <aside style={styles.leftCard}>
            <h2 style={styles.leftTitle}>Pourquoi créer un compte ?</h2>

            <ul style={styles.leftList}>
              <li style={styles.leftItem}>
                <span style={styles.dot} />
                <span>Voir tes achats & recharges.</span>
              </li>
              <li style={styles.leftItem}>
                <span style={styles.dot} />
                <span>Accès direct à l’outil IA après paiement.</span>
              </li>
              <li style={styles.leftItem}>
                <span style={styles.dot} />
                <span>Support prioritaire sur WhatsApp.</span>
              </li>
              <li style={styles.leftItem}>
                <span style={styles.dot} />
                <span>Historique et suivi de tes boutiques générées.</span>
              </li>
            </ul>

            <div style={styles.leftBadge}>
              🔒 Données sécurisées via Supabase
            </div>
          </aside>

          {/* RIGHT / FORM */}
          <article style={styles.card}>
            <h2 style={styles.cardTitle}>Inscris-toi</h2>

            <form onSubmit={onSubmit} style={styles.form}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                placeholder="tonmail@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                autoComplete="email"
              />

              <label style={styles.label}>Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                autoComplete="new-password"
              />

              <label style={styles.label}>Confirmer le mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                style={styles.input}
                autoComplete="new-password"
              />

              {errorMsg && <div style={styles.error}>{errorMsg}</div>}
              {successMsg && <div style={styles.success}>{successMsg}</div>}

              <button
                type="submit"
                style={{
                  ...styles.button,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                disabled={loading}
              >
                {loading ? "Création..." : "Créer mon compte"}
              </button>

              <p style={styles.bottom}>
                Déjà un compte ?{" "}
                <Link href="/connexion" style={styles.link}>
                  Se connecter
                </Link>
              </p>
            </form>
          </article>
        </div>
      </section>

      <style>{`
        @media (max-width: 980px) {
          .ins-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    padding: "2.5rem 1.25rem 3rem",
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
    maxWidth: 1100,
    margin: "0 auto",
    padding: "56px 10px 28px",
    position: "relative",
    zIndex: 1,
  },

  header: {
    textAlign: "center" as const,
    marginBottom: 26,
  },
  kicker: {
    fontSize: "0.8rem",
    color: COLORS.muted,
    fontWeight: 800,
    letterSpacing: "0.25em",
    textTransform: "uppercase" as const,
    margin: 0,
  },
  title: {
    fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
    fontWeight: 900,
    margin: "8px 0 8px",
    letterSpacing: "-0.02em",
  },
  sub: {
    fontSize: "1.05rem",
    color: COLORS.muted,
    margin: 0,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    alignItems: "start",
  },

  leftCard: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: "20px",
    display: "grid",
    gap: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  leftTitle: {
    fontWeight: 900,
    fontSize: "1.4rem",
    margin: 0,
  },
  leftList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: 10,
    color: COLORS.muted,
    fontSize: "1rem",
  },
  leftItem: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    boxShadow: "0 0 12px rgba(106,47,214,0.7)",
    flex: "0 0 auto",
  },
  leftBadge: {
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    border: `1px dashed ${COLORS.border}`,
    fontWeight: 800,
    color: COLORS.text,
    textAlign: "center" as const,
  },

  card: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: "20px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  cardTitle: {
    fontWeight: 900,
    fontSize: "1.35rem",
    margin: 0,
  },

  form: {
    display: "grid",
    gap: 10,
    marginTop: 6,
  },
  label: {
    fontSize: "0.95rem",
    fontWeight: 800,
    color: COLORS.text,
  },
  input: {
    width: "100%",
    padding: "12px 12px",
    background: "rgba(7,10,28,0.75)",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    color: COLORS.text,
    outline: "none",
    fontSize: "1rem",
  },

  error: {
    marginTop: 2,
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(255,70,70,0.12)",
    border: "1px solid rgba(255,70,70,0.35)",
    color: "#ffd4d4",
    fontWeight: 800,
    fontSize: "0.95rem",
  },
  success: {
    marginTop: 2,
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(80,220,140,0.12)",
    border: "1px solid rgba(80,220,140,0.35)",
    color: "#d7ffe7",
    fontWeight: 800,
    fontSize: "0.95rem",
  },

  button: {
    marginTop: 6,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: 999,
    fontWeight: 900,
    color: "#fff",
    textDecoration: "none",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    boxShadow: "0 8px 20px rgba(106,47,214,0.35)",
    border: "none",
    fontSize: "1rem",
  },

  bottom: {
    marginTop: 8,
    textAlign: "center" as const,
    color: COLORS.muted,
    fontSize: "0.98rem",
  },
  link: {
    color: COLORS.text,
    fontWeight: 900,
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
} satisfies Record<string, React.CSSProperties>;
