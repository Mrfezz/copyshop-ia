"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";

const COLORS = {
  bgTop: "#0b1026",
  bgMid: "#0f1635",
  bgBottom: "#171a52",

  text: "#eef1ff",
  muted: "#c9d2ff",

  panel: "rgba(13, 18, 50, 0.9)",
  panelSoft: "rgba(13, 18, 50, 0.6)",
  panelBorder: "rgba(150, 170, 255, 0.18)",

  violet: "#6a2fd6",
  violetDeep: "#4338ca",
  pink: "#e64aa7",
  navy: "#0b0f2a",
};

type Slide = {
  kicker?: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
};

const HERO_SLIDES: Slide[] = [
  {
    kicker: "Copyshop IA",
    title: "Génère ta boutique Shopify en quelques minutes.",
    subtitle:
      "Tu envoies un produit (image ou lien). On te livre une boutique complète, prête à vendre.",
    ctaText: "Découvrir les packs",
    ctaLink: "/packs-ia",
  },
  {
    kicker: "Automatique",
    title: "Branding + textes optimisés.",
    subtitle: "Nom, design, pages, produits, tunnels… tout est généré et cohérent.",
    ctaText: "Voir un exemple",
    ctaLink: "/faq",
  },
];

const TESTIMONIALS = [
  {
    name: "Julien",
    text:
      "J’ai reçu ma boutique en quelque minutes. J’ai juste ajouté mes produits et c’était carré.",
  },
  {
    name: "Inès",
    text:
      "Le design est trop propre pour le prix du PACK ESSENTIEL. Franchement ça fait Pro .",
  },
  {
    name: "Hugo",
    text: "L’IA m’a trouvé une niche + angle marketing. J’ai gagné un temps énorme.",
  },
];

const FAQS = [
  {
    q: "Comment fonctionne Copyshop IA ?",
    a: "Tu choisis un pack IA, tu envoies ton produit (image ou lien) et l’IA génère ta boutique complète.",
  },
  {
    q: "Combien de temps pour recevoir ma boutique ?",
    a: "En général quelques minutes à quelques heures selon le pack et la charge.",
  },
  {
    q: "L’abonnement Shopify est inclus ?",
    a: "Non. Shopify est un service séparé. Nous on s’occupe de la boutique + design + contenu.",
  },
];

function useAutoplay(length: number, delay = 6000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % length);
    }, delay);
    return () => window.clearInterval(id);
  }, [length, delay]);

  return [index, setIndex] as const;
}

export default function HomePage() {
  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <HeroSlideshow />

      <ScrollingTextBar text="COPYSHOP IA • Génère ta boutique Shopify • Packs à vie • Formations E-COM • Packs IA Shopify • Services digitaux • Services à la carte" />

      {/* ✅ ON NE TOUCHE PAS À TA DÉMO */}
      <VideoSection />

      {/* ✅ Bloc propre : image téléphone + texte long */}
      <FeaturedProduct />

      <AboutSection />

      <ReviewsSection />
      <MiniSlideshow />
      <HomeFAQ />

      <style>{responsiveCss}</style>
    </main>
  );
}

/* ---------------- SECTIONS ---------------- */

