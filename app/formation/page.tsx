// app/formation/page.tsx
import Link from "next/link";

type Formula = {
  title: string;
  subtitle: string;
  price: string;
  bullets: string[];
  tag: string;
  accent: {
    border: string;
    tagBg: string;
    priceBg: string;
    btnBg: string;
  };
};

const PRIMARY_GRADIENT =
  "linear-gradient(90deg,#4338ca,#6a2fd6,#e64aa7)";
const PRICE_GRADIENT_SOFT =
  "linear-gradient(90deg,#0b0f2a 0%, #4f46e5 65%, #e64aa7 100%)";
const PRICE_GRADIENT_STRONG =
  "linear-gradient(90deg,#0b0f2a 0%, #6a2fd6 65%, #ec4899 100%)";

const FORMULAS: Formula[] = [
  {
    title: "FORMATION E-COMMERCE Débutant",
    subtitle: "Débutant → Autonome",
    price: "999€",
    tag: "Débutant",
    bullets: [
      "Bases du e-commerce & du dropshipping expliquées simplement",
      "Choix de la niche et du bon positionnement",
      "Création et paramétrage complet de la boutique",
      "Méthode pour trouver des produits gagnants",
      "Introduction à la publicité (Meta Ads / TikTok Ads)",
      "Retours personnalisés sur ton projet",
    ],
    accent: {
      border: "rgba(99,102,241,0.9)",
      tagBg: PRIMARY_GRADIENT,
      priceBg: PRICE_GRADIENT_SOFT,
      btnBg: PRIMARY_GRADIENT,
    },
  },
  {
    title: "FORMATION E-COM Accompagnement avancé",
    subtitle: "Pour structurer et scaler fort",
    price: "1899€",
    tag: "Avancé",
    bullets: [
      "Tout le contenu de la Formule 1",
      "Stratégie de marque (branding, offre, différenciation)",
      "Optimisation du tunnel de vente (AOV, upsell, cross-sell)",
      "Publicité avancée : structure de campagnes & analyse des chiffres",
      "Mise en place du retargeting et des emails",
      "Suivi rapproché et sessions 1:1 dédiées à ton business",
    ],
    accent: {
      border: "rgba(236,72,153,0.9)",
      tagBg: PRIMARY_GRADIENT,
      priceBg: PRICE_GRADIENT_STRONG,
      btnBg: PRIMARY_GRADIENT,
    },
  },
];

function FormulaCard({ f }: { f: Formula }) {
  return (
    <article style={{ ...styles.card, borderColor: f.accent.border }}>
      <div style={{ ...styles.tag, background: f.accent.tagBg }}>{f.tag}</div>

      <h2 style={styles.cardTitle}>{f.title}</h2>
      <p style={styles.cardSubtitle}>{f.subtitle}</p>

      <ul style={styles.list}>
        {f.bullets.map((b) => (
          <li key={b} style={styles.listItem}>
            <span style={styles.check}>✓</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div style={{ ...styles.priceBar, background: f.accent.priceBg }}>
        <div style={styles.price}>{f.price}</div>
        <a
          href="https://wa.me/33745214922"
          target="_blank"
          rel="noreferrer"
          style={{ ...styles.btn, background: f.accent.btnBg }}
        >
          Réserver un appel découverte
        </a>
      </div>
    </article>
  );
}

export default function FormationPage() {
  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.hero}>
        <p style={styles.kicker}>FORMATIONS E-COMMERCE</p>
        <h1 style={styles.heroTitle}>Se former sérieusement au e-commerce.</h1>
        <p style={styles.heroDesc}>
          Deux formules pour t'accompagner : que tu partes de zéro ou que tu veuilles structurer
          et scaler ton activité.
        </p>
      </section>

      <section style={styles.grid}>
        {FORMULAS.map((f) => (
          <FormulaCard key={f.title} f={f} />
        ))}
      </section>

      <section style={styles.note}>
        💡 Pense à la partie administrative (CPF, financement, etc.) avant de communiquer.
        La mention "CPF éligible" ne doit être utilisée que si ta formation est réellement enregistrée et validée.
      </section>

      <div style={{ textAlign: "center", marginTop: 18 }}>
        <Link href="/" style={styles.linkBack}>← Retour accueil</Link>
      </div>

      <style>{`
        @media (max-width: 980px){
          section[data-grid-formation]{
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
    color: "#eef1ff",
    overflow: "hidden",
  },
  bgGradient: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(1200px circle at 10% -10%, #3a6bff33, transparent 50%)," +
      "radial-gradient(900px circle at 90% 10%, #8b5cf633, transparent 45%)," +
      "linear-gradient(180deg, #0b1026 0%, #0f1635 45%, #171a52 100%)",
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

  hero: {
    maxWidth: 1100,
    margin: "0 auto 2.2rem",
  },
  kicker: {
    letterSpacing: "0.35em",
    fontSize: "0.8rem",
    fontWeight: 800,
    opacity: 0.8,
    margin: 0,
  },
  heroTitle: {
    fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
    fontWeight: 900,
    margin: "0.7rem 0 0.4rem",
  },
  heroDesc: { color: "#c9d2ff", margin: 0, fontSize: "1.05rem" },

  grid: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0,1fr))",
    gap: "1.2rem",
  },

  card: {
    background: "rgba(13,18,45,0.95)",
    borderRadius: 20,
    padding: "1.3rem",
    border: "2px solid transparent",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    minHeight: 420,
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  },
  tag: {
    position: "absolute",
    top: 14,
    right: 14,
    padding: "0.35rem 0.7rem",
    color: "white",
    fontWeight: 900,
    borderRadius: 999,
    fontSize: "0.8rem",
  },

  cardTitle: { fontSize: "1.6rem", fontWeight: 900, margin: "1.2rem 0 0.2rem" },
  cardSubtitle: { margin: 0, color: "#b9c2ff", fontWeight: 700 },

  list: {
    marginTop: "1rem",
    listStyle: "none",
    padding: 0,
    display: "grid",
    gap: "0.55rem",
    flex: 1,
  },
  listItem: {
    display: "flex",
    gap: "0.55rem",
    alignItems: "flex-start",
    fontSize: "1rem",
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    background: "#0f172a",
    color: "white",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: "0.85rem",
    marginTop: 1,
  },

  priceBar: {
    marginTop: "1rem",
    padding: "0.9rem 1rem",
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "white",
    gap: "0.6rem",
    flexWrap: "wrap",
  },
  price: { fontSize: "1.9rem", fontWeight: 900 },
  btn: {
    padding: "0.7rem 1.1rem",
    borderRadius: 999,
    color: "white",
    fontWeight: 900,
    textDecoration: "none",
    fontSize: "0.95rem",
    border: "1px solid rgba(255,255,255,0.25)",
    background: PRIMARY_GRADIENT,
    whiteSpace: "nowrap",
  },

  note: {
    maxWidth: 1100,
    margin: "1.6rem auto 0",
    background: "rgba(10,15,43,0.8)",
    border: "1px dashed rgba(255,255,255,0.25)",
    borderRadius: 14,
    padding: "1rem 1.1rem",
    fontSize: "0.95rem",
  },
  linkBack: { color: "#c9d2ff", textDecoration: "none", fontWeight: 700 },
};
