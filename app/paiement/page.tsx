// app/paiement/page.tsx
"use client";

import React, { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRODUCTS, type ProductKey } from "@/lib/products";

type CartPayload = {
  items?: Array<{
    id: string;
    productKey?: string;
    title?: string;
    price?: string;
    priceLabel?: string;
    subtitle?: string;
  }>;
  updatedAt?: string;
};

type CartLine = {
  productKey: string;
  title: string;
  priceLabel: string;
  subtitle?: string;
};

const CART_KEY = "copyshop_ia_cart";

function parseEuro(label: string): number | null {
  try {
    const s = String(label)
      .replace(/\s/g, "")
      .replace("€", "")
      .replace(",", ".");
    const n = Number.parseFloat(s);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function formatEuro(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

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

export default function PaiementPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"cart" | "single">("cart");
  const [singleKey, setSingleKey] = useState<ProductKey | null>(null);

  const [cartItems, setCartItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ init: lit ?product (compat) + lit panier
  useEffect(() => {
    if (typeof window === "undefined") return;

    const sp = new URLSearchParams(window.location.search);
    const rawKey = sp.get("product") as ProductKey | null;

    if (rawKey && Object.prototype.hasOwnProperty.call(PRODUCTS, rawKey)) {
      setMode("single");
      setSingleKey(rawKey);
    } else {
      setMode("cart");
      setSingleKey(null);
    }

    try {
      const raw = localStorage.getItem(CART_KEY);
      const parsed = raw ? (JSON.parse(raw) as CartPayload) : null;
      const existing = Array.isArray(parsed?.items) ? parsed!.items! : [];

      const mapped: CartLine[] = existing
        .filter((it) => typeof it?.productKey === "string" && it.productKey)
        .map((it) => ({
          productKey: String(it.productKey),
          title: it.title || String(it.productKey),
          priceLabel: it.priceLabel || it.price || "—",
          subtitle: it.subtitle,
        }));

      setCartItems(mapped);
    } catch {
      setCartItems([]);
    }

    setReady(true);
  }, []);

  const singleProduct = useMemo<any | null>(() => {
    if (!singleKey) return null;
    return (PRODUCTS as any)[singleKey] ?? null;
  }, [singleKey]);

  const displayItems: CartLine[] = useMemo(() => {
    if (mode === "single" && singleKey && singleProduct) {
      const title = singleProduct?.name ?? singleProduct?.title ?? "Produit";
      const priceLabel = singleProduct?.priceLabel ?? singleProduct?.price ?? "—";
      return [{ productKey: singleKey, title, priceLabel }];
    }
    return cartItems;
  }, [mode, singleKey, singleProduct, cartItems]);

  const totalNumber = useMemo(() => {
    if (!displayItems.length) return 0;

    const nums = displayItems.map((it) => parseEuro(it.priceLabel));
    if (nums.some((n) => n === null)) return null;

    return (nums as number[]).reduce((a, b) => a + b, 0);
  }, [displayItems]);

  const totalLabel = useMemo(() => {
    if (!displayItems.length) return "0 €";
    if (totalNumber === null) {
      return displayItems.length === 1 ? displayItems[0].priceLabel : "—";
    }
    return formatEuro(totalNumber);
  }, [displayItems, totalNumber]);

  const handlePay = async () => {
    if (!displayItems.length) {
      setError("Ton panier est vide.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload =
        mode === "single" && singleKey
          ? { productKey: singleKey }
          : { items: displayItems.map((it) => ({ productKey: it.productKey })) };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Impossible de créer la session de paiement.");
      }

      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message || "Erreur lors du paiement.");
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <main style={styles.page}>
        <div style={styles.bgGradient} />
        <div style={styles.bgDots} />
        <section style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.title}>Préparation du paiement…</h1>
            <p style={styles.sub}>Chargement de ta commande.</p>
          </div>
        </section>
      </main>
    );
  }

  if (mode === "cart" && !cartItems.length) {
    return (
      <main style={styles.page}>
        <div style={styles.bgGradient} />
        <div style={styles.bgDots} />
        <section style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.title}>Ton panier est vide</h1>
            <p style={styles.sub}>Ajoute un pack ou un service pour payer.</p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              <Link href="/packs-ia" style={styles.btnAlt as any}>Voir les packs IA</Link>
              <Link href="/services-a-la-carte" style={styles.btnAlt as any}>Services à la carte</Link>
              <Link href="/services-digitaux" style={styles.btnAlt as any}>Services digitaux</Link>
            </div>

            <Link href="/panier" style={{ ...styles.btnAlt, marginTop: 12 } as any}>
              ← Retour panier
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.container}>
        <header style={styles.header}>
          <p style={styles.kicker}>PAIEMENT SÉCURISÉ</p>
          <h1 style={styles.title}>Finaliser ta commande</h1>
          <p style={styles.sub}>Paiement via Stripe. Confirmation après paiement.</p>
        </header>

        <article style={styles.card}>
          <div className="payCardHeader" style={styles.cardHeader}>
            <div className="payBadge" style={styles.badge}>
              Stripe
            </div>

            <h2 style={styles.cardTitle}>
              {mode === "single" ? (singleProduct?.name ?? "Produit") : "Récapitulatif du panier"}
            </h2>
          </div>

          {mode === "cart" ? (
            <div style={styles.lines}>
              {displayItems.map((it, idx) => (
                <div key={`${it.productKey}-${idx}`} style={styles.line}>
                  <div style={{ minWidth: 0 }}>
                    <div style={styles.lineTitle}>{it.title}</div>
                    {it.subtitle ? <div style={styles.lineSub}>{it.subtitle}</div> : null}
                  </div>
                  <div style={styles.linePrice}>{it.priceLabel}</div>
                </div>
              ))}
            </div>
          ) : null}

          <div style={styles.priceRow}>
            <div>
              <div style={styles.price}>{totalLabel}</div>
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

          <div style={styles.smallNote}>
            Tu recevras une confirmation de commande après paiement.
          </div>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          <div style={{ marginTop: 10 }}>
            <Link href="/panier" style={styles.backLink as any}>← Retour panier</Link>
          </div>
        </article>
      </section>

      <style>{`
        @media (max-width: 520px) {
          .payCardHeader{
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            align-items: flex-start !important;
          }
          .payBadge{
            position: static !important;
            align-self: flex-end !important;
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
    maxWidth: 860,
    margin: "0 auto",
    padding: "56px 10px 28px",
    position: "relative",
    zIndex: 1,
  },
  header: { textAlign: "center", marginBottom: 22 },
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
  sub: { fontSize: "1.05rem", color: COLORS.muted, margin: 0 },

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
  cardHeader: { position: "relative", minWidth: 0 },
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
    whiteSpace: "nowrap",
  },
  cardTitle: { fontSize: "1.7rem", fontWeight: 900, margin: "6px 0 0" },

  lines: { display: "grid", gap: 10, marginTop: 6 },
  line: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: "12px 12px",
    background: "rgba(2,6,23,0.35)",
  },
  lineTitle: { fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  lineSub: { color: COLORS.muted, fontWeight: 700, fontSize: "0.92rem", marginTop: 4 },
  linePrice: { fontWeight: 900, whiteSpace: "nowrap" },

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
  price: { fontSize: "2rem", fontWeight: 900, color: "#fff" },
  priceNote: { fontSize: "0.95rem", fontWeight: 700, color: "#fff", opacity: 0.9 },

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
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    border: `1px solid ${COLORS.border}`,
    color: COLORS.text,
    background: "rgba(255,255,255,0.06)",
    textDecoration: "none",
    cursor: "pointer",
  },
  smallNote: { marginTop: 6, color: "rgba(255,255,255,0.72)", fontWeight: 700 },
  backLink: { color: COLORS.muted, fontWeight: 800, textDecoration: "none" },

  errorBox: {
    marginTop: 8,
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.35)",
    padding: "10px 12px",
    borderRadius: 10,
    fontWeight: 700,
  },
};
