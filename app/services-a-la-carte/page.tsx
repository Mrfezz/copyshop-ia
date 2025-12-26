"use client";

// app/services-a-la-carte/page.tsx
import Link from "next/link";
import type React from "react";
import { useRouter } from "next/navigation";

type Service = {
  title: string;
  price: string;
  desc: string;
  tag?: string;
  productKey:
    | "kbis-24h"
    | "logo-shopify"
    | "nom-domaine"
    | "contact-fournisseur"
    | "shopify-paiement"
    | "reseaux-sociaux"
    | "flyer-image-video"
    | "recharge-ia"
    | "optimisation-boutique";
  isNew?: boolean;
};

const SERVICES: Service[] = [
  {
    title: "Création Kbis en 24h",
    price: "100€",
    desc: "On s’occupe de la création de ta micro-entreprise/société et on te livre ton Kbis rapidement.",
    tag: "Administratif",
    productKey: "kbis-24h",
  },
  {
    title: "Logo boutique Shopify",
    price: "119,99€",
    desc: "Logo professionnel + mini charte graphique pour une boutique crédible et prête à vendre.",
    tag: "Branding",
    productKey: "logo-shopify",
  },
  {
    title: "Nom de domaine (mise en ligne + configuration)",
    price: "49,99€",
    desc: "Recherche d’un nom disponible (nomdeboutique.fr ou nomdeboutique.com), achat et configuration complète avec ta boutique Shopify, mise en ligne sur Google. Validité 1 an (renouvellement non pris en charge).",
    tag: "Nom de domaine",
    productKey: "nom-domaine",
    isNew: true,
  },
  {
    title: "Contact fournisseur (Chine / Émirats)",
    price: "120€",
    desc: "Sourcing + prise de contact + vérification basique, puis mise en relation avec un fournisseur fiable.",
    tag: "Fournisseur",
    productKey: "contact-fournisseur",
  },
  {
    title: "Activation Shopify Payments",
    price: "39,99€",
    desc: "Configuration complète pour activer les paiements Shopify et encaisser sans blocage.",
    tag: "Paiement",
    productKey: "shopify-paiement",
  },
  {
    title: "Création réseaux sociaux",
    price: "49,99€",
    desc: "Création/optimisation de tes pages Instagram, Facebook et TikTok avec un branding cohérent.",
    tag: "Social",
    productKey: "reseaux-sociaux",
  },
  {
    title: "Création flyer image & vidéo",
    price: "100€",
    desc: "Flyer pro (image) + version vidéo/story prête pour Meta Ads, TikTok Ads et Snapchat.",
    tag: "Visuels",
    productKey: "flyer-image-video",
  },
  {
    title: "Recharge boutiques IA",
    price: "29,99€",
    desc: "Ajoute 5 boutiques IA supplémentaires à ton pack Basic/Premium.",
    tag: "Recharge",
    productKey: "recharge-ia",
  },
  {
    title: "Optimisation boutique (conversion)",
    price: "179,99€",
    desc: "Audit + optimisation homepage, page produit et upsells pour booster ton taux d’achat.",
    tag: "Optimisation",
    productKey: "optimisation-boutique",
  },
];

