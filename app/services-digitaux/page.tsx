// app/services-digitaux/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  text: string;
  ok: boolean;
  small?: boolean;
};

type ServicePack = {
  title: string;
  intro: string[];
  items: Item[];
  price: string;
  highlight?: boolean;
  productKey: "services-essentiel" | "services-pro" | "services-business";
};

const DEMO_VIDEO_SRC = "/video/demo-services-480p.mp4";

const PRICE_GRADIENT_HOME =
  "linear-gradient(90deg, #141a4a 0%, #3f47d8 55%, #e64aa7 100%)";

const PACKS: ServicePack[] = [
  {
    title: "Pack\nEssentiel",
    intro: [
      "🔐 Personnalisation de votre boutique E-commerce",
      "Tout le nécessaire pour démarrer rapidement et efficacement :",
    ],
    items: [
      { text: "Nom de domaine + hébergement", ok: true },
      { text: "Création d’un logo + charte graphique", ok: true },
      { text: "Jusqu’à 5 pages personnalisées", ok: true },
      { text: "1 adresse email professionnelle", ok: true },
      { text: "Abonnement Shopify non inclus", ok: false },
    ],
    price: "400€",
    productKey: "services-essentiel",
  },
  {
    title: "Pack\nPro",
    intro: [
      "📈 Accompagnement administratif + sourcing produit",
      "En plus de la Formule 1, bénéficie d’un vrai coup de pouce pour créer et gérer votre activité :",
    ],
    items: [
      { text: "Pack Essentiel", ok: true },
      { text: "Création d’un Kbis en 48h", ok: true },
      { text: "Mise en relation avec un fournisseur", ok: true },
      { text: "Aide à la recherche d’un produit gagnant", ok: true },
      { text: "Abonnement Shopify non inclus", ok: false },
    ],
    price: "600€",
    highlight: true,
    productKey: "services-pro",
  },
  {
    title: "Pack\nBusiness+",
    intro: [
      "🚀 Lancement complet et prise en main totale",
      "Tout ce qu’il faut pour un lancement 100% réussi. Inclus :",
    ],
    items: [
      { text: "Pack Essentiel + Pack Pro", ok: true },
      { text: "Activation de Shopify Paiement", ok: true },
      { text: "Prise en charge du contact fournisseur de A à Z", ok: true },
      { text: "Référencement naturel (SEO) de la boutique", ok: true },
      { text: "Création d’une page Instagram, Facebook, TikTok", ok: true },
      { text: "Création d’un flyer adapté à Snapchat", ok: true, small: true },
      { text: "Abonnement Shopify non inclus", ok: false, small: true },
    ],
    price: "800€",
    productKey: "services-business",
  },
];

const COLORS = {
  bgTop: "#0b1026",
  bgMid: "#0f1635",
  bgBottom: "#171a52",

  text: "#eef1ff",
  muted: "#c9d2ff",
  navy: "#0b0f2a",

  cardBg: "#ffffff",
  cardBorder: "rgba(11,15,42,0.10)",

  purple: "#6a2fd6",
  violetDeep: "#4338ca",
  pink: "#e64aa7",

  panel: "rgba(13, 18, 50, 0.9)",
  panelSoft: "rgba(13, 18, 50, 0.6)",
  panelBorder: "rgba(150, 170, 255, 0.18)",
};

