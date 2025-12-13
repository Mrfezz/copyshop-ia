"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

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
    subtitle:
      "Nom, design, pages, produits, tunnels… tout est généré et cohérent.",
    ctaText: "Voir un exemple",
    ctaLink: "/faq",
  },
];

const FEATURES = [
  {
    title: "Boutique 100% prête",
    text:
      "Pages légales, branding, collections, textes, images. Tu reçois un site vraiment clean.",
    icon: "⚡️",
  },
  {
    title: "Optimisé pour vendre",
    text:
      "Structure pensée conversion : sections, CTA, psychologie d’achat, UX mobile.",
    icon: "🧠",
  },
  {
    title: "Support WhatsApp",
    text:
      "Tu bloques sur un truc ? Tu nous écris et on t’aide direct.",
    icon: "💬",
  },
];

const TESTIMONIALS = [
  {
    name: "Samir",
    text:
      "J’ai reçu ma boutique en 1 journée. J’ai juste ajouté mes produits et c’était carré.",
  },
  {
    name: "Inès",
    text:
      "Le design est trop propre pour le prix. Franchement ça fait premium.",
  },
  {
    name: "Yanis",
    text:
      "L’IA m’a trouvé une niche + angle marketing. J’ai gagné un temps énorme.",
  },
];

const FAQS = [
  {
    q: "Comment fonctionne Copyshop IA ?",
    a: "Tu choisis un pack, tu envoies ton produit (image ou lien) et l’IA génère ta boutique complète.",
  },
  {
    q: "Est-ce que je dois déjà avoir une boutique Shopify ?",
    a: "Non. Si tu n’en as pas, on te crée tout et tu n’as plus qu’à activer l’abonnement Shopify.",
  },
  {
    q: "Combien de temps pour recevoir ma boutique ?",
    a: "En général quelques minutes à quelques heures selon le pack et la charge.",
  },
  {
    q: "L’abonnement Shopify est inclus ?",
    a: "Non. Shopify est un service séparé. Nous on s’occupe de la boutique + design + contenu.",
  },
  {
    q: "Puis-je générer plusieurs boutiques ?",
    a: "Oui, selon ton pack. Basic = 5 boutiques, Premium = 15, Ultime = illimité.",
  },
  {
    q: "Vous faites aussi le Kbis / micro-entreprise ?",
    a: "Oui. Kbis en 24h pour 100€. Écris-nous sur WhatsApp.",
  },
];

function useAutoplay(length: number, delay = 6000) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % length);
    }, delay);
    return () => clearInterval(id);
  }, [length, delay]);
  return [index, setIndex] as const;
}

export default function HomePage() {
  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <HeroSlideshow />
      <ScrollingTextBar text="COPYSHOP IA • Génère ta boutique Shopify • Packs à vie • Support WhatsApp" />
      <VideoSection />
      <FeaturesScrolling />
      <FeaturedProduct />
      <ReviewsSection />
      <MiniSlideshow />
      <HomeFAQ />
      <NewsletterSection />
      <CountdownTimer />
      <ContactSection />

      <style>{responsiveCss}</style>
    </main>
  );
}

/* ---------------- SECTIONS ---------------- */