export default function ServicesALaCartePage() {
  const router = useRouter();

  function saveCartAndGo(service: Service) {
    try {
      const cartKey = "copyshop_ia_cart";

      const payload = {
        items: [
          {
            id: `service:${service.productKey}`,
            productKey: service.productKey,
            title: service.title,
            price: service.price,
            priceLabel: service.price,
            subtitle: service.tag ?? "",
          },
        ],
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(cartKey, JSON.stringify(payload));
    } catch (e) {
      console.error("cart save error", e);
      // même si localStorage échoue, on redirige quand même
    }

    router.push("/panier");
  }

  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.hero}>
        <p style={styles.kicker}>SERVICES À LA CARTE</p>
        <h1 style={styles.heroTitle}>Besoin d’un service précis ?</h1>
        <p style={styles.heroDesc}>
          Choisis ce dont tu as besoin, on le fait pour toi rapidement.
        </p>
      </section>

      <section className="gridCards" style={styles.grid}>
        {SERVICES.map((s) => (
          <article key={s.title} style={styles.card}>
            {/* Ligne du haut : Nouveau + Tag de catégorie */}
            <div style={styles.cardTop}>
              {s.isNew && <span style={styles.newBadge}>Nouveau</span>}
              {s.tag && <span style={styles.tag}>{s.tag}</span>}
            </div>

            <h2 style={styles.cardTitle}>{s.title}</h2>

            {s.productKey === "nom-domaine" && (
              <div style={styles.domainBadge}>
                <span style={styles.domainDot} />
                <span>.fr</span>
                <span style={styles.domainSeparator}>•</span>
                <span>.com</span>
              </div>
            )}

            <p style={styles.cardDesc}>{s.desc}</p>

            <div style={styles.priceRow}>
              <div style={styles.price}>{s.price}</div>
              <Link
                href="/panier"
                style={styles.btn}
                onClick={(e) => {
                  e.preventDefault();
                  saveCartAndGo(s);
                }}
              >
                Commander
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section style={styles.bottom}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 900 }}>
            Tu veux plutôt un pack complet ?
          </h3>
          <p style={{ marginTop: 6, color: "#c9d2ff" }}>
            Regarde les Services digitaux personnalisés.
          </p>
        </div>
        <Link href="/services-digitaux" style={styles.btnGhost}>
          Voir les packs
        </Link>
      </section>

      <div style={{ textAlign: "center", marginTop: 18 }}>
        <Link href="/" style={styles.linkBack}>
          ← Retour accueil
        </Link>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .gridCards { grid-template-columns: 1fr !important; }
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

  hero: { maxWidth: 1100, margin: "0 auto 2.2rem" },
  kicker: {
    letterSpacing: "0.35em",
    fontSize: "0.8rem",
    fontWeight: 800,
    opacity: 0.8,
    margin: 0,
  },
  heroTitle: {
    fontSize: "clamp(2.1rem, 4vw, 3.1rem)",
    fontWeight: 900,
    margin: "0.7rem 0 0.4rem",
  },
  heroDesc: { color: "#c9d2ff", margin: 0, fontSize: "1.05rem" },

  grid: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
    gap: "1rem",
  },

  card: {
    background: "rgba(13,18,45,0.95)",
    borderRadius: 18,
    padding: "1.4rem 1.2rem 1.2rem",
    border: "1px solid rgba(120,140,255,0.35)",
    boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    minHeight: 220,
    position: "relative",
    overflow: "hidden",
  },

  // 🔹 nouvelle ligne haut de carte
  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  newBadge: {
    padding: "0.16rem 0.55rem",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: "0.65rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    background:
      "linear-gradient(90deg, rgba(236,72,153,0.9), rgba(129,140,248,0.95))",
    color: "#fff",
    boxShadow: "0 0 14px rgba(236,72,153,0.35)",
    whiteSpace: "nowrap",
  },

  tag: {
    padding: "0.16rem 0.5rem",
    borderRadius: 999,
    fontWeight: 800,
    fontSize: "0.7rem",
    background: "rgba(255,255,255,0.12)",
    whiteSpace: "nowrap",
  },

  domainBadge: {
    marginTop: 6,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "0.2rem 0.55rem",
    borderRadius: 999,
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#e5e7ff",
    background:
      "linear-gradient(90deg, rgba(30,64,175,0.6), rgba(139,92,246,0.9))",
    border: "1px solid rgba(191,219,254,0.6)",
  },

  domainDot: {
    width: 6,
    height: 6,
    borderRadius: "999px",
    background: "#22c55e",
  },

  domainSeparator: {
    opacity: 0.7,
  },

  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: 900,
    margin: 0,
    paddingRight: "90px",
  },

  cardDesc: {
    marginTop: 8,
    color: "#c9d2ff",
    fontSize: "0.98rem",
    flex: 1,
  },

  priceRow: {
    marginTop: 12,
    background: "linear-gradient(90deg,#1e1b4b,#4338ca,#7c3aed)",
    padding: "0.7rem 0.8rem",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.6rem",
  },
  price: { fontSize: "1.4rem", fontWeight: 900, color: "white" },

  btn: {
    padding: "0.5rem 0.9rem",
    borderRadius: 999,
    background: "white",
    color: "#0b1026",
    fontWeight: 900,
    textDecoration: "none",
    fontSize: "0.9rem",
    whiteSpace: "nowrap",
  },

  bottom: {
    maxWidth: 1100,
    margin: "1.6rem auto 0",
    borderRadius: 18,
    padding: "1.2rem",
    background:
      "linear-gradient(180deg, rgba(18,25,68,0.95), rgba(10,15,38,0.95))",
    border: "1px solid rgba(120,140,255,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  },

  btnGhost: {
    padding: "0.75rem 1.1rem",
    borderRadius: 999,
    border: "1px solid rgba(120,140,255,0.55)",
    color: "#eef1ff",
    background: "rgba(10,15,38,0.35)",
    fontWeight: 800,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
  },

  linkBack: {
    color: "#c9d2ff",
    textDecoration: "none",
    fontWeight: 700,
  },
};
