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

  panelSoft: "rgba(13, 18, 50, 0.55)",
  panelBorder: "rgba(150, 170, 255, 0.18)",
};

const DEMO_VIDEO_SRC = "/video/demo-services-480p.mp4";

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

        {/* ✅ DÉMO VIDÉO (juste en dessous) */}
        <DemoVideoSection />
      </section>

      {/* responsive */}
      <style>{`
        @media (max-width: 1024px){
          .gridServices { grid-template-columns: 1fr !important; }
          .heroServices { grid-template-columns: 1fr !important; gap: 18px; }
          .heroTitleServices { font-size: clamp(48px, 10vw, 64px) !important; }
        }

        /* Smartphone frame + plus petit sur mobile */
        @media (max-width: 520px){
          .demoPhoneFrame {
            max-width: 330px !important;
            height: 560px !important;
            border-radius: 30px !important;
          }
        }
        @media (max-width: 380px){
          .demoPhoneFrame {
            max-width: 300px !important;
            height: 520px !important;
          }
        }
      `}</style>
    </main>
  );
}

/* ---------------- DÉMO VIDÉO ---------------- */

function DemoVideoSection() {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    // lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const openModal = () => {
    setOpen(true);
    // petit delay pour iOS
    setTimeout(() => {
      modalVideoRef.current?.play().catch(() => {});
    }, 60);
  };

  return (
    <>
      <section style={styles.demoSection}>
        <div style={styles.demoHeader}>
          <div style={styles.demoKicker}>DÉMO</div>
          <h2 style={styles.demoTitle}>Voir le rendu en vidéo (format mobile)</h2>
          <p style={styles.demoSub}>
            Clique sur le téléphone pour ouvrir la vidéo en grand.
          </p>
        </div>

        <div style={styles.demoCenter}>
          <div
            style={styles.demoPhoneFrame}
            className="demoPhoneFrame"
            role="button"
            tabIndex={0}
            onClick={openModal}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openModal();
            }}
            aria-label="Ouvrir la vidéo"
          >
            <div style={styles.demoPhoneScreen}>
              {/* fond stylé (évite le “noir moche” tant que la vidéo charge) */}
              <div style={styles.demoPhoneBackdrop} aria-hidden />

              <video
                ref={videoRef}
                src={DEMO_VIDEO_SRC}
                style={styles.demoVideoInPhone}
                playsInline
                preload="metadata"
                muted
                controls={false}
                onLoadedData={() => setReady(true)}
              />
            </div>

            <div style={styles.demoBadge}>Démo vidéo</div>

            <div style={styles.demoOverlay} aria-hidden>
              <div style={styles.demoPlayCircle}>▶</div>
              <div style={styles.demoOpenText}>{ready ? "OUVRIR" : "CHARGEMENT..."}</div>
            </div>

            <div style={styles.demoPhoneHint}>(Optimisé pour mobile)</div>
          </div>
        </div>
      </section>

      {open && (
        <div style={styles.modalOverlay} onClick={() => setOpen(false)} role="dialog" aria-modal="true">
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

          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <video
              ref={modalVideoRef}
              src={DEMO_VIDEO_SRC}
              controls
              playsInline
              preload="metadata"
              style={styles.modalVideo}
            />
          </div>
        </div>
      )}
    </>
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

  /* ---- demo ---- */
  demoSection: {
    marginTop: 18,
    borderRadius: 18,
    border: `1px solid ${COLORS.panelBorder}`,
    background: COLORS.panelSoft,
    padding: "18px 16px",
  },
  demoHeader: {
    textAlign: "center",
    display: "grid",
    gap: 8,
    marginBottom: 14,
  },
  demoKicker: {
    fontSize: "0.85rem",
    fontWeight: 900,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: COLORS.muted,
  },
  demoTitle: {
    margin: 0,
    fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)",
    fontWeight: 900,
    lineHeight: 1.1,
  },
  demoSub: {
    margin: 0,
    color: COLORS.muted,
    fontWeight: 700,
  },
  demoCenter: {
    display: "grid",
    justifyItems: "center",
  },

  demoPhoneFrame: {
    width: "100%",
    maxWidth: 360,
    height: 600,
    borderRadius: 34,
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${COLORS.panelBorder}`,
    boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
    position: "relative",
    padding: 10,
    overflow: "hidden",
    cursor: "pointer",
  },
  demoPhoneScreen: {
    position: "absolute",
    inset: 10,
    borderRadius: 26,
    overflow: "hidden",
    background: "#000",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  demoPhoneBackdrop: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(600px circle at 50% 15%, rgba(106,47,214,0.35), transparent 55%)," +
      "radial-gradient(700px circle at 50% 70%, rgba(230,74,167,0.18), transparent 55%)," +
      "linear-gradient(180deg, rgba(10,12,30,0.9), rgba(0,0,0,0.92))",
  },
  demoVideoInPhone: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    objectPosition: "center",
  },
  demoBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    background: "rgba(9, 13, 32, 0.85)",
    border: `1px solid ${COLORS.panelBorder}`,
    color: COLORS.text,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: "0.9rem",
    zIndex: 3,
  },
  demoOverlay: {
    position: "absolute",
    inset: 0,
    zIndex: 4,
    display: "grid",
    placeItems: "center",
    gap: 12,
    pointerEvents: "none",
    paddingTop: 20,
  },
  demoPlayCircle: {
    width: 86,
    height: 86,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontSize: "2rem",
    background: "rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,255,255,0.22)",
    boxShadow: "0 20px 60px rgba(106,47,214,0.25)",
  },
  demoOpenText: {
    fontWeight: 900,
    letterSpacing: "0.12em",
    opacity: 0.95,
  },
  demoPhoneHint: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: "center",
    color: COLORS.muted,
    fontWeight: 900,
    opacity: 0.9,
  },

  /* modal */
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(0,0,0,0.72)",
    display: "grid",
    placeItems: "center",
    padding: 18,
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
  modalCard: {
    width: "min(92vw, 420px)",
    height: "min(82vh, 780px)",
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(10,12,30,0.92)",
    display: "grid",
    placeItems: "center",
  },
  modalVideo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    background: "black",
  },
};