function HeroSlideshow() {
  const [active, setActive] = useAutoplay(HERO_SLIDES.length, 6500);

  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [fixedHeight, setFixedHeight] = useState<number>(0);

  const computeMaxHeight = () => {
    const heights = measureRefs.current.map(
      (el) => el?.getBoundingClientRect().height ?? 0
    );
    const max = Math.max(0, ...heights);
    if (max > 0) setFixedHeight(Math.ceil(max));
  };

  useLayoutEffect(() => {
    computeMaxHeight();
    const raf1 = requestAnimationFrame(() => computeMaxHeight());
    const raf2 = requestAnimationFrame(() => computeMaxHeight());

    const onResize = () => computeMaxHeight();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const cta = HERO_SLIDES[active];

  return (
    <section style={styles.heroSection}>
      <div style={styles.heroCard} className="heroCard">
        <div style={styles.heroLeft}>
          {/* Mesure invisible */}
          <div style={styles.heroMeasureWrap} aria-hidden>
            {HERO_SLIDES.map((s, i) => (
              <div
                key={i}
                ref={(el) => {
                  measureRefs.current[i] = el;
                }}
                style={styles.heroMeasureItem}
              >
                <div style={styles.heroKicker}>{s.kicker}</div>
                <h1 style={styles.heroTitle}>{s.title}</h1>
                <p style={styles.heroSub}>{s.subtitle}</p>

                <div style={styles.heroBtns}>
                  {s.ctaText && <span style={styles.primaryBtn}>{s.ctaText}</span>}
                  <span style={styles.ghostBtn}>Contact</span>
                </div>

                <div style={styles.dotsRow}>
                  {HERO_SLIDES.map((_, j) => (
                    <span key={j} style={styles.dot} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Visible */}
          <div
            style={{
              ...styles.heroSlideWrap,
              minHeight: fixedHeight || undefined,
            }}
          >
            <div style={styles.heroKicker}>{cta.kicker}</div>
            <h1 style={styles.heroTitle}>{cta.title}</h1>
            <p style={styles.heroSub}>{cta.subtitle}</p>

            <div style={styles.heroBtns}>
              {cta.ctaText && cta.ctaLink && (
                <Link href={cta.ctaLink} style={styles.primaryBtn}>
                  {cta.ctaText}
                </Link>
              )}
              <Link href="/contact" style={styles.ghostBtn}>
                Contactez-nous
              </Link>
            </div>

            <div style={styles.dotsRow}>
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  style={{
                    ...styles.dot,
                    opacity: i === active ? 1 : 0.35,
                    transform: i === active ? "scale(1.1)" : "scale(1)",
                  }}
                  aria-label={`slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Rond IA conservé */}
        <div style={styles.heroRight} className="heroRight">
          <div style={styles.heroGlow} className="heroGlow" />
          <div style={styles.heroIllustration} className="heroIllustration">
            <div style={styles.heroIlluRing} className="heroIlluRing" />
            <div style={styles.heroIlluInner} className="heroIlluInner">
              <div style={styles.heroIlluText} className="heroIlluText">
                IA
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScrollingTextBar({ text }: { text: string }) {
  return (
    <section style={styles.scrollBar}>
      <div style={styles.scrollTrack}>
        <div style={styles.scrollText}>{text}</div>
        <div style={styles.scrollText} aria-hidden>
          {text}
        </div>
      </div>
    </section>
  );
}

/* ✅ ON NE TOUCHE PAS À TA DÉMO */
function VideoSection() {
  return (
    <section style={styles.section}>
      <div style={styles.sectionInner}>
        <div style={styles.sectionHeader}>
          <p style={styles.kicker}>Démo rapide</p>
          <h2 style={styles.h2}>Voir comment ça marche</h2>
          <p style={styles.p}>
            Tu envoies ton produit → l’IA génère la boutique → tu reçois un lien prêt à vendre.
          </p>
        </div>

        <div style={styles.videoBox}>
          <div style={styles.videoOverlay}>
            <div style={styles.playBtn}>▶</div>
            <div style={styles.videoNote}>Démo disponible sur WhatsApp</div>
            <a href="https://wa.me/33745214922" style={styles.primaryBtn}>
              Demander la démo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedProduct() {
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!preview) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreview(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [preview]);

  return (
    <section style={styles.section}>
      <div style={styles.sectionInner}>
        <div style={styles.split} className="split">
          {/* ✅ Visu téléphone (vertical) */}
          <div style={styles.phoneColumn}>
            <div
              style={styles.phoneFrame}
              role="button"
              tabIndex={0}
              onClick={() => setPreview(true)}
              onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                if (e.key === "Enter" || e.key === " ") setPreview(true);
              }}
              aria-label="Ouvrir l’aperçu en grand"
            >
              <div style={styles.phoneBezel} />

              <div style={styles.phoneScreen}>
                <img
                  src="/images/boutique-client.jpg"
                  alt="Boutique créée pour un client"
                  style={styles.phoneImg}
                  draggable={false}
                />

                {/* ✅ masque permanent de la barre noire “Livraison OFFERTE…” */}
                <div style={styles.topMask} aria-hidden />

                <div style={styles.mockBadge}>Boutique générée</div>

                <Link
                  href="/services-digitaux#demo"
                  style={styles.videoCtaBtn}
                  onClick={(e) => e.stopPropagation()}
                >
                  Voir la vidéo
                </Link>
              </div>
            </div>
          </div>

          {/* ✅ Texte long */}
          <div>
            <p style={styles.kicker}>Ce que tu reçois</p>
            <h2 style={styles.h2}>Une boutique complète, pas un template vide.</h2>

            <p style={{ ...styles.p, marginTop: 10 }}>
              Ici, l’objectif c’est de te livrer une boutique <strong>prête à vendre</strong>, pas un
              squelette vide. Structure conversion, sections claires, identité visuelle cohérente,
              pages indispensables déjà en place, et une expérience mobile propre.
              <br />
              <br />
              Tu gagnes un temps énorme : tu peux te concentrer sur le produit, le marketing et les pubs.
              Nous, on s’occupe du reste.
            </p>

            <ul style={{ ...styles.checkList, marginTop: 12 }}>
              <li style={styles.checkItem}>
                <span style={styles.check}>✓</span> Home optimisée conversion
              </li>
              <li style={styles.checkItem}>
                <span style={styles.check}>✓</span> Pages : packs, FAQ, contact, services
              </li>
              <li style={styles.checkItem}>
                <span style={styles.check}>✓</span> Identité visuelle cohérente
              </li>
              <li style={styles.checkItem}>
                <span style={styles.check}>✓</span> Textes marketing + SEO
              </li>
            </ul>

            <div style={{ marginTop: 14 }}>
              <Link href="/services-digitaux" style={styles.primaryBtn}>
                Choisir un pack
              </Link>
            </div>
          </div>
        </div>

        {/* ✅ Aperçu grand (même frame + masque barre noire) */}
        {preview && (
          <div
            style={styles.lightbox}
            onClick={() => setPreview(false)}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              style={styles.lightboxClose}
              onClick={(e) => {
                e.stopPropagation();
                setPreview(false);
              }}
              aria-label="Fermer"
            >
              ✕
            </button>

            <div
              style={styles.lightboxCard}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ ...styles.phoneFrame, maxWidth: 520 }}>
                <div style={styles.phoneBezel} />
                <div style={styles.phoneScreen}>
                  <img
                    src="/images/boutique-client.jpg"
                    alt="Aperçu de la boutique"
                    style={styles.phoneImg}
                    draggable={false}
                  />
                  <div style={styles.topMask} aria-hidden />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function AboutSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section style={styles.section}>
      <div style={styles.sectionInner}>
        <div style={styles.aboutHero} className="aboutHero">
          <img
            src="/images/qui-sommes-nous.jpg"
            alt="Qui sommes-nous Copyshop IA"
            style={styles.aboutHeroImg}
          />
          <div style={styles.aboutHeroOverlay} />

          <div style={styles.aboutHeroContent}>
            <p style={styles.aboutKicker}>Qui sommes-nous ?</p>

            <h2 style={styles.aboutTitle}>Copyshop IA, pensé pour aller droit au résultat.</h2>

            <p className={`aboutText ${expanded ? "expanded" : ""}`} style={styles.aboutText}>
              <strong>Copyshop IA</strong> est porté par <strong>Mr Fez™</strong>{" "}
              passionné par le e-commerce, le marketing digital et l&apos;automatisation. Après
              plusieurs projets lancés et accompagnés, l&apos;objectif est simple : te proposer un
              raccourci pour lancer ton business plus sereinement.
              <br />
              <br />
              Chaque pack, chaque service et chaque formation a été pensé pour être{" "}
              <strong>actionnable</strong>, <strong>compréhensible</strong> et adapté à la réalité
              du terrain : petits budgets, manque de temps, besoin de résultats rapides.
            </p>

            <button
              type="button"
              className="aboutToggle"
              onClick={() => setExpanded((v) => !v)}
              style={styles.aboutToggleBtn}
              aria-expanded={expanded}
            >
              {expanded ? "Voir moins" : "Voir plus"}
            </button>

            <Link href="/qui-sommes-nous" style={styles.aboutBtn}>
              Découvrir
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  return (
    <section style={styles.section}>
      <div style={styles.sectionInner}>
        <div style={styles.sectionHeader}>
          <p style={styles.kicker}>Avis</p>
          <h2 style={styles.h2}>Ils ont testé Copyshop IA</h2>
        </div>

        <div style={styles.reviewsGrid} className="reviewsGrid">
          {TESTIMONIALS.map((t) => (
            <article key={t.name} style={styles.reviewCard}>
              <div style={styles.reviewText}>"{t.text}"</div>
              <div style={styles.reviewName}>— {t.name}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniSlideshow() {
  const items = ["Shopify", "IA", "Branding", "Conversion", "Support"];
  return (
    <section style={styles.section}>
      <div style={styles.sectionInner}>
        <div style={styles.miniRow}>
          {items.map((it) => (
            <div key={it} style={styles.miniChip}>
              {it}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeFAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <section style={styles.section}>
      <div style={styles.sectionInner}>
        <div style={styles.sectionHeader}>
          <p style={styles.kicker}>FAQ</p>
          <h2 style={styles.h2}>Questions fréquemment posées</h2>
          <p style={styles.p}>Clique sur une question pour voir la réponse.</p>
        </div>

        <div style={styles.faqWrap}>
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <article key={item.q} style={styles.faqItem}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  style={styles.faqBtn}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span
                    style={{
                      ...styles.faqPlus,
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      opacity: isOpen ? 1 : 0.8,
                    }}
                  >
                    +
                  </span>
                </button>

                <div
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  style={{
                    ...styles.answerOuter,
                    maxHeight: isOpen ? refs.current[i]?.scrollHeight ?? 0 : 0,
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? "translateY(0)" : "translateY(-4px)",
                  }}
                >
                  <div style={styles.answerInner}>{item.a}</div>
                </div>
              </article>
            );
          })}
        </div>

        <div style={styles.bottomNote}>Une autre question ? Écris-nous sur WhatsApp.</div>
      </div>
    </section>
  );
}

/* -------------- STYLES -------------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
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
    zIndex: -3,
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
    zIndex: -2,
    pointerEvents: "none",
  },

  heroSection: {
    padding: "96px 20px 30px",
    maxWidth: 1200,
    margin: "0 auto",
  },
  heroCard: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 22,
    background: COLORS.panelSoft,
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 22,
    padding: "28px 26px",
    backdropFilter: "blur(6px)",
  },

  heroLeft: { display: "grid", gap: 10, position: "relative" },
  heroSlideWrap: { display: "grid", gap: 10, alignContent: "start" },

  heroMeasureWrap: {
    position: "absolute",
    inset: 0,
    visibility: "hidden",
    pointerEvents: "none",
    opacity: 0,
    overflow: "hidden",
  },
  heroMeasureItem: { display: "grid", gap: 10, width: "100%" },

  heroKicker: {
    fontSize: "0.8rem",
    fontWeight: 900,
    color: COLORS.muted,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: "clamp(2.2rem, 4vw, 3.6rem)",
    lineHeight: 1.1,
    fontWeight: 900,
    letterSpacing: "-0.02em",
    margin: 0,
  },
  heroSub: { fontSize: "1.05rem", color: COLORS.muted, margin: 0, maxWidth: 640 },
  heroBtns: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 },

  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    color: "white",
    textDecoration: "none",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    border: `1px solid rgba(255,255,255,0.18)`,
    boxShadow: "0 10px 26px rgba(106,47,214,0.35)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  ghostBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    color: COLORS.text,
    textDecoration: "none",
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${COLORS.panelBorder}`,
  },

  dotsRow: { display: "flex", gap: 8, marginTop: 12 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "white",
    border: "none",
    cursor: "pointer",
    transition: "all .25s ease",
  },

  heroRight: { position: "relative", display: "grid", placeItems: "center", minHeight: 220 },
  heroGlow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${COLORS.violet}55, transparent 60%)`,
    filter: "blur(10px)",
    opacity: 0.9,
  },
  heroIllustration: {
    position: "relative",
    width: 210,
    height: 210,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${COLORS.panelBorder}`,
    display: "grid",
    placeItems: "center",
  },
  heroIlluRing: {
    position: "absolute",
    inset: -8,
    borderRadius: "50%",
    border: `2px dashed rgba(180,200,255,0.35)`,
    animation: "spin 14s linear infinite",
  },
  heroIlluInner: {
    width: 140,
    height: 140,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${COLORS.violetDeep}, ${COLORS.violet})`,
    display: "grid",
    placeItems: "center",
    boxShadow: "0 14px 40px rgba(106,47,214,0.5)",
  },
  heroIlluText: { fontSize: "3rem", fontWeight: 900, color: "white", letterSpacing: "0.07em" },

  scrollBar: {
    marginTop: 16,
    borderTop: `1px solid ${COLORS.panelBorder}`,
    borderBottom: `1px solid ${COLORS.panelBorder}`,
    background: "rgba(255,255,255,0.04)",
    overflow: "hidden",
  },
  scrollTrack: {
    display: "flex",
    whiteSpace: "nowrap",
    gap: 50,
    animation: "marquee 16s linear infinite",
    padding: "10px 0",
  },
  scrollText: {
    fontWeight: 900,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    fontSize: "0.95rem",
    color: COLORS.muted,
  },

  section: { padding: "54px 20px", maxWidth: 1200, margin: "0 auto" },
  sectionInner: { display: "grid", gap: 18 },

  sectionHeader: { display: "grid", gap: 8, textAlign: "center", marginBottom: 8 },

  kicker: {
    fontSize: "0.8rem",
    color: COLORS.muted,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    margin: 0,
  },
  h2: { fontSize: "clamp(1.7rem, 3vw, 2.3rem)", fontWeight: 900, margin: 0 },
  p: { color: COLORS.muted, fontSize: "1.02rem", margin: 0, lineHeight: 1.7 },

  videoBox: {
    position: "relative",
    borderRadius: 18,
    minHeight: 280,
    background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
    border: `1px solid ${COLORS.panelBorder}`,
    overflow: "hidden",
  },
  videoOverlay: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    gap: 12,
    padding: 24,
    textAlign: "center",
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    fontSize: "1.8rem",
    background: "rgba(255,255,255,0.12)",
    border: `1px solid ${COLORS.panelBorder}`,
  },
  videoNote: { fontWeight: 800, color: COLORS.text },

  /* ✅ split: desktop côte à côte */
  split: {
    display: "grid",
    gridTemplateColumns: "0.95fr 1.05fr",
    gap: 24,
    alignItems: "start",
  },

  /* ✅ colonne image centrée */
  phoneColumn: {
    display: "grid",
    justifyItems: "center",
    alignContent: "start",
  },

  /* ✅ frame téléphone (plus long, moins “carré”) */
  phoneFrame: {
    width: "100%",
    maxWidth: 430,
    aspectRatio: "9 / 16",
    borderRadius: 34,
    border: `1px solid ${COLORS.panelBorder}`,
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 20px 55px rgba(0,0,0,0.35)",
    padding: 12,
    position: "relative",
    cursor: "pointer",
  },
  phoneBezel: {
    position: "absolute",
    top: 10,
    left: "50%",
    transform: "translateX(-50%)",
    width: 110,
    height: 26,
    borderRadius: 999,
    background: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.10)",
    zIndex: 5,
  },
  phoneScreen: {
    position: "relative",
    width: "100%",
    height: "100%",
    borderRadius: 26,
    overflow: "hidden",
    background: "rgba(10,12,30,0.65)",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  phoneImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
    objectPosition: "center",
  },

  /* ✅ masque: la barre noire ne sera JAMAIS visible */
  topMask: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 78, // <- ajuste ici si tu veux masquer + ou -
    background:
      `linear-gradient(180deg, ${COLORS.bgTop} 0%, rgba(11,16,38,0.65) 55%, rgba(11,16,38,0) 100%)`,
    zIndex: 4,
    pointerEvents: "none",
  },

  mockBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    background: COLORS.panel,
    border: `1px solid ${COLORS.panelBorder}`,
    color: COLORS.text,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: "0.85rem",
    zIndex: 6,
  },

  videoCtaBtn: {
    position: "absolute",
    right: 14,
    bottom: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    color: "white",
    textDecoration: "none",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "0 10px 26px rgba(106,47,214,0.35)",
    zIndex: 6,
    cursor: "pointer",
  },

  lightbox: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(0,0,0,0.72)",
    display: "grid",
    placeItems: "center",
    padding: 18,
  },
  lightboxCard: {
    width: "min(94vw, 560px)",
    display: "grid",
    placeItems: "center",
  },
  lightboxClose: {
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

  checkList: { listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 8 },
  checkItem: { display: "flex", gap: 8, alignItems: "center", fontWeight: 700 },
  check: {
    width: 20,
    height: 20,
    borderRadius: 6,
    display: "grid",
    placeItems: "center",
    background: COLORS.navy,
    color: "white",
    fontSize: "0.9rem",
    fontWeight: 900,
  },

  aboutHero: {
    position: "relative",
    borderRadius: 22,
    overflow: "hidden",
    minHeight: 380,
    border: `1px solid ${COLORS.panelBorder}`,
    background: "rgba(13, 18, 50, 0.45)",
  },
  aboutHeroImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    filter: "contrast(1.18) brightness(0.62) saturate(1.18)",
    transform: "scale(1.02)",
  },
  aboutHeroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      `linear-gradient(180deg, rgba(11,16,38,0.20) 0%, rgba(11,16,38,0.90) 70%),` +
      `radial-gradient(900px circle at 20% 0%, rgba(106,47,214,0.35), transparent 55%),` +
      `radial-gradient(900px circle at 80% 10%, rgba(230,74,167,0.22), transparent 55%)`,
  },
  aboutHeroContent: {
    position: "relative",
    zIndex: 2,
    textAlign: "center",
    padding: "44px 18px",
    maxWidth: 950,
    margin: "0 auto",
    display: "grid",
    gap: 12,
  },
  aboutKicker: {
    fontSize: "0.85rem",
    fontWeight: 900,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: COLORS.muted,
    margin: 0,
  },
  aboutTitle: { fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 900, margin: 0 },
  aboutText: {
    fontSize: "1.05rem",
    color: "rgba(238,241,255,0.95)",
    lineHeight: 1.75,
    margin: "2px auto 0",
    maxWidth: 860,
  },
  aboutToggleBtn: {
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.10)",
    border: `1px solid ${COLORS.panelBorder}`,
    color: COLORS.text,
    fontWeight: 900,
    cursor: "pointer",
    width: "fit-content",
    justifySelf: "center",
  },
  aboutBtn: {
    marginTop: 8,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 18px",
    borderRadius: 999,
    background: "white",
    color: "#0b1026",
    fontWeight: 900,
    textDecoration: "none",
    width: "fit-content",
    justifySelf: "center",
  },

  reviewsGrid: { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 14 },
  reviewCard: {
    background: COLORS.panelSoft,
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 16,
    padding: "16px 14px",
    display: "grid",
    gap: 8,
  },
  reviewText: { fontSize: "1rem", lineHeight: 1.7 },
  reviewName: { fontWeight: 900, color: COLORS.muted },

  miniRow: { display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" },
  miniChip: {
    background: COLORS.panelSoft,
    border: `1px solid ${COLORS.panelBorder}`,
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 800,
    color: COLORS.text,
  },

  faqWrap: {
    background: COLORS.panelSoft,
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 18,
    padding: 10,
    display: "grid",
    gap: 8,
  },
  faqItem: {
    background: "rgba(255,255,255,0.03)",
    border: `1px solid rgba(255,255,255,0.06)`,
    borderRadius: 12,
    overflow: "hidden",
  },
  faqBtn: {
    width: "100%",
    textAlign: "left",
    background: "transparent",
    border: "none",
    color: COLORS.text,
    fontWeight: 800,
    fontSize: "1.02rem",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
  },
  faqPlus: { fontSize: "1.4rem", fontWeight: 900, transition: "transform .25s ease, opacity .25s ease" },
  answerOuter: {
    overflow: "hidden",
    transition: "max-height .35s ease, opacity .35s ease, transform .35s ease",
    willChange: "max-height, opacity, transform",
  },
  answerInner: {
    padding: "0 16px 14px",
    color: "rgba(255,255,255,0.92)",
    fontSize: "1.02rem",
    lineHeight: 1.7,
    borderTop: "1px dashed rgba(255,255,255,0.08)",
  },
  bottomNote: { marginTop: 18, textAlign: "center", fontWeight: 800, color: COLORS.muted, fontSize: "1rem" },
};

const responsiveCss = `
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ✅ mobile/ tablette: colonne */
  @media (max-width: 980px) {
    .split { grid-template-columns: 1fr !important; }
  }

  @media (max-width: 900px) {
    .heroCard { 
      grid-template-columns: 1fr !important; 
      min-height: auto !important; 
    }
    .heroRight { margin-top: 18px !important; min-height: auto !important; }
    .heroGlow { width: 190px !important; height: 190px !important; filter: blur(8px) !important; opacity: 0.85 !important; }
    .heroIllustration { width: 140px !important; height: 140px !important; }
    .heroIlluInner { width: 90px !important; height: 90px !important; }
    .heroIlluText { font-size: 1.6rem !important; }
  }

  /* ✅ mobile: visu moins haut (il “prend le haut” sans être géant) */
  @media (max-width: 520px) {
    .split > div:first-child {
      justify-items: stretch !important;
    }
  }

  @media (max-width: 820px) {
    .reviewsGrid { grid-template-columns: 1fr !important; }

    .aboutText {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
      -webkit-line-clamp: 6;
    }
    .aboutText.expanded {
      -webkit-line-clamp: unset;
      display: block;
    }
    .aboutToggle {
      display: inline-flex !important;
    }
  }
`;
