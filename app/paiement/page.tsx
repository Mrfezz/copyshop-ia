// app/paiement/page.tsx
"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";
import { PRODUCTS, type ProductKey } from "@/lib/products";

type ProductLike = {
  name: string;
  price?: string;
  priceLabel?: string;
  description?: string;
  desc?: string;
  points?: string[];
  bullets?: string[];
};

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

// ✅ Texte de secours si un produit n’a pas de description
const DEFAULT_DESCS: Partial<Record<ProductKey, string>> = {
  // Services digitaux
  "services-essentiel":
    "Le pack parfait pour lancer ta boutique vite et proprement. Base solide, pro et prête à vendre.",
  "services-pro":
    "Passe au niveau supérieur : accompagnement + administratif + sourcing pour sécuriser ton business.",
  "services-business":
    "Lancement premium clé en main : optimisation complète, fournisseur géré et boutique prête à scaler.",

  // Packs IA
  "ia-basic":
    "Accès immédiat à Copyshop IA pour générer ta boutique Shopify en quelques minutes.",
  "ia-premium":
    "Le meilleur équilibre pour tester plusieurs niches et accélérer tes résultats avec l’IA.",
  "ia-ultime":
    "Scaling illimité : génération sans limite + branding complet. Le pack ultime pour aller très loin.",

  // À la carte
  "kbis-24h":
    "On crée ta micro-entreprise/société et tu reçois ton Kbis rapidement. Zéro stress administratif.",
  "logo-shopify":
    "Un logo pro + mini charte graphique pour rendre ta boutique crédible dès le premier regard.",
  "contact-fournisseur":
    "On te trouve un fournisseur fiable, on vérifie, puis on te met en relation pour que tu puisses vendre sereinement.",
  "shopify-paiement":
    "Activation complète des paiements Shopify pour encaisser sans blocage et vendre direct.",
  "reseaux-sociaux":
    "On te prépare des réseaux propres et cohérents (Insta, FB, TikTok) prêts à convertir.",
  "flyer-image-video":
    "Flyer pro + version vidéo/story pour Meta, TikTok et Snap. Prêt pour lancer ta pub.",
  "recharge-ia":
    "Ajoute 5 boutiques IA supplémentaires à ton pack pour tester encore plus de produits.",
  "optimisation-boutique":
    "Audit + optimisation (homepage, produit, upsell) pour booster ton taux d’achat et tes conversions.",
};

