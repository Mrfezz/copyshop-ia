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

  panel: "rgba(13, 18, 50, 0.78)",
  panelBorder: "rgba(150, 170, 255, 0.18)",

  cardBg: "#ffffff",
  cardBorder: "rgba(11,15,42,0.10)",

  purple: "#6a2fd6",
  pink: "#e64aa7",
};

const DEMO_VIDEO_SRC = "/video/demo-services-480p.mp4";
// ✅ poster (image) pour éviter l’écran noir sur iPhone tant que la vidéo n’est pas ouverte
const DEMO_POSTER_IMG = "/images/boutique-client.jpg";

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

                <Link href={`/paiement?product=${pack.productKey}`} style={styles.priceBtn}>
                  Choisir ce pack
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* ✅ Bande phrase (centrée propre) */}
        <div style={styles.bottomBand}>
          🧩 On s’occupe de tout, du début jusqu’au lancement de votre commerce en ligne !
        </div>

        {/* ✅ Section DÉMO vidéo juste en dessous */}
        <DemoVideoSection />
      </section>

      <style>{responsiveCss}</style>
    </main>
  );
}

/* ---------------- DEMO SECTION ---------------- */

function DemoVideoSection() {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    // lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // tente de lancer (sur iOS ça marche si ça suit un clic utilisateur)
    const t = window.setTimeout(() => {
      try {
        videoRef.current?.play?.();
      } catch {}
    }, 50);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
      try {
        videoRef.current?.pause?.();
        if (videoRef.current) videoRef.current.currentTime = 0;
      } catch {}
    };
  }, [open]);

  return (
    <section id="demo" style={styles.demoSection}>
      <div style={styles.demoCard} className="demoCard">
        <p style={styles.demoKicker}>DÉMO</p>
        <h2 style={styles.demoTitle}>Voir le rendu en vidéo (format mobile)</h2>
        <p style={styles.demoSub}>Clique sur le téléphone pour ouvrir la vidéo en grand.</p>

        {/* ✅ Preview (image) -> pas de vidéo ici (évite écran noir + charge) */}
        <div style={styles.demoPhoneWrap}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={styles.phoneFrame}
            className="phoneFrame"
            aria-label="Ouvrir la vidéo démo"
          >
            <div style={styles.phoneScreen}>
              <img src={DEMO_POSTER_IMG} alt="Aperçu de la vidéo" style={styles.phonePoster} />
              <div style={styles.phoneOverlay}>
                <div style={styles.playCircle}>▶</div>
                <div style={styles.openLabel}>OUVRIR</div>
              </div>
            </div>
          </button>
        </div>

        <a href="https://wa.me/33745214922" style={styles.demoCta}>
          Demander la démo sur WhatsApp
        </a>
      </div>

      {/* ✅ MODAL vidéo (avec X + clic dehors) */}
      {open && (
        <div style={styles.modalOverlay} onClick={close} role="dialog" aria-modal="true">
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={close} style={styles.modalClose} aria-label="Fermer">
              ×
            </button>

            <video
              ref={videoRef}
              src={DEMO_VIDEO_SRC}
              controls
              playsInline
              preload="metadata"
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
    boxSizing: "border-box",
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
    boxSizing: "border-box",
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

  /* ---- DEMO ---- */
  demoSection: {
    marginTop: 14,
  },
  demoCard: {
    maxWidth: 980,
    margin: "0 auto",
    background: COLORS.panel,
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 22,
    padding: "26px 18px 20px",
    textAlign: "center",
    overflow: "hidden",
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
    lineHeight: 1.1,
  },
  demoSub: {
    margin: "10px auto 0",
    color: "rgba(201,210,255,0.95)",
    fontSize: "1.05rem",
    maxWidth: 720,
    lineHeight: 1.6,
  },

  demoPhoneWrap: {
    marginTop: 18,
    display: "grid",
    placeItems: "center",
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
    cursor: "pointer",
    outline: "none",
  },

  phoneScreen: {
    position: "absolute",
    inset: 10,
    borderRadius: 26,
    overflow: "hidden",
    background: "#000",
    border: "1px solid rgba(255,255,255,0.10)",
  },

  // ✅ Cover = l’image remplit tout le cadre (plus de “trous”)
  phonePoster: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    display: "block",
    filter: "contrast(1.03) saturate(1.03)",
  },

  phoneOverlay: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    gap: 10,
    background: "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.45))",
  },
  playCircle: {
    width: 76,
    height: 76,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    fontSize: "1.5rem",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "white",
    boxShadow: "0 14px 40px rgba(106,47,214,0.35)",
  },
  openLabel: {
    fontWeight: 900,
    letterSpacing: "0.18em",
    fontSize: "1.05rem",
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
    background: `linear-gradient(90deg, ${COLORS.purple}, #4338ca, ${COLORS.pink})`,
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "0 10px 26px rgba(106,47,214,0.35)",
    whiteSpace: "nowrap",
  },

  /* ---- MODAL ---- */
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    zIndex: 9999,
    display: "grid",
    placeItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "min(92vw, 520px)",
    height: "min(82vh, 860px)",
    background: "rgba(10,12,22,0.92)",
    border: `1px solid rgba(255,255,255,0.18)`,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 22px 90px rgba(0,0,0,0.55)",
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
    fontSize: "1.6rem",
    cursor: "pointer",
    zIndex: 5,
    display: "grid",
    placeItems: "center",
  },
  modalVideo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    background: "black",
    display: "block",
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

  /* ✅ Ajustements phone frame sur mobile */
  @media (max-width: 520px){
    .phoneFrame {
      width: min(92vw, 360px) !important;
      height: 610px !important;
      padding: 10px !important;
      border-radius: 30px !important;
    }
  }
  @media (max-width: 380px){
    .phoneFrame {
      width: min(92vw, 330px) !important;
      height: 570px !important;
    }
  }
`;
