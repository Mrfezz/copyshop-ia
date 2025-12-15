// app/services-digitaux/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
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
  pink: "#e64aa7",

  panel: "rgba(13, 18, 50, 0.86)",
  panelBorder: "rgba(150, 170, 255, 0.18)",
};

const DEMO_VIDEO_SRC = "/video/demo-services-480p.mp4";
const DEMO_POSTER_IMG = "/images/boutique-client.jpg"; // fallback joli si iPhone charge lentement

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

              {/* PRIX + Paiement unique + CTA */}
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

        {/* Bande "on s'occupe de tout" (centrée propre) */}
        <div style={styles.bottomBand}>
          🧩 On s’occupe de tout, du début jusqu’au lancement de votre commerce en
          ligne !
        </div>

        {/* ✅ Section vidéo (smartphone + modal) */}
        <VideoDemoSection />
      </section>

      <style>{responsiveCss}</style>
    </main>
  );
}

/* ---------------- VIDEO SECTION ---------------- */

function VideoDemoSection() {
  const [open, setOpen] = useState(false);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  const close = () => {
    setOpen(false);
    const v = modalVideoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  // Essaye de lancer la vidéo à l’ouverture (si iPhone bloque, l’utilisateur clique Play)
  useEffect(() => {
    if (!open) return;
    const v = modalVideoRef.current;
    if (!v) return;

    const t = window.setTimeout(() => {
      v.play().catch(() => {});
    }, 120);

    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <section id="demo" style={styles.demoSection}>
      <div style={styles.demoCard}>
        <p style={styles.demoKicker}>DÉMO</p>
        <h2 style={styles.demoTitle}>Voir le rendu en vidéo (format mobile)</h2>
        <p style={styles.demoSub}>
          Clique sur le téléphone pour ouvrir la vidéo en grand.
        </p>

        <div style={styles.demoPhoneWrap}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={styles.phoneFrameBtn}
            aria-label="Ouvrir la vidéo en grand"
          >
            <div style={styles.phoneFrame} className="phoneFrame">
              <div style={styles.phoneScreen}>
                {/* fallback joli si iPhone charge lentement */}
                <div
                  style={{
                    ...styles.phonePosterLayer,
                    backgroundImage: `url(${DEMO_POSTER_IMG})`,
                  }}
                />

                <video
                  src={DEMO_VIDEO_SRC}
                  preload="metadata"
                  playsInline
                  muted
                  poster={DEMO_POSTER_IMG}
                  style={styles.phoneVideo}
                />
                <div style={styles.phoneOverlay}>
                  <div style={styles.playCircle}>
                    <span style={{ transform: "translateX(1px)" }}>▶</span>
                  </div>
                  <div style={styles.openLabel}>OUVRIR</div>
                </div>
              </div>
            </div>
          </button>
        </div>

        <a
          href="https://wa.me/33745214922"
          style={styles.demoCta}
          target="_blank"
          rel="noreferrer"
        >
          Demander la démo sur WhatsApp
        </a>
      </div>

      {/* MODAL */}
      {open && (
        <div
          style={styles.modalBackdrop}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div style={styles.modalCard}>
            <button type="button" onClick={close} style={styles.modalClose} aria-label="Fermer">
              ×
            </button>

            <video
              ref={modalVideoRef}
              src={DEMO_VIDEO_SRC}
              controls
              playsInline
              poster={DEMO_POSTER_IMG}
              style={styles.modalVideo}
            />
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------------- STYLES ---------------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    padding: "2.5rem 1.25rem 3rem",
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
    maxWidth: 980,
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    background: "linear-gradient(90deg, #1b2b9d, #6a2fd6, #e64aa7)",
    border: "1px solid rgba(120,140,255,0.25)",
    padding: "14px 16px",
    borderRadius: 14,
    fontSize: "1.05rem",
    fontWeight: 800,
    boxSizing: "border-box",
  },

  /* DEMO */
  demoSection: {
    marginTop: 18,
    display: "grid",
    placeItems: "center",
  },
  demoCard: {
    width: "100%",
    maxWidth: 980,
    borderRadius: 22,
    background: "rgba(13, 18, 50, 0.35)",
    border: `1px solid ${COLORS.panelBorder}`,
    padding: "26px 18px",
    textAlign: "center",
    boxSizing: "border-box",
  },
  demoKicker: {
    margin: 0,
    fontSize: "0.85rem",
    fontWeight: 900,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: COLORS.muted,
  },
  demoTitle: {
    margin: "10px 0 0",
    fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
    fontWeight: 900,
  },
  demoSub: {
    margin: "10px auto 0",
    maxWidth: 720,
    color: COLORS.muted,
    fontSize: "1.05rem",
    lineHeight: 1.6,
  },

  demoPhoneWrap: {
    marginTop: 18,
    display: "grid",
    placeItems: "center",
  },

  phoneFrameBtn: {
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
  },

  phoneFrame: {
    width: "min(92vw, 390px)",
    height: 640,
    borderRadius: 34,
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${COLORS.panelBorder}`,
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
    position: "relative",
    padding: 10,
    overflow: "hidden",
    boxSizing: "border-box",
  },
  phoneScreen: {
    position: "absolute",
    inset: 10,
    borderRadius: 26,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "#000",
  },

  // couche fond (photo) => évite écran noir
  phonePosterLayer: {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "contrast(1.05) brightness(0.9)",
    transform: "scale(1.02)",
    opacity: 0.9,
  },

  phoneVideo: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    background: "transparent",
  },

  phoneOverlay: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    gap: 10,
    background:
      "radial-gradient(240px circle at 50% 35%, rgba(0,0,0,0.25), rgba(0,0,0,0.55))",
  },
  playCircle: {
    width: 86,
    height: 86,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "white",
    fontSize: "1.6rem",
    fontWeight: 900,
  },
  openLabel: {
    fontWeight: 900,
    letterSpacing: "0.2em",
    color: "rgba(255,255,255,0.92)",
  },

  demoCta: {
    marginTop: 16,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 18px",
    borderRadius: 999,
    fontWeight: 900,
    color: "white",
    textDecoration: "none",
    background: "linear-gradient(90deg, #4338ca, #6a2fd6, #e64aa7)",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "0 10px 26px rgba(106,47,214,0.35)",
  },

  /* MODAL */
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.68)",
    display: "grid",
    placeItems: "center",
    zIndex: 9999,
    padding: 18,
  },
  modalCard: {
    position: "relative",
    width: "min(92vw, 420px)",
    height: "min(82vh, 780px)",
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(10,12,30,0.92)",
    display: "grid",
    placeItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.35)",
    color: "white",
    fontSize: "1.5rem",
    cursor: "pointer",
    zIndex: 2,
    lineHeight: 1,
  },
  modalVideo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    background: "black",
  },
};

const responsiveCss = `
  * { box-sizing: border-box; }

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

  /* Phone plus petit sur mobile */
  @media (max-width: 520px){
    .phoneFrame{
      width: min(92vw, 330px) !important;
      height: 560px !important;
      padding: 10px !important;
      border-radius: 30px !important;
    }
  }
  @media (max-width: 380px){
    .phoneFrame{
      width: min(92vw, 300px) !important;
      height: 520px !important;
    }
  }
`;