export default function ServicesDigitauxPage() {
  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.container}>
        {/* HERO */}
        <header className="heroServices" style={styles.hero}>
          <h1 className="heroTitleServices" style={styles.heroTitle}>
            Services
            <br />
            Digitaux
          </h1>

          <div style={styles.heroRight}>
            <div style={styles.heroRightLine}>TROIS PACKS 📦</div>
            <div style={styles.heroRightLine}>UN OBJECTIF 🎯</div>
            <div style={styles.heroRightLine}>RÉUSSIR 🚀</div>
          </div>
        </header>

        {/* CARDS */}
        <div className="gridServices" style={styles.grid}>
          {PACKS.map((pack, idx) => (
            <article
              key={idx}
              style={{
                ...styles.card,
                border: pack.highlight
                  ? `2px solid ${COLORS.purple}`
                  : `2px solid ${COLORS.cardBorder}`,
                boxShadow: pack.highlight
                  ? "0 14px 45px rgba(106,47,214,0.35)"
                  : "0 10px 30px rgba(0,0,0,0.20)",
                transform: pack.highlight ? "translateY(-6px)" : "none",
              }}
            >
              <h2 style={styles.cardTitle}>
                {pack.title.split("\n").map((l, i) => (
                  <span key={i} style={{ display: "block" }}>
                    {l}
                  </span>
                ))}
              </h2>

              <div style={styles.cardIntro}>
                {pack.intro.map((t, i) => (
                  <p key={i} style={{ margin: i === 0 ? 0 : "8px 0 0" }}>
                    {t}
                  </p>
                ))}
              </div>

              <ul style={styles.list}>
                {pack.items.map((it, i) => (
                  <li key={i} style={styles.listItem}>
                    <span
                      style={{
                        ...styles.box,
                        background: it.ok ? COLORS.navy : "#ef4444",
                      }}
                    >
                      {it.ok ? "✓" : "x"}
                    </span>
                    <span
                      style={{
                        fontSize: it.small ? "0.9rem" : "1rem",
                        opacity: it.small ? 0.9 : 1,
                      }}
                    >
                      {it.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* ✅ PRIX + Paiement unique + CTA */}
              <div style={{ ...styles.priceBar, background: PRICE_GRADIENT_HOME }}>
                <div style={styles.priceLeft}>
                  <div style={styles.price}>{pack.price}</div>
                  <div style={styles.priceNote}>Paiement unique</div>
                </div>

                <Link
                  href={`/paiement?product=${pack.productKey}`}
                  style={styles.priceBtn}
                >
                  Choisir ce pack
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div style={styles.bottomBand}>
          🧩 On s’occupe de tout, du début jusqu’au lancement de votre commerce en
          ligne !
        </div>

        {/* ✅ SECTION VIDEO (smartphone + modal) */}
        <DemoVideoPhone />
      </section>

      {/* responsive */}
      <style>{responsiveCss}</style>
    </main>
  );
}

/* ------------------ VIDEO SECTION ------------------ */

function DemoVideoPhone() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section style={styles.demoWrap} id="demo">
      <div style={styles.demoHeader}>
        <p style={styles.demoKicker}>Démo</p>
        <h2 style={styles.demoTitle}>Voir le rendu en vidéo (format mobile)</h2>
        <p style={styles.demoText}>
          Clique sur le téléphone pour ouvrir la vidéo en grand.
        </p>
      </div>

      <div style={styles.demoGrid} className="demoGrid">
        <div style={styles.phoneCol}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={styles.phoneBtn}
            aria-label="Ouvrir la démo vidéo"
          >
            <div style={styles.phoneFrame} className="phoneFrame">
              <div style={styles.phoneScreen}>
                {/* On met juste une preview légère (metadata), et on ouvre en grand au clic */}
                <video
                  src={DEMO_VIDEO_SRC}
                  style={styles.phoneVideo}
                  preload="metadata"
                  muted
                  playsInline
                />
              </div>

              <div style={styles.phoneBadge}>Démo vidéo</div>

              <div style={styles.playOverlay}>
                <div style={styles.playCircle}>▶</div>
                <div style={styles.playLabel}>Ouvrir</div>
              </div>
            </div>

            <div style={styles.phoneHint}>(Optimisé pour mobile)</div>
          </button>
        </div>

        <div style={styles.demoRight}>
          <ul style={styles.checkList}>
            <li style={styles.checkItem}>
              <span style={styles.check}>✓</span> Même rendu que sur téléphone
            </li>
            <li style={styles.checkItem}>
              <span style={styles.check}>✓</span> Structure clean + pro
            </li>
            <li style={styles.checkItem}>
              <span style={styles.check}>✓</span> Sections + design cohérent
            </li>
            <li style={styles.checkItem}>
              <span style={styles.check}>✓</span> Prêt à vendre rapidement
            </li>
          </ul>

          <div style={{ marginTop: 14 }}>
            <Link href="/contact" style={styles.primaryBtn}>
              Demander la démo sur WhatsApp
            </Link>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {open && (
        <div
          style={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            style={styles.modalClose}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            aria-label="Fermer"
          >
            ✕
          </button>

          <video
            src={DEMO_VIDEO_SRC}
            style={styles.modalVideo}
            controls
            autoPlay
            playsInline
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}

/* -------------- STYLES -------------- */

const styles: Record<string, React.CSSProperties> = {
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
    maxWidth: 1200,
    margin: "0 auto",
    padding: "64px 20px 28px",
    position: "relative",
    zIndex: 1,
  },

  hero: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "start",
    marginBottom: 26,
  },
  heroTitle: {
    fontSize: "88px",
    fontWeight: 300,
    lineHeight: 0.95,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  heroRight: {
    textAlign: "right",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    lineHeight: 1.4,
    fontSize: "1.05rem",
    color: "white",
    marginTop: 10,
  },
  heroRightLine: { opacity: 0.95 },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
    gap: 18,
  },

  card: {
    background: COLORS.cardBg,
    color: COLORS.navy,
    borderRadius: 18,
    padding: "22px 22px 0",
    display: "flex",
    flexDirection: "column",
    minHeight: 560,
    overflow: "hidden",
  },

  cardTitle: {
    fontSize: "2.1rem",
    fontWeight: 900,
    margin: "6px 0 10px",
    whiteSpace: "pre-line",
  },
  cardIntro: {
    fontSize: "0.95rem",
    lineHeight: 1.35,
    color: "rgba(11,15,42,0.9)",
    marginBottom: 10,
  },

  list: {
    marginTop: 12,
    display: "grid",
    gap: 10,
    fontSize: "1rem",
    padding: 0,
    listStyle: "none",
    flex: 1,
  },
  listItem: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
  },
  box: {
    width: 26,
    height: 26,
    borderRadius: 4,
    display: "grid",
    placeItems: "center",
    color: "white",
    fontSize: "0.95rem",
    fontWeight: 900,
    flex: "0 0 auto",
    marginTop: 1,
  },

  priceBar: {
    marginTop: 14,
    padding: "14px 16px",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  priceLeft: { display: "grid", gap: 2 },
  price: {
    fontSize: "2.1rem",
    fontWeight: 900,
    letterSpacing: "0.02em",
  },
  priceNote: { fontSize: "0.95rem", fontWeight: 700, opacity: 0.9 },
  priceBtn: {
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    color: "white",
    textDecoration: "none",
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.28)",
    boxShadow: "0 6px 14px rgba(230,74,167,0.25)",
    whiteSpace: "nowrap",
  },

  bottomBand: {
    marginTop: 18,
    width: "100%",
    textAlign: "center",
    background: "linear-gradient(90deg, #1b2b9d, #6a2fd6, #e64aa7)",
    border: "1px solid rgba(120,140,255,0.25)",
    padding: "14px 16px",
    borderRadius: 14,
    fontSize: "1.05rem",
    fontWeight: 800,
  },

  /* ---------- DEMO VIDEO ---------- */
  demoWrap: {
    marginTop: 18,
    background: COLORS.panelSoft,
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 18,
    padding: "18px 16px",
    backdropFilter: "blur(6px)",
  },
  demoHeader: { textAlign: "center", display: "grid", gap: 8, marginBottom: 12 },
  demoKicker: {
    margin: 0,
    fontSize: "0.8rem",
    fontWeight: 900,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: COLORS.muted,
  },
  demoTitle: {
    margin: 0,
    fontSize: "clamp(1.5rem, 3vw, 2rem)",
    fontWeight: 900,
  },
  demoText: { margin: 0, color: COLORS.muted, fontSize: "1.02rem", lineHeight: 1.6 },

  demoGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(300px, 390px) 1fr",
    gap: 18,
    alignItems: "start",
  },

  phoneCol: { display: "grid", gap: 10, justifyItems: "center" },
  phoneBtn: {
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    width: "100%",
    display: "grid",
    justifyItems: "center",
  },

  phoneFrame: {
    width: "100%",
    maxWidth: 390,
    height: 640,
    borderRadius: 34,
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${COLORS.panelBorder}`,
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
    position: "relative",
    padding: 10,
    overflow: "hidden",
  },

  phoneScreen: {
    position: "absolute",
    inset: 10,
    borderRadius: 26,
    overflow: "hidden",
    background: "#000",
    border: "1px solid rgba(255,255,255,0.10)",
  },

  phoneVideo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    objectPosition: "center",
    background: "#000",
    display: "block",
  },

  phoneBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    background: COLORS.panel,
    border: `1px solid ${COLORS.panelBorder}`,
    color: COLORS.text,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: "0.85rem",
    zIndex: 3,
  },

  playOverlay: {
    position: "absolute",
    inset: 0,
    zIndex: 4,
    display: "grid",
    placeItems: "center",
    gap: 8,
    background:
      "radial-gradient(600px circle at 50% 70%, rgba(0,0,0,0.10), rgba(0,0,0,0.55))",
    pointerEvents: "none",
  },
  playCircle: {
    width: 74,
    height: 74,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontSize: "1.9rem",
    color: "white",
    background: "rgba(255,255,255,0.12)",
    border: `1px solid ${COLORS.panelBorder}`,
    boxShadow: "0 10px 26px rgba(106,47,214,0.35)",
  },
  playLabel: {
    fontWeight: 900,
    color: "rgba(255,255,255,0.92)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    fontSize: "0.9rem",
  },

  phoneHint: {
    fontSize: "0.9rem",
    color: COLORS.muted,
    fontWeight: 800,
    textAlign: "center",
  },

  demoRight: { alignSelf: "center" },

  checkList: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 },
  checkItem: { display: "flex", gap: 10, alignItems: "center", fontWeight: 800, color: COLORS.text },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    display: "grid",
    placeItems: "center",
    background: COLORS.navy,
    color: "white",
    fontSize: "0.95rem",
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.10)",
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
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.purple}, ${COLORS.pink})`,
    border: `1px solid rgba(255,255,255,0.18)`,
    boxShadow: "0 10px 26px rgba(106,47,214,0.35)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(0,0,0,0.72)",
    display: "grid",
    placeItems: "center",
    padding: 18,
  },
  modalVideo: {
    width: "min(920px, 92vw)",
    maxHeight: "85vh",
    height: "auto",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(10,12,30,0.8)",
    display: "block",
  },
  modalClose: {
    position: "fixed",
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.35)",
    color: "white",
    fontSize: "1.2rem",
    cursor: "pointer",
  },
};

const responsiveCss = `
  @media (max-width: 1024px){
    .gridServices {
      grid-template-columns: 1fr !important;
    }
    .heroServices {
      grid-template-columns: 1fr !important;
      gap: 18px;
    }
    .heroTitleServices {
      font-size: clamp(48px, 10vw, 64px) !important;
    }
  }

  @media (max-width: 980px){
    .demoGrid{
      grid-template-columns: 1fr !important;
    }
  }

  /* Mobile: rendre le “smartphone” plus petit pour prendre moins de place */
  @media (max-width: 520px){
    .phoneFrame {
      max-width: 330px !important;
      height: 560px !important;
      padding: 10px !important;
      border-radius: 30px !important;
    }
  }
  @media (max-width: 380px){
    .phoneFrame {
      max-width: 300px !important;
      height: 520px !important;
    }
  }
`;
