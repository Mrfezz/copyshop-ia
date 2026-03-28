"use client";

import React from "react";
import Link from "next/link";

const COLORS = {
  bgTop: "#0b1026",
  bgMid: "#0f1635",
  bgBottom: "#171a52",

  text: "#eef1ff",
  muted: "#c9d2ff",

  panel: "rgba(13, 18, 50, 0.9)",
  panelSoft: "rgba(13, 18, 50, 0.6)",
  panelBorder: "rgba(150, 170, 255, 0.18)",

  violet: "#6a2fd6",
  violetDeep: "#4338ca",
  pink: "#e64aa7",
};

const TESTIMONIALS = [
  {
    name: "Julien",
    text:
      "J’ai reçu ma boutique en quelque minutes. J’ai juste ajouté mes produits et c’était carré.",
  },
  {
    name: "Inès",
    text:
      "Le design est trop propre pour le prix du PACK ESSENTIEL. Franchement ça fait Pro .",
  },
  {
    name: "Hugo",
    text: "L’IA m’a trouvé une niche + angle marketing. J’ai gagné un temps énorme.",
  },
  {
    name: "Sarah",
    text:
      "Très satisfaite du résultat. Le rendu est propre, moderne et beaucoup plus rapide que ce que j’aurais pu faire seule.",
  },
  {
    name: "Mehdi",
    text:
      "Le gain de temps est énorme. J’ai pu me concentrer sur mes produits pendant que la boutique prenait forme.",
  },
  {
    name: "Camille",
    text:
      "Franchement super expérience. Le site est clair, les packs sont simples à comprendre et le résultat final est propre.",
  },
  {
    name: "Yanis",
    text:
      "J’ai aimé le côté rapide et efficace. La boutique donne directement une impression professionnelle.",
  },
  {
    name: "Nora",
    text:
      "Très bon service. Le design est cohérent et la structure du site est déjà bien pensée pour vendre.",
  },
];

export default function AvisClientsPage() {
  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <div style={styles.header}>
            <p style={styles.kicker}>Avis clients</p>
            <h1 style={styles.title}>Tous les avis Copyshop IA</h1>
            <p style={styles.sub}>
              Découvre les retours des clients qui ont testé Copyshop IA.
            </p>
          </div>

          <div style={styles.actions}>
            <Link href="/" style={styles.ghostBtn}>
              Retour à l’accueil
            </Link>

            <Link href="/contact" style={styles.primaryBtn}>
              Nous contacter
            </Link>
          </div>

          <div style={styles.reviewsList}>
            {TESTIMONIALS.map((t, index) => (
              <article key={`${t.name}-${index}`} style={styles.reviewCard}>
                <div style={styles.reviewQuote}>"{t.text}"</div>
                <div style={styles.reviewName}>— {t.name}</div>
              </article>
            ))}
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
    color: COLORS.text,
    overflowX: "hidden",
  },

  bgGradient: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(1200px circle at 10% -10%, #3a6bff33, transparent 50%)," +
      "radial-gradient(900px circle at 90% 10%, #8b5cf633, transparent 45%)," +
      `linear-gradient(180deg, ${COLORS.bgTop} 0%, ${COLORS.bgMid} 45%, ${COLORS.bgBottom} 100%)`,
    zIndex: -3,
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
    opacity: 0.55,
    zIndex: -2,
    pointerEvents: "none",
  },

  section: {
    padding: "90px 20px 60px",
    maxWidth: 1200,
    margin: "0 auto",
  },

  sectionInner: {
    display: "grid",
    gap: 20,
  },

  header: {
    display: "grid",
    gap: 8,
    textAlign: "center",
    marginBottom: 6,
  },

  kicker: {
    fontSize: "0.8rem",
    color: COLORS.muted,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    margin: 0,
  },

  title: {
    fontSize: "clamp(2rem, 4vw, 3rem)",
    lineHeight: 1.1,
    fontWeight: 900,
    letterSpacing: "-0.02em",
    margin: 0,
  },

  sub: {
    color: COLORS.muted,
    fontSize: "1.02rem",
    margin: 0,
    lineHeight: 1.7,
  },

  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 8,
  },

  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    color: "white",
    textDecoration: "none",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    border: `1px solid rgba(255,255,255,0.18)`,
    boxShadow: "0 10px 26px rgba(106,47,214,0.35)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  ghostBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    color: COLORS.text,
    textDecoration: "none",
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${COLORS.panelBorder}`,
    whiteSpace: "nowrap",
  },

  reviewsList: {
    display: "grid",
    gap: 14,
    maxWidth: 900,
    width: "100%",
    margin: "0 auto",
  },

  reviewCard: {
    background: COLORS.panelSoft,
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 18,
    padding: "18px 16px",
    display: "grid",
    gap: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
    backdropFilter: "blur(4px)",
  },

  reviewQuote: {
    fontSize: "1rem",
    lineHeight: 1.8,
    color: COLORS.text,
  },

  reviewName: {
    fontWeight: 900,
    color: COLORS.muted,
    fontSize: "0.98rem",
  },
};