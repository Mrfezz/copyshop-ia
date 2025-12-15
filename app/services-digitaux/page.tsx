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
};

// ✅ tes fichiers
const DEMO_VIDEO_SRC = "/video/demo-services-480p.mp4";
// Optionnel (recommandé) : mets une image poster ici
const DEMO_POSTER_PRIMARY = "/images/demo-services-poster.jpg";
// Fallback si tu n’as pas encore créé l’image
const DEMO_POSTER_FALLBACK = "/images/boutique-client.jpg";

export default function ServicesDigitauxPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posterSrc, setPosterSrc] = useState(DEMO_POSTER_PRIMARY);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const closeModal = () => setIsModalOpen(false);
  const openModal = () => setIsModalOpen(true);

  // lock scroll + play on open + ESC to close
  useEffect(() => {
    if (!isModalOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);

    const t = window.setTimeout(() => {
      videoRef.current?.play().catch(() => {});
    }, 120);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;

      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        } catch {}
      }
    };
  }, [isModalOpen]);

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

        {/* ✅ Bande “on s’occupe…” bien centrée */}
        <div style={styles.bottomBand}>
          <span aria-hidden style={{ fontSize: 22, lineHeight: 1 }}>
            🧩
          </span>
          <span>
            On s’occupe de tout, du début jusqu’au lancement de votre commerce en
            ligne !
          </span>
        </div>

        {/* ✅ SECTION DEMO */}
        <section id="demo" style={styles.demoSection}>
          <div style={styles.demoCard}>
            <div style={styles.demoEyebrow}>DÉMO</div>

            <h2 style={styles.demoTitle}>
              Voir le rendu en vidéo
              <br />
              (format mobile)
            </h2>

            <p style={styles.demoSubtitle}>
              Clique sur le téléphone pour ouvrir la vidéo en grand.
            </p>

            {/* Aperçu = IMAGE (poster) + overlay play -> ouvre modal */}
            <div style={styles.phoneWrap}>
              <button
                type="button"
                onClick={openModal}
                aria-label="Ouvrir la démo vidéo"
                style={styles.phoneButton}
              >
                <div className="phoneFrame" style={styles.phoneFrame}>
                  <div style={styles.phoneInner}>
                    <img
                      src={posterSrc}
                      alt="Aperçu de la démo vidéo"
                      style={styles.phonePoster}
                      onError={() => {
                        if (posterSrc !== DEMO_POSTER_FALLBACK) {
                          setPosterSrc(DEMO_POSTER_FALLBACK);
                        }
                      }}
                    />

                    {/* overlay play (un peu + bas que le centre) */}
                    <div style={styles.playOverlay} aria-hidden>
                      <div style={styles.playIcon}>▶</div>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <a
              href="https://wa.me/33745214922"
              target="_blank"
              rel="noreferrer"
              style={styles.demoCta}
            >
              Demander la démo sur WhatsApp
            </a>
          </div>
        </section>
      </section>

      {/* ✅ MODAL VIDEO (avec X) */}
      {isModalOpen && (
        <div
          style={styles.modalOverlay}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Fermer"
              style={styles.modalClose}
            >
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

      {/* responsive */}
      <style>{`
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

        /* ✅ Mobile: cadre téléphone + centré + plus large */
        @media (max-width: 520px){
          .phoneFrame{
            width: min(92vw, 360px) !important;
            height: 610px !important;
            padding: 10px !important;
            border-radius: 30px !important;
          }
        }

        @media (max-width: 380px){
          .phoneFrame{
            width: min(92vw, 330px) !important;
            height: 580px !important;
          }
        }
      `}</style>
    </main>
  );
}

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

  // ✅ centré propre (flex)
  bottomBand: {
    marginTop: 18,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    textAlign: "center",
    background: "linear-gradient(90deg, #1b2b9d, #6a2fd6, #e64aa7)",
    border: "1px solid rgba(120,140,255,0.25)",
    padding: "14px 16px",
    borderRadius: 14,
    fontSize: "1.05rem",
    fontWeight: 800,
    boxSizing: "border-box",
  },

  // ✅ DEMO
  demoSection: {
    marginTop: 18,
    display: "grid",
    placeItems: "center",
  },
  demoCard: {
    width: "100%",
    maxWidth: 980,
    borderRadius: 18,
    border: "1px solid rgba(120,140,255,0.18)",
    background: "rgba(10, 12, 40, 0.55)",
    boxShadow: "0 18px 70px rgba(0,0,0,0.35)",
    padding: "22px 18px 18px",
    textAlign: "center",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
  demoEyebrow: {
    letterSpacing: "0.28em",
    fontWeight: 900,
    opacity: 0.9,
    fontSize: 12,
  },
  demoTitle: {
    margin: "10px 0 6px",
    fontSize: "clamp(28px, 4.6vw, 44px)",
    fontWeight: 900,
    lineHeight: 1.05,
  },
  demoSubtitle: {
    margin: 0,
    color: "rgba(201,210,255,0.9)",
    fontSize: "1.05rem",
    lineHeight: 1.45,
  },

  phoneWrap: {
    marginTop: 16,
    display: "grid",
    placeItems: "center",
  },
  phoneButton: {
    all: "unset",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  },

  // “smartphone”
  phoneFrame: {
    width: "min(92vw, 420px)",
    height: "min(82vh, 780px)",
    padding: 12,
    borderRadius: 34,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow:
      "0 30px 90px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(0,0,0,0.35)",
    boxSizing: "border-box",
  },
  phoneInner: {
    position: "relative",
    width: "100%",
    height: "100%",
    borderRadius: 26,
    overflow: "hidden",
    background:
      "radial-gradient(700px circle at 30% -10%, rgba(106,47,214,0.35), transparent 55%)," +
      "radial-gradient(700px circle at 90% 20%, rgba(230,74,167,0.22), transparent 55%)," +
      "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.40))",
  },
  // ✅ l’image remplit TOUT (cover)
  phonePoster: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transform: "translateZ(0)",
  },

  playOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(240px circle at 50% 48%, rgba(0,0,0,0.10), rgba(0,0,0,0.45))",
    pointerEvents: "none",
  },
  playIcon: {
    position: "absolute",
    top: "46%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 84,
    height: 84,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontSize: 26,
    color: "white",
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.22)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
  },

  demoCta: {
    marginTop: 16,
    display: "inline-block",
    textDecoration: "none",
    padding: "14px 18px",
    borderRadius: 999,
    fontWeight: 900,
    color: "white",
    background: "linear-gradient(90deg, #3f47d8, #e64aa7)",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "0 16px 40px rgba(230,74,167,0.25)",
  },

  // ✅ Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.62)",
    display: "grid",
    placeItems: "center",
    zIndex: 9999,
    padding: 16,
  },
  modalCard: {
    width: "min(96vw, 520px)",
    maxHeight: "90vh",
    borderRadius: 18,
    overflow: "hidden",
    background: "rgba(10,12,30,0.92)",
    border: "1px solid rgba(255,255,255,0.16)",
    boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
    position: "relative",
  },
  modalClose: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 44,
    height: 44,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(0,0,0,0.35)",
    color: "white",
    fontSize: 26,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    zIndex: 2,
  },
  modalVideo: {
    width: "100%",
    height: "auto",
    maxHeight: "90vh",
    display: "block",
    background: "black",
  },
};
