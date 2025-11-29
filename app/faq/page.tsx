"use client";

import { useRef, useState } from "react";

type FAQItem = {
  q: string;
  a: string;
};

const FAQS: FAQItem[] = [
  {
    q: "Comment fonctionne Copyshop IA ?",
    a: "Tu choisis un pack, puis tu nous envoies ton produit (image ou lien) sur WhatsApp. L’IA génère ta boutique Shopify complète (design + textes + structure) et on te livre le lien prêt à lancer.",
  },
  {
    q: "Est-ce que je dois déjà avoir une boutique Shopify ?",
    a: "Non. Si tu n’en as pas, on peut la créer pour toi. Si tu en as déjà une, l’IA peut aussi travailler dessus (on adapte selon ton cas).",
  },
  {
    q: "Combien de temps pour recevoir ma boutique ?",
    a: "Avec l’IA, c’est généralement en quelques minutes après réception du produit. Pour une demande plus spécifique / sur-mesure, ça peut prendre jusqu’à 24h.",
  },
  {
    q: "L’abonnement Shopify est inclus ?",
    a: "Non. Les packs couvrent la création et la génération de la boutique. L’abonnement Shopify reste à payer directement à Shopify selon l’offre que tu choisis.",
  },
  {
    q: "Puis-je générer plusieurs boutiques ?",
    a: "Oui, ça dépend du pack : Basic = 5 boutiques, Premium = 15, Ultime = illimité. Tu peux aussi prendre des recharges après achat.",
  },
  {
    q: "Vous faites aussi le Kbis / micro-entreprise ?",
    a: "Oui. On s’occupe de la création de micro-entreprise et du Kbis en 24h pour 100€. Écris-nous sur WhatsApp et on te guide.",
  },
];

const COLORS = {
  bgTop: "#0b1026",
  bgMid: "#0f1635",
  bgBottom: "#171a52",

  text: "#eef1ff",
  muted: "#c9d2ff",

  navy: "#0b0f2a",
  cardBorder: "rgba(255,255,255,0.08)",

  violet: "#6a2fd6",
  violetDeep: "#4338ca",
  pink: "#e64aa7",

  qaBg: "rgba(8,12,38,0.92)",
  qaLine: "rgba(255,255,255,0.06)",
};

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // stocke les refs des réponses pour mesurer la hauteur
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  const getHeight = (i: number) => {
    const el = answerRefs.current[i];
    return el ? el.scrollHeight : 0;
  };

  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.container}>
        <header style={styles.header}>
          <p style={styles.kicker}>FAQ</p>
          <h1 style={styles.title}>Questions fréquemment posées</h1>
          <p style={styles.subtitle}>
            Clique sur une question pour voir la réponse.
          </p>
        </header>

        {/* Bloc uni foncé pour la lisibilité */}
        <div style={styles.qaWrap}>
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;

            return (
              <article key={item.q} style={styles.qaItem}>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  style={styles.questionRow}
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                >
                  <span style={styles.questionText}>{item.q}</span>

                  <span
                    style={{
                      ...styles.icon,
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      opacity: isOpen ? 1 : 0.9,
                    }}
                    aria-hidden
                  >
                    +
                  </span>
                </button>

                {/* Animation premium fade + slide via maxHeight/opacity/transform */}
                <div
                  id={`faq-${i}`}
                  style={{
                    ...styles.answerOuter,
                    maxHeight: isOpen ? getHeight(i) : 0,
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen
                      ? "translateY(0px)"
                      : "translateY(-6px)",
                  }}
                >
                  <div
                    ref={(el) => {
                      // IMPORTANT: on ne retourne rien ici sinon TS râle
                      answerRefs.current[i] = el;
                    }}
                    style={styles.answerInner}
                  >
                    {item.a}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div style={styles.bottomNote}>
          Une autre question ? Écris-nous sur WhatsApp.
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          section[data-faq-container]{
            padding: 52px 14px 24px !important;
          }
        }
        @media (prefers-reduced-motion: reduce){
          div[data-answer]{
            transition: none !important;
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
    opacity: 0.6,
    zIndex: -1,
    pointerEvents: "none",
  },

  container: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "64px 20px 28px",
    position: "relative",
    zIndex: 1,
  },

  header: {
    textAlign: "center",
    marginBottom: 22,
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
    fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
    fontWeight: 900,
    lineHeight: 1.08,
    margin: "8px 0 8px",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: "1.05rem",
    margin: 0,
  },

  qaWrap: {
    background: COLORS.qaBg,
    border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: 18,
    padding: 12,
    boxShadow: "0 16px 50px rgba(0,0,0,0.35)",
    backdropFilter: "blur(6px)",
  },

  qaItem: {
    borderRadius: 12,
    overflow: "hidden",
    background: "transparent",
  },

  questionRow: {
    width: "100%",
    background: "rgba(255,255,255,0.02)",
    border: `1px solid ${COLORS.qaLine}`,
    borderRadius: 12,
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    cursor: "pointer",
    color: COLORS.text,
    textAlign: "left",
    fontSize: "1.06rem",
    fontWeight: 800,
    marginBottom: 8,
  },
  questionText: {
    lineHeight: 1.35,
  },
  icon: {
    fontSize: "1.6rem",
    fontWeight: 900,
    color: COLORS.text,
    transition: "transform 220ms ease, opacity 220ms ease",
    flex: "0 0 auto",
  },

  answerOuter: {
    overflow: "hidden",
    transition:
      "max-height 420ms cubic-bezier(0.2, 0.7, 0.2, 1), opacity 260ms ease, transform 260ms ease",
    willChange: "max-height, opacity, transform",
  },
  answerInner: {
    padding: "14px 18px 18px",
    color: "rgba(255,255,255,0.92)",
    fontSize: "1.02rem",
    lineHeight: 1.7,
    borderTop: `1px dashed rgba(255,255,255,0.08)`,
  },

  bottomNote: {
    marginTop: 18,
    textAlign: "center",
    fontWeight: 800,
    color: COLORS.muted,
    fontSize: "1rem",
  },
};