function HeroSlideshow() {
  const [active, setActive] = useAutoplay(HERO_SLIDES.length, 6500);

  return (
    <section style={styles.heroSection}>
      <div style={styles.heroCard}>
        <div style={styles.heroLeft}>
          <div style={styles.heroKicker}>
            {HERO_SLIDES[active].kicker}
          </div>
          <h1 style={styles.heroTitle}>
            {HERO_SLIDES[active].title}
          </h1>
          <p style={styles.heroSub}>
            {HERO_SLIDES[active].subtitle}
          </p>

          <div style={styles.heroBtns}>
            {HERO_SLIDES[active].ctaText && (
              <a
                href={HERO_SLIDES[active].ctaLink}
                style={styles.primaryBtn}
              >
                {HERO_SLIDES[active].ctaText}
              </a>
            )}
            <a href="https://wa.me/33745214922" style={styles.ghostBtn}>
              WhatsApp
            </a>
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

        <div style={styles.heroRight}>
          <div style={styles.heroGlow} />
          <div style={styles.heroIllustration}>
            <div style={styles.heroIlluRing} />
            <div style={styles.heroIlluInner}>
              <div style={styles.heroIlluText}>IA</div>
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

function FeaturesScrolling() {
  return (
    <section style={styles.section}>
      <div style={styles.sectionInner}>
        <div style={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <article key={f.title} style={styles.featureCard}>
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.h3}>{f.title}</h3>
              <p style={styles.p}>{f.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProduct() {
  return (
    <section style={styles.section}>
      <div style={styles.sectionInner}>
        <div style={styles.split}>
          <div style={styles.mockImage}>
            <div style={styles.mockBadge}>Boutique générée</div>
          </div>

          <div>
            <p style={styles.kicker}>Ce que tu reçois</p>
            <h2 style={styles.h2}>Une boutique complète, pas un template vide.</h2>
            <ul style={styles.checkList}>
              <li style={styles.checkItem}><span style={styles.check}>✓</span> Home optimisée conversion</li>
              <li style={styles.checkItem}><span style={styles.check}>✓</span> Pages : packs, FAQ, contact, services</li>
              <li style={styles.checkItem}><span style={styles.check}>✓</span> Identité visuelle cohérente</li>
              <li style={styles.checkItem}><span style={styles.check}>✓</span> Textes marketing + SEO</li>
            </ul>

            <div style={{ marginTop: 14 }}>
              <a href="/packs-ia" style={styles.primaryBtn}>
                Choisir un pack
              </a>
            </div>
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

        <div style={styles.reviewsGrid}>
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
            <div key={it} style={styles.miniChip}>{it}</div>
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
                  ref={(el) => { refs.current[i] = el; }}
                  style={{
                    ...styles.answerOuter,
                    maxHeight: isOpen
                      ? refs.current[i]?.scrollHeight ?? 0
                      : 0,
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

        <div style={styles.bottomNote}>
          Une autre question ? Écris-nous sur WhatsApp.
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section style={styles.section}>
      <div style={styles.sectionInner}>
        <div style={styles.newsCard}>
          <div>
            <p style={styles.kicker}>Newsletter</p>
            <h2 style={styles.h2}>Promos & nouveautés</h2>
            <p style={styles.p}>
              Reçois des réductions et des conseils pour vendre plus vite.
            </p>
          </div>

          <form
            style={styles.newsForm}
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              required
              placeholder="Ton email"
              style={styles.input}
            />
            <button type="submit" style={styles.primaryBtn}>
              S’abonner
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function CountdownTimer() {
  const target = useMemo(() => new Date("2025-12-01T22:59:00+01:00"), []);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = target.getTime() - now.getTime();
  const expired = diff <= 0;

  const d = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const h = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
  const m = Math.max(0, Math.floor((diff / (1000 * 60)) % 60));
  const s = Math.max(0, Math.floor((diff / 1000) % 60));

  return (
    <section style={styles.section}>
      <div style={styles.sectionInner}>
        <div style={styles.timerCard}>
          <div style={styles.timerLeft}>
            <div style={styles.timerTitle}>Offre spéciale en cours 🔥</div>
            <div style={styles.timerSub}>
              -10% sur le pack Premium cette semaine.
            </div>
          </div>

          <div style={styles.timerRight}>
            {expired ? (
              <div style={styles.timerExpired}>Offre terminée</div>
            ) : (
              <>
                <TimeBox label="Jours" value={d} />
                <TimeBox label="Heures" value={h} />
                <TimeBox label="Minutes" value={m} />
                <TimeBox label="Secondes" value={s} />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimeBox({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.timeBox}>
      <div style={styles.timeValue}>{String(value).padStart(2, "0")}</div>
      <div style={styles.timeLabel}>{label}</div>
    </div>
  );
}

function ContactSection() {
  return (
    <section style={styles.section}>
      <div style={styles.sectionInner}>
        <div style={styles.contactCard}>
          <div>
            <p style={styles.kicker}>Service client</p>
            <h2 style={styles.h2}>Besoin d’aide ?</h2>
            <p style={styles.p}>
              On répond généralement en moins de 8h.
            </p>
          </div>

          <div style={styles.contactBtns}>
            <a href="/contact" style={styles.primaryBtn}>
              Page contact
            </a>
            <a href="https://wa.me/33745214922" style={styles.ghostBtn}>
              WhatsApp direct
            </a>
          </div>
        </div>
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
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 22,
    background: COLORS.panelSoft,
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 22,
    padding: "28px 26px",
    backdropFilter: "blur(6px)",
  },
  heroLeft: { display: "grid", gap: 10 },
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
  heroSub: {
    fontSize: "1.05rem",
    color: COLORS.muted,
    margin: 0,
    maxWidth: 640,
  },
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

  heroRight: {
    position: "relative",
    display: "grid",
    placeItems: "center",
    minHeight: 220,
  },
  heroGlow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: "50%",
    background:
      `radial-gradient(circle, ${COLORS.violet}55, transparent 60%)`,
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
    background:
      `linear-gradient(135deg, ${COLORS.violetDeep}, ${COLORS.violet})`,
    display: "grid",
    placeItems: "center",
    boxShadow: "0 14px 40px rgba(106,47,214,0.5)",
  },
  heroIlluText: {
    fontSize: "3rem",
    fontWeight: 900,
    color: "white",
    letterSpacing: "0.07em",
  },

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

  section: {
    padding: "54px 20px",
    maxWidth: 1200,
    margin: "0 auto",
  },
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
  h2: {
    fontSize: "clamp(1.7rem, 3vw, 2.3rem)",
    fontWeight: 900,
    margin: 0,
  },
  h3: {
    fontSize: "1.2rem",
    fontWeight: 900,
    margin: 0,
  },
  p: {
    color: COLORS.muted,
    fontSize: "1.02rem",
    margin: 0,
    lineHeight: 1.7,
  },

  videoBox: {
    position: "relative",
    borderRadius: 18,
    minHeight: 280,
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
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

  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,minmax(0,1fr))",
    gap: 14,
  },
  featureCard: {
    background: COLORS.panelSoft,
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 16,
    padding: "18px 16px",
    display: "grid",
    gap: 8,
    minHeight: 180,
    backdropFilter: "blur(6px)",
  },
  featureIcon: { fontSize: "1.6rem" },

  split: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
    alignItems: "center",
  },
  mockImage: {
    height: 320,
    borderRadius: 18,
    background:
      "linear-gradient(135deg, rgba(106,47,214,0.3), rgba(58,107,255,0.2))",
    border: `1px solid ${COLORS.panelBorder}`,
    position: "relative",
  },
  mockBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    background: COLORS.panel,
    border: `1px solid ${COLORS.panelBorder}`,
    color: COLORS.text,
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: "0.85rem",
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

  reviewsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,minmax(0,1fr))",
    gap: 14,
  },
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
  faqPlus: {
    fontSize: "1.4rem",
    fontWeight: 900,
    transition: "transform .25s ease, opacity .25s ease",
  },
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
  bottomNote: {
    marginTop: 18,
    textAlign: "center",
    fontWeight: 800,
    color: COLORS.muted,
    fontSize: "1rem",
  },

  newsCard: {
    background: COLORS.panelSoft,
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 18,
    padding: "18px 16px",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 14,
    alignItems: "center",
  },
  newsForm: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "end" },
  input: {
    minWidth: 220,
    padding: "10px 12px",
    borderRadius: 999,
    border: `1px solid ${COLORS.panelBorder}`,
    background: "rgba(0,0,0,0.25)",
    color: COLORS.text,
    outline: "none",
  },

  timerCard: {
    background: COLORS.panelSoft,
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 18,
    padding: "16px 14px",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 12,
    alignItems: "center",
  },
  timerLeft: { display: "grid", gap: 4 },
  timerTitle: { fontWeight: 900, fontSize: "1.2rem" },
  timerSub: { color: COLORS.muted, fontWeight: 700 },
  timerRight: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  timeBox: {
    minWidth: 72,
    textAlign: "center",
    background: "rgba(0,0,0,0.25)",
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 12,
    padding: "8px 10px",
  },
  timeValue: { fontSize: "1.4rem", fontWeight: 900 },
  timeLabel: { fontSize: "0.8rem", color: COLORS.muted, fontWeight: 800 },
  timerExpired: { fontWeight: 900, color: COLORS.muted },

  contactCard: {
    background: COLORS.panelSoft,
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 18,
    padding: "18px 16px",
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },
  contactBtns: { display: "flex", gap: 8, flexWrap: "wrap" },
};

const responsiveCss = `
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 980px) {
    .split { grid-template-columns: 1fr !important; }
  }

  @media (max-width: 900px) {
    .heroCard { grid-template-columns: 1fr !important; }
  }

  @media (max-width: 820px) {
    .featuresGrid { grid-template-columns: 1fr !important; }
    .reviewsGrid { grid-template-columns: 1fr !important; }
    .newsCard { grid-template-columns: 1fr !important; text-align:center; }
  }
`;
