"use client";

import React, { useState } from "react";

const COLORS = {
  bgTop: "#0b1026",
  bgMid: "#0f1635",
  bgBottom: "#171a52",

  text: "#eef1ff",
  muted: "#c9d2ff",

  box: "rgba(255,255,255,0.06)",
  boxBorder: "rgba(255,255,255,0.10)",

  violet: "#6a2fd6",
  violetDeep: "#4338ca",
  pink: "#e64aa7",

  inputBg: "rgba(12, 17, 45, 0.9)",
  inputBorder: "rgba(255,255,255,0.14)",
};

export default function NewsletterPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");

    // ✅ Ici tu brancheras plus tard ton vrai système (Mailchimp, Brevo, etc.)
    // Pour l’instant on simule une inscription :
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 700);
  };

  return (
    <main style={styles.page}>
      {/* fond digital */}
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.container}>
        <header style={styles.header}>
          <p style={styles.kicker}>Newsletter</p>
          <h1 style={styles.title}>Reçois nos meilleurs hacks e-commerce.</h1>
          <p style={styles.sub}>
            Produits gagnants, stratégies de scaling et nouveautés IA.
            Zéro spam. Désinscription en 1 clic.
          </p>
        </header>

        <div style={styles.card}>
          <div style={styles.cardGlow} />

          <h2 style={styles.cardTitle}>Abonne-toi à la newsletter Copyshop IA</h2>
          <p style={styles.cardText}>
            Entre ton e-mail ci-dessous et reçois nos conseils chaque semaine.
          </p>

          <form onSubmit={onSubmit} style={styles.form}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ton e-mail (ex: toi@gmail.com)"
              style={styles.input}
            />

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: status === "loading" ? 0.8 : 1,
                cursor: status === "loading" ? "wait" : "pointer",
              }}
              disabled={status === "loading"}
            >
              {status === "success"
                ? "✅ Inscrit !"
                : status === "loading"
                ? "Envoi..."
                : "S’abonner"}
            </button>
          </form>

          <div style={styles.features}>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🔥</span>
              <span>Produits gagnants</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>📈</span>
              <span>Stratégies scaling</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🤖</span>
              <span>Nouveautés IA</span>
            </div>
          </div>

          <div style={styles.bottomNote}>
            Pas de spam. Désinscription en 1 clic.
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 720px) {
          main[data-newsletter] { padding: 2rem 1rem; }
        }
      `}</style>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    padding: "3rem 1.25rem 4rem",
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
    maxWidth: 980,
    margin: "0 auto",
    paddingTop: 20,
    position: "relative",
    zIndex: 1,
  },

  header: {
    textAlign: "center",
    marginBottom: 26,
    padding: "0 8px",
  },
  kicker: {
    fontSize: "0.85rem",
    color: COLORS.muted,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    margin: 0,
  },
  title: {
    fontSize: "clamp(2rem, 4vw, 3.2rem)",
    fontWeight: 900,
    lineHeight: 1.1,
    margin: "8px 0 10px",
    letterSpacing: "-0.02em",
  },
  sub: {
    color: COLORS.muted,
    fontSize: "1.05rem",
    margin: 0,
  },

  card: {
    position: "relative",
    background: COLORS.box,
    border: `1px solid ${COLORS.boxBorder}`,
    borderRadius: 18,
    padding: "26px 22px 18px",
    maxWidth: 760,
    margin: "0 auto",
    backdropFilter: "blur(6px)",
    boxShadow: "0 16px 50px rgba(0,0,0,0.35)",
  },
  cardGlow: {
    position: "absolute",
    inset: -2,
    borderRadius: 20,
    background:
      `linear-gradient(120deg, ${COLORS.violetDeep}33, transparent 55%),` +
      `linear-gradient(300deg, ${COLORS.pink}22, transparent 60%)`,
    filter: "blur(18px)",
    zIndex: -1,
  },
  cardTitle: {
    fontSize: "1.6rem",
    fontWeight: 900,
    margin: "0 0 6px",
    textAlign: "center",
  },
  cardText: {
    color: COLORS.muted,
    textAlign: "center",
    margin: "0 0 14px",
    fontSize: "1rem",
  },

  form: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 10,
    marginTop: 8,
  },
  input: {
    width: "100%",
    padding: "14px 14px",
    borderRadius: 12,
    border: `1px solid ${COLORS.inputBorder}`,
    outline: "none",
    background: COLORS.inputBg,
    color: COLORS.text,
    fontSize: "1rem",
  },
  button: {
    padding: "12px 18px",
    borderRadius: 12,
    border: "none",
    color: "white",
    fontWeight: 900,
    fontSize: "1rem",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    boxShadow: "0 8px 24px rgba(106,47,214,0.35)",
    whiteSpace: "nowrap",
  },

  features: {
    marginTop: 14,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  featureItem: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    fontWeight: 800,
    fontSize: "0.95rem",
  },
  featureIcon: {
    fontSize: "1.1rem",
  },

  bottomNote: {
    marginTop: 12,
    textAlign: "center",
    fontSize: "0.95rem",
    color: "rgba(255,255,255,0.85)",
    borderTop: "1px dashed rgba(255,255,255,0.12)",
    paddingTop: 10,
    fontWeight: 700,
  },
};
