// app/qui-sommes-nous/page.tsx
import type { CSSProperties } from "react";

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

export default function QuiSommesNousPage() {
  return (
    <main style={styles.page}>
      {/* Fond comme sur les autres pages */}
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.container}>
        {/* HEADER */}
        <header style={styles.header}>
          <p style={styles.kicker}>À PROPOS</p>
          <h1 style={styles.title}>Qui sommes-nous ?</h1>
          <p style={styles.sub}>
            Copyshop IA, c’est un studio spécialisé dans la création de
            boutiques Shopify et d’outils IA pour t’aider à lancer plus vite,
            avec moins de stress technique.
          </p>
        </header>

        {/* MISSION / VISION / APPROCHE */}
        <section
          className="qs-grid-3"
          style={styles.grid3}
          aria-label="Mission, vision et approche"
        >
          <article style={styles.card}>
            <h2 style={styles.cardTitle}>Notre mission</h2>
            <p style={styles.cardText}>
              Te faire gagner un temps fou sur la technique pour que tu te
              concentres enfin sur ce qui rapporte : ton offre, ton marketing
              et tes clients.
            </p>
          </article>

          <article style={styles.card}>
            <h2 style={styles.cardTitle}>Notre vision</h2>
            <p style={styles.cardText}>
              Rendre la création de boutique en ligne aussi simple que remplir
              un formulaire, grâce à l&apos;IA et à des process ultra cadrés.
            </p>
          </article>

          <article style={styles.card}>
            <h2 style={styles.cardTitle}>Notre approche</h2>
            <p style={styles.cardText}>
              Du concret, pas de blabla : des boutiques propres, optimisées
              pour la conversion, un support humain et un suivi WhatsApp quand
              tu en as besoin.
            </p>
          </article>
        </section>

        {/* QUI EST DERRIÈRE + EN BREF */}
        <section
          className="qs-grid-2"
          style={{ ...styles.grid2, marginTop: 28 }}
        >
          <article style={styles.card}>
            <h2 style={styles.cardTitle}>Qui est derrière Copyshop IA ?</h2>
            <p style={styles.cardText}>
              Copyshop IA est porté par <strong>Mr Fez</strong>, passionné par
              le e-commerce, le marketing digital et l&apos;automatisation.
              Après plusieurs projets lancés et accompagnés, l&apos;objectif est
              simple : te proposer un raccourci pour lancer ton business plus
              sereinement.
            </p>
            <p style={styles.cardText}>
              Chaque pack, chaque service et chaque formation a été pensé pour
              être actionnable, compréhensible et adapté à la réalité du
              terrain : petits budgets, manque de temps, besoin de résultats
              rapides.
            </p>
          </article>

          <aside style={styles.highlightCard}>
            <h3 style={styles.highlightTitle}>En bref</h3>
            <ul style={styles.list}>
              <li>• Création et optimisation de boutiques Shopify</li>
              <li>• Packs IA pour générer des boutiques en quelques minutes</li>
              <li>• Services à la carte pour t&apos;aider là où tu bloques</li>
              <li>• Suivi et échanges via WhatsApp quand c&apos;est utile</li>
            </ul>
            <p style={{ ...styles.cardText, marginTop: 6 }}>
              Tu veux en savoir plus ou parler de ton projet ? Utilise le
              bouton WhatsApp du menu ou la page contact, on regarde ça
              ensemble.
            </p>
          </aside>
        </section>

        {/* VALEURS */}
        <section style={{ marginTop: 32 }}>
          <h2 style={{ ...styles.cardTitle, marginBottom: 14 }}>
            Nos 3 valeurs principales
          </h2>

          <div className="qs-grid-3" style={styles.grid3}>
            <article style={styles.cardSoft}>
              <p style={styles.valueTitle}>Transparence</p>
              <p style={styles.cardText}>
                Pas de promesses magiques. Tu sais exactement ce que tu achètes
                et ce qu&apos;on met en place pour toi.
              </p>
            </article>

            <article style={styles.cardSoft}>
              <p style={styles.valueTitle}>Simplicité</p>
              <p style={styles.cardText}>
                Process guidé, peu de jargon, et un accompagnement étape par
                étape pour ne pas te perdre.
              </p>
            </article>

            <article style={styles.cardSoft}>
              <p style={styles.valueTitle}>Résultats</p>
              <p style={styles.cardText}>
                L&apos;objectif, c&apos;est que ta boutique soit en ligne,
                crédible et prête à encaisser, pas juste “jolie sur Figma”.
              </p>
            </article>
          </div>
        </section>
      </section>

      {/* Responsive */}
      <style>{`
        @media (max-width: 980px) {
          .qs-grid-3 {
            grid-template-columns: 1fr !important;
          }
          .qs-grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
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
    textAlign: "center",
    marginBottom: 30,
  },
  kicker: {
    fontSize: "0.8rem",
    color: COLORS.muted,
    fontWeight: 800,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
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
    maxWidth: 640,
    marginInline: "auto",
    lineHeight: 1.6,
  },

  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
    gap: 20,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 20,
    alignItems: "stretch",
  },

  card: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: "18px 18px 20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  cardSoft: {
    background: "rgba(14,18,48,0.85)",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: "16px 16px 18px",
  },
  cardTitle: {
    fontWeight: 900,
    fontSize: "1.25rem",
    margin: "0 0 8px",
  },
  cardText: {
    fontSize: "0.98rem",
    color: COLORS.muted,
    lineHeight: 1.6,
    margin: 0,
  },

  highlightCard: {
    background:
      "linear-gradient(135deg, rgba(106,47,214,0.18), rgba(230,74,167,0.12))",
    border: "1px solid rgba(148,163,255,0.5)",
    borderRadius: 18,
    padding: "18px 18px 20px",
    boxShadow: "0 14px 40px rgba(0,0,0,0.4)",
  },
  highlightTitle: {
    fontSize: "1.05rem",
    fontWeight: 800,
    color: COLORS.text,
    margin: "0 0 10px",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: 4,
    fontSize: "0.96rem",
    color: COLORS.text,
  },
  valueTitle: {
    fontWeight: 800,
    margin: "0 0 6px",
    fontSize: "1rem",
    color: COLORS.text,
  },
};
