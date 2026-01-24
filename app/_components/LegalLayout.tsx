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

export default function LegalLayout(props: {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children: React.ReactNode;
}) {
  const { title, subtitle, lastUpdated, children } = props;

  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.container}>
        <header style={styles.header}>
          <p style={styles.kicker}>Pages légales</p>
          <h1 style={styles.title}>{title}</h1>

          {(subtitle || lastUpdated) && (
            <p style={styles.sub}>
              {subtitle ? (
                <>
                  {subtitle}
                  <br />
                </>
              ) : null}
              {lastUpdated ? <>Dernière mise à jour : <strong>{lastUpdated}</strong></> : null}
            </p>
          )}
        </header>

        <article style={styles.card}>
          <div className="legal-content" style={styles.content}>
            {children}
          </div>
        </article>
      </section>

      <style>{`
        .legal-content h2{
          margin: 18px 0 10px;
          font-size: 1.25rem;
          font-weight: 900;
        }
        .legal-content p{
          margin: 10px 0;
          color: rgba(255,255,255,0.85);
          line-height: 1.7;
          font-weight: 650;
        }
        .legal-content ul{
          margin: 10px 0 14px 18px;
          color: rgba(255,255,255,0.85);
          line-height: 1.7;
          font-weight: 650;
        }
        .legal-content li{ margin: 6px 0; }
        .legal-content a{
          color: rgba(201,210,255,0.95);
          text-decoration: underline;
          font-weight: 900;
        }
      `}</style>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    padding: "2.2rem 1.25rem 3rem",
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
    maxWidth: 980,
    margin: "0 auto",
    padding: "40px 10px 28px",
    position: "relative",
    zIndex: 1,
  },
  header: { textAlign: "center", marginBottom: 16 },
  kicker: {
    fontSize: "0.8rem",
    color: COLORS.muted,
    fontWeight: 800,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    margin: 0,
  },
  title: {
    fontSize: "clamp(2rem, 4vw, 3.1rem)",
    fontWeight: 900,
    margin: "10px 0 8px",
    letterSpacing: "-0.02em",
  },
  sub: {
    fontSize: "1.02rem",
    color: COLORS.muted,
    margin: 0,
    lineHeight: 1.6,
    fontWeight: 750,
  },
  card: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: "18px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  content: {
    maxWidth: 820,
    margin: "0 auto",
  },
};
