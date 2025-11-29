// app/packs-ia/page.tsx
import type React from "react";
import Link from "next/link";

type Pack = {
  title: string;
  price: string;
  subtitle: string;
  bullets: string[];
  recharge?: string;
  popular?: boolean;
  note?: string;
  productKey: "ia-basic" | "ia-premium" | "ia-ultime";
};

const PACKS: Pack[] = [
  {
    title: "Pack Basic IA",
    price: "49,99€",
    subtitle: "Idéal pour démarrer",
    bullets: [
      "Accès à vie à l’outil IA",
      "Génère 5 boutiques Shopify",
      "À partir d’une image ou d’un lien produit",
      "Textes optimisés + branding auto",
    ],
    recharge: "Recharge 5 boutiques : 29,99€ (disponible après achat du pack)",
    productKey: "ia-basic",
  },
  {
    title: "Pack Premium IA",
    price: "99,90€",
    subtitle: "Pour tester plusieurs niches",
    bullets: [
      "Accès à vie à l’outil IA",
      "Génère 15 boutiques Shopify",
      "À partir d’une image ou d’un lien produit",
      "Analyse produit + angles marketing",
      "Support prioritaire",
    ],
    popular: true,
    note: "Le plus choisi",
    recharge: "Recharge 5 boutiques : 29,99€ (disponible après achat du pack)",
    productKey: "ia-premium",
  },
  {
    title: "Pack Ultime IA",
    price: "149,99€",
    subtitle: "Scaling illimité",
    bullets: [
      "Accès à vie à l’outil IA",
      "Génération illimitée de boutiques",
      "À partir d’une image ou d’un lien produit",
      "Branding complet + templates sections",
      "Support VIP",
    ],
    productKey: "ia-ultime",
  },
];

const COLORS = {
  bgTop: "#0b1026",
  bgMid: "#0f1635",
  bgBottom: "#171a52",
  text: "#eef1ff",
  muted: "#c9d2ff",
  cardBg: "#ffffff",
  navy: "#0b0f2a",
  violet: "#6a2fd6",
  violetDeep: "#4338ca",
  pink: "#e64aa7",
  cardBorder: "rgba(11,15,42,0.10)",
};

