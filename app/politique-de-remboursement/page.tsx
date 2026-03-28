// app/politique-de-remboursement/page.tsx
import Link from "next/link";
import React from "react";

const COLORS = {
  bgTop: "#0b1026",
  bgMid: "#0f1635",
  bgBottom: "#171a52",
  text: "#eef1ff",
  muted: "#c9d2ff",
  cardBg: "rgba(14,18,48,0.92)",
  border: "rgba(255,255,255,0.12)",
};

export default function PolitiqueDeRemboursementPage() {
  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.container}>
        <header style={styles.header}>
          <p style={styles.kicker}>Informations légales</p>
          <h1 style={styles.title}>Politique de remboursement</h1>
          <p style={styles.sub}>
            Dernière mise à jour : <strong>{new Date().toLocaleDateString("fr-FR")}</strong>
          </p>

          <div style={styles.topLinks}>
            <Link href="/" style={styles.linkBtn}>← Retour accueil</Link>
            <Link href="/politique-de-confidentialite" style={styles.linkBtnAlt}>
              Politique de confidentialité
            </Link>
          </div>
        </header>

        <article style={styles.card}>
          <h2 style={styles.h2}>1. Produits et services concernés</h2>
          <p style={styles.p}>
            Copyshop IA propose des services numériques (packs IA, recharges, services digitaux,
            formations, livrables numériques, accès à des outils). Les modalités peuvent varier selon
            le produit acheté.
          </p>

          <h2 style={styles.h2}>2. Droit de rétractation (numérique)</h2>
          <p style={styles.p}>
            Pour les contenus numériques et services numériques, l’exécution peut commencer
            immédiatement après paiement. Si l’accès / la livraison a déjà commencé, le remboursement
            peut ne pas être applicable selon la nature du produit et son exécution.
          </p>

          <h2 style={styles.h2}>3. Cas où un remboursement peut être accepté</h2>
          <ul style={styles.ul}>
            <li style={styles.li}>Double paiement avéré sur la même commande.</li>
            <li style={styles.li}>Erreur technique empêchant l’accès au service malgré support.</li>
            <li style={styles.li}>Commande annulée avant démarrage effectif de la prestation (si applicable).</li>
          </ul>

          <h2 style={styles.h2}>4. Cas généralement non remboursables</h2>
          <ul style={styles.ul}>
            <li style={styles.li}>Produit numérique déjà livré / accès déjà fourni.</li>
            <li style={styles.li}>Changement d’avis après livraison.</li>
            <li style={styles.li}>Mauvaise utilisation / mauvaise configuration côté client.</li>
          </ul>

          <h2 style={styles.h2}>5. Procédure</h2>
          <p style={styles.p}>
            Pour toute demande, contacte le support avec : email de commande, date, produit, et une
            explication. Nous reviendrons vers toi dès que possible.
          </p>

          <div style={styles.note}>
            ⚠️ Les conditions ci-dessus s’appliquent conformément à la nature des services et produits proposés.
          </div>
        </article>
      </section>

      <style>{`
        @media (max-width: 720px) {
          h1 { font-size: 2rem !important; }
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
    opacity: 0.55,
    zIndex: -1,
    pointerEvents: "none",
  },
  container: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "56px 10px 28px",
    position: "relative",
    zIndex: 1,
  },
  header: { textAlign: "center", marginBottom: 18 },
  kicker: {
    fontSize: "0.8rem",
    color: COLORS.muted,
    fontWeight: 800,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    margin: 0,
  },
  title: {
    fontSize: "clamp(2.1rem, 4vw, 3.2rem)",
    fontWeight: 900,
    margin: "10px 0 8px",
    letterSpacing: "-0.02em",
  },
  sub: { fontSize: "1.02rem", color: COLORS.muted, margin: 0, lineHeight: 1.6 },

  topLinks: {
    marginTop: 14,
    display: "flex",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  linkBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    color: "#fff",
    textDecoration: "none",
    background: "rgba(255,255,255,0.08)",
    border: `1px solid ${COLORS.border}`,
  },
  linkBtnAlt: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    color: "#fff",
    textDecoration: "none",
    background: "rgba(255,255,255,0.14)",
    border: `1px solid ${COLORS.border}`,
  },

  card: {
    marginTop: 14,
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: "18px",
    boxShadow: "0 14px 45px rgba(0,0,0,0.35)",
  },
  h2: { fontSize: "1.25rem", fontWeight: 900, margin: "14px 0 8px" },
  p: { color: "rgba(255,255,255,0.88)", lineHeight: 1.75, margin: 0, fontWeight: 600 },
  ul: { margin: "8px 0 0", paddingLeft: 18, color: "rgba(255,255,255,0.88)" },
  li: { margin: "6px 0", lineHeight: 1.7, fontWeight: 600 },
  note: {
    marginTop: 14,
    background: "rgba(255,255,255,0.06)",
    border: `1px dashed ${COLORS.border}`,
    padding: "10px 12px",
    borderRadius: 12,
    color: COLORS.muted,
    fontWeight: 800,
  },
};