export default function PaiementPage() {
  const router = useRouter();

  // ✅ on lit ?product= côté client uniquement
  const [keyParam, setKeyParam] = useState<ProductKey | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sp = new URLSearchParams(window.location.search);
    const rawKey = sp.get("product") as ProductKey | null;

    if (rawKey && rawKey in PRODUCTS) {
      setKeyParam(rawKey);
    } else {
      setKeyParam(null);
    }

    setReady(true);
  }, []);

  const product = useMemo<ProductLike | null>(() => {
    if (!keyParam) return null;
    return PRODUCTS[keyParam] as unknown as ProductLike;
  }, [keyParam]);

  const priceLabel = product?.priceLabel ?? product?.price ?? "—";

  const rawDescription = product?.description ?? product?.desc ?? "";
  const description =
    rawDescription.trim() ||
    (keyParam ? DEFAULT_DESCS[keyParam] : "") ||
    "Accès immédiat après paiement. Support Copyshop inclus.";

  const points: string[] | null = product?.points ?? product?.bullets ?? null;

  const handlePay = async () => {
    if (!product || !keyParam) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ le backend attend productKey
        body: JSON.stringify({ productKey: keyParam }),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(
          data?.error || "Impossible de créer la session de paiement."
        );
      }

      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || "Erreur lors du paiement.");
      setLoading(false);
    }
  };

  // ✅ 1) Pendant le premier rendu (SSR + avant useEffect)
  if (!ready) {
    return (
      <main style={styles.page}>
        <div style={styles.bgGradient} />
        <div style={styles.bgDots} />

        <section style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.title}>Préparation du paiement…</h1>
            <p style={styles.sub}>
              Merci de patienter, on charge ton produit Copyshop IA.
            </p>
          </div>
        </section>
      </main>
    );
  }

  // ✅ 2) Après lecture des params : produit introuvable
  if (!product) {
    return (
      <main style={styles.page}>
        <div style={styles.bgGradient} />
        <div style={styles.bgDots} />

        <section style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.title}>Produit introuvable</h1>
            <p style={styles.sub}>
              Le lien de paiement est invalide ou incomplet.
            </p>

            <button onClick={() => router.push("/")} style={styles.btnAlt}>
              Retour à l’accueil
            </button>
          </div>
        </section>
      </main>
    );
  }

  // ✅ 3) Produit OK
  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.container}>
        <header style={styles.header}>
          <p style={styles.kicker}>PAIEMENT SÉCURISÉ</p>
          <h1 style={styles.title}>Finaliser ta commande</h1>
          <p style={styles.sub}>
            Tu es à un clic de débloquer ton accès Copyshop IA.
          </p>
        </header>

        <article style={styles.card}>
          <div style={styles.badge}>Paiement unique</div>

          <h2 style={styles.cardTitle}>{product.name}</h2>

          <p style={styles.desc}>{description}</p>

          {points?.length ? (
            <ul style={styles.list}>
              {points.map((p) => (
                <li key={p} style={styles.listItem}>
                  <span style={styles.check}>✓</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div style={styles.priceRow}>
            <div>
              <div style={styles.price}>{priceLabel}</div>
              <div style={styles.priceNote}>Paiement unique</div>
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              style={{
                ...styles.btnPay,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Redirection vers Stripe..." : "Payer maintenant"}
            </button>
          </div>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}
        </article>
      </section>
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
    maxWidth: 860,
    margin: "0 auto",
    padding: "56px 10px 28px",
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
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    margin: 0,
  },

  title: {
    fontSize: "clamp(2.1rem, 4vw, 3.0rem)",
    fontWeight: 900,
    margin: "8px 0 6px",
  },

  sub: {
    fontSize: "1.05rem",
    color: COLORS.muted,
    margin: 0,
  },

  card: {
    position: "relative",
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: "22px",
    boxShadow: "0 12px 35px rgba(0,0,0,0.35)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  badge: {
    position: "absolute",
    top: 14,
    right: 14,
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    color: "#fff",
    fontWeight: 900,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: "0.8rem",
  },

  cardTitle: {
    fontSize: "1.7rem",
    fontWeight: 900,
    margin: "6px 0 0",
  },

  desc: {
    color: COLORS.muted,
    margin: "4px 0 8px",
    lineHeight: 1.5,
  },

  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: 8,
  },

  listItem: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
  },

  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    background: "rgba(255,255,255,0.08)",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    color: "#fff",
    flex: "0 0 auto",
    marginTop: 2,
  },

  priceRow: {
    marginTop: 10,
    padding: "12px 14px",
    borderRadius: 12,
    background: `linear-gradient(90deg, #0b0f2a 0%, ${COLORS.violet} 70%, ${COLORS.pink} 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
  },

  price: {
    fontSize: "2rem",
    fontWeight: 900,
    color: "#fff",
  },

  priceNote: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#fff",
    opacity: 0.9,
  },

  btnPay: {
    padding: "10px 16px",
    borderRadius: 999,
    fontWeight: 900,
    border: "none",
    color: "#fff",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    boxShadow: "0 8px 18px rgba(106,47,214,0.35)",
    whiteSpace: "nowrap",
  },

  btnAlt: {
    marginTop: 8,
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    border: `1px solid ${COLORS.border}`,
    color: COLORS.text,
    background: "rgba(255,255,255,0.06)",
    cursor: "pointer",
  },

  errorBox: {
    marginTop: 8,
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.35)",
    padding: "10px 12px",
    borderRadius: 10,
    fontWeight: 700,
  },
};