export default function PacksIAPage() {
  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.container}>
        <header style={styles.header} data-header="packs">
          <div>
            <p style={styles.kicker}>Packs IA Shopify</p>
            <h1 style={styles.title}>Génère tes boutiques avec l’IA.</h1>
            <p style={styles.sub}>
              Tu choisis un pack, tu envoies ton produit (image ou lien),
              et l’IA te génère ta boutique complète en quelques minutes.
            </p>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.headerRightLine}>TROIS PACKS 📦</div>
            <div style={styles.headerRightLine}>UN OBJECTIF 🎯</div>
            <div style={styles.headerRightLine}>RÉUSSIR 🚀</div>
          </div>
        </header>

        <div style={styles.grid} data-grid="packs">
          {PACKS.map((pack) => (
            <article
              key={pack.title}
              className="pack-card"
              style={{
                ...styles.card,
                border: pack.popular
                  ? `2px solid ${COLORS.violet}`
                  : `2px solid ${COLORS.cardBorder}`,
                boxShadow: pack.popular
                  ? "0 14px 45px rgba(106,47,214,0.35)"
                  : "0 10px 30px rgba(0,0,0,0.22)",
                transform: pack.popular ? "translateY(-6px)" : "none",
              }}
            >
              {pack.popular && (
                <div style={styles.popBadge}>
                  {pack.note ?? "Populaire"}
                </div>
              )}

              <h2 style={styles.cardTitle}>{pack.title}</h2>
              <div style={styles.cardSubtitle}>{pack.subtitle}</div>

              <ul style={styles.list}>
                {pack.bullets.map((b, i) => (
                  <li key={i} style={styles.listItem}>
                    <span style={styles.check}>✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {pack.recharge && (
                <div style={styles.rechargeBox}>
                  <span style={{ fontWeight: 800 }}>➕ Option :</span>
                  <div style={{ marginTop: 4 }}>{pack.recharge}</div>
                </div>
              )}

              <div style={styles.priceBar}>
                <div style={styles.priceLeft}>
                  <div style={styles.price}>{pack.price}</div>
                  <div style={styles.priceNote}>Paiement unique</div>
                </div>

                {/* ✅ REDIRECTION VERS /paiement (Stripe) */}
                <Link
                  href={`/paiement?product=${pack.productKey}`}
                  className="pack-cta"
                  style={styles.priceCta}
                >
                  Choisir ce pack
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div style={styles.bottomBand}>
          🧩 Après paiement, tu reçois l’accès privé à l’outil IA.
        </div>
      </section>

      <style>{`
        .pack-card {
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        }
        .pack-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 55px rgba(0,0,0,0.32);
          border-color: rgba(106,47,214,0.9);
        }
        .pack-cta {
          transition: transform .2s ease, background .2s ease;
        }
        .pack-cta:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.2);
        }

        @media (max-width: 980px) {
          div[data-grid="packs"] {
            grid-template-columns: 1fr !important;
          }
          header[data-header="packs"] {
            grid-template-columns: 1fr !important;
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

  header: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "24px",
    alignItems: "center",
    marginBottom: 34,
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
    fontSize: "clamp(2.2rem, 4vw, 3.6rem)",
    fontWeight: 900,
    lineHeight: 1.08,
    margin: "8px 0 8px",
    letterSpacing: "-0.02em",
  },
  sub: {
    color: COLORS.muted,
    fontSize: "1.05rem",
    margin: 0,
  },

  headerRight: {
    justifySelf: "end",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    lineHeight: 1.35,
    fontSize: "1.05rem",
    textAlign: "right",
  },
  headerRightLine: {
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    WebkitBackgroundClip: "text",
    color: "transparent",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
    gap: 18,
  },

  card: {
    position: "relative",
    background: COLORS.cardBg,
    color: COLORS.navy,
    borderRadius: 18,
    padding: "22px 22px 18px",
    display: "flex",
    flexDirection: "column",
    minHeight: 420,
  },

  popBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    color: "white",
    fontWeight: 900,
    fontSize: "0.8rem",
    padding: "6px 12px",
    borderRadius: 999,
    boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
    zIndex: 2,
  },

  cardTitle: {
    fontSize: "1.9rem",
    fontWeight: 900,
    margin: "6px 0 2px",
  },
  cardSubtitle: {
    fontSize: "1.05rem",
    fontWeight: 700,
    opacity: 0.9,
  },

  list: {
    marginTop: 16,
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
  check: {
    width: 22,
    height: 22,
    borderRadius: 4,
    display: "grid",
    placeItems: "center",
    background: COLORS.navy,
    color: "white",
    fontSize: "0.9rem",
    fontWeight: 900,
    flex: "0 0 auto",
    marginTop: 2,
  },

  rechargeBox: {
    marginTop: 12,
    background: "rgba(11,15,42,0.05)",
    border: "1px dashed rgba(11,15,42,0.25)",
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: "0.95rem",
  },

  priceBar: {
    marginTop: 16,
    padding: "12px 14px",
    borderRadius: 12,
    background: `linear-gradient(90deg, ${COLORS.navy} 0%, ${COLORS.violet} 70%, ${COLORS.pink} 100%)`,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  priceLeft: {
    display: "grid",
    gap: 2,
  },
  price: {
    fontSize: "2rem",
    fontWeight: 900,
    letterSpacing: "0.02em",
  },
  priceNote: {
    fontSize: "0.95rem",
    fontWeight: 700,
    opacity: 0.9,
  },

  priceCta: {
    flex: "0 0 auto",
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    color: "white",
    textDecoration: "none",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.28)",
    boxShadow: "0 6px 14px rgba(230,74,167,0.25)",
    whiteSpace: "nowrap",
    textAlign: "center",
  },

  bottomBand: {
    marginTop: 22,
    background: "rgba(10,15,43,0.85)",
    border: "1px solid rgba(120,140,255,0.25)",
    padding: "14px 16px",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 10,
    fontSize: "1.05rem",
    fontWeight: 800,
  },
};
