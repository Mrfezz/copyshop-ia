"use client";

// app/panier/page.tsx
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

const COLORS = {
  bgTop: "#0b1026",
  bgMid: "#0f1635",
  bgBottom: "#171a52",
  text: "#eef1ff",
  muted: "#c9d2ff",

  panel: "rgba(14,18,48,0.92)",
  panelSoft: "rgba(13, 18, 50, 0.90)",
  border: "rgba(255,255,255,0.12)",

  violet: "#6a2fd6",
  violetDeep: "#4338ca",
  pink: "#e64aa7",
};

const BRAND_GRADIENT = `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`;

type CartItem = {
  id: string;
  title: string;
  priceLabel: string;
};

export default function PanierPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  // ✅ panier simple (placeholder). Tu pourras le brancher à Stripe/DB ensuite.
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    let ignore = false;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!ignore) {
        setSession(data.session ?? null);
        setChecking(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const userEmail = session?.user?.email ?? null;

  const totalLabel = useMemo(() => {
    if (!items.length) return "0 €";
    // placeholder : si tu veux un vrai total, on stockera un price number
    return "—";
  }, [items.length]);

  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.container}>
        <header style={styles.header}>
          <p style={styles.kicker}>PANIER</p>
          <h1 style={styles.title}>Ton panier</h1>
          <p style={styles.sub}>
            Finalise ton achat et active l’accès à l’outil IA.
          </p>

          <div style={styles.statusRow}>
            {!checking && (
              <div style={styles.statusPill}>
                {userEmail ? `✅ Connecté : ${userEmail}` : "❌ Non connecté"}
              </div>
            )}

            {userEmail ? (
              <Link href="/compte-client" style={styles.secondaryBtn as any}>
                Mon compte
              </Link>
            ) : (
              <Link href="/compte-client" style={styles.secondaryBtn as any}>
                Se connecter
              </Link>
            )}

            <Link href="/packs-ia" style={styles.secondaryBtn as any}>
              Voir les packs
            </Link>
          </div>
        </header>

        <section style={styles.grid} data-grid="panier">
          {/* LEFT: items */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Articles</h2>

            {!items.length ? (
              <div style={styles.emptyBox}>
                <div style={styles.emptyTitle}>Ton panier est vide</div>
                <div style={styles.emptyText}>
                  Choisis un pack IA pour l’ajouter au panier.
                </div>

                <Link href="/packs-ia" style={styles.primaryBtn as any}>
                  Choisir un pack
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {items.map((it) => (
                  <div key={it.id} style={styles.itemRow}>
                    <div style={{ minWidth: 0 }}>
                      <div style={styles.itemTitle}>{it.title}</div>
                      <div style={styles.itemSub}>{it.priceLabel}</div>
                    </div>

                    <button
                      type="button"
                      style={styles.removeBtn}
                      onClick={() => setItems((prev) => prev.filter((x) => x.id !== it.id))}
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: summary */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Récapitulatif</h2>

            <div style={styles.summaryBox}>
              <div style={styles.summaryLine}>
                <span style={styles.summaryLabel}>Total</span>
                <span style={styles.summaryValue}>{totalLabel}</span>
              </div>
              <div style={styles.summaryHint}>
                Le paiement et l’ajout d’articles seront branchés à Stripe ensuite.
              </div>
            </div>

            <Link href="/packs-ia" style={styles.primaryBtn as any}>
              Continuer (choisir un pack)
            </Link>

            <div style={styles.note}>
              Après paiement, ton pack sera actif et tu auras accès à <strong>/outil-ia</strong>.
            </div>
          </div>
        </section>

        <div style={styles.bottomBand}>
          🔒 Accès à l’outil IA uniquement après achat d’un pack.
        </div>
      </section>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @media (max-width: 980px) {
          section[data-grid="panier"] { grid-template-columns: 1fr !important; }
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
    overflowX: "hidden",
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
    marginBottom: 22,
    display: "grid",
    gap: 10,
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
    fontSize: "clamp(2.0rem, 4vw, 3.0rem)",
    fontWeight: 900,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  sub: {
    fontSize: "1.05rem",
    color: COLORS.muted,
    margin: 0,
  },

  statusRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  statusPill: {
    background: "rgba(10, 15, 43, 0.85)",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 999,
    padding: "8px 12px",
    fontWeight: 800,
    fontSize: "0.9rem",
    color: COLORS.text,
    maxWidth: "100%",
  },
  secondaryBtn: {
    background: "rgba(255,255,255,0.10)",
    border: `1px solid ${COLORS.border}`,
    color: COLORS.text,
    padding: "9px 12px",
    borderRadius: 999,
    fontWeight: 900,
    cursor: "pointer",
    textDecoration: "none",
    maxWidth: "100%",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },

  card: {
    background: COLORS.panelSoft,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: "18px 18px",
    boxShadow: "0 12px 34px rgba(0,0,0,0.25)",
    overflow: "hidden",
    maxWidth: "100%",
  },
  cardTitle: {
    margin: 0,
    fontSize: "1.15rem",
    fontWeight: 950,
    letterSpacing: "-0.01em",
    marginBottom: 12,
  },

  emptyBox: {
    border: `1px dashed ${COLORS.border}`,
    borderRadius: 14,
    padding: "14px",
    background: "rgba(255,255,255,0.04)",
    display: "grid",
    gap: 10,
  },
  emptyTitle: {
    fontWeight: 950,
    fontSize: "1.05rem",
  },
  emptyText: {
    color: COLORS.muted,
    fontWeight: 700,
    lineHeight: 1.5,
  },

  itemRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    padding: "12px 12px",
    background: "rgba(2,6,23,0.45)",
    boxSizing: "border-box",
  },
  itemTitle: {
    fontWeight: 950,
    fontSize: "1.02rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  itemSub: {
    color: COLORS.muted,
    fontWeight: 750,
    fontSize: "0.92rem",
    marginTop: 4,
  },
  removeBtn: {
    padding: "9px 12px",
    borderRadius: 999,
    fontWeight: 900,
    border: `1px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.06)",
    color: COLORS.text,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  summaryBox: {
    border: `1px dashed ${COLORS.border}`,
    borderRadius: 14,
    padding: "14px",
    background: "rgba(255,255,255,0.04)",
    display: "grid",
    gap: 10,
    marginBottom: 12,
  },
  summaryLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    fontSize: "1rem",
  },
  summaryLabel: {
    color: COLORS.muted,
    fontWeight: 800,
  },
  summaryValue: {
    fontWeight: 950,
    color: COLORS.text,
  },
  summaryHint: {
    color: "rgba(255,255,255,0.72)",
    fontWeight: 700,
    fontSize: "0.9rem",
    lineHeight: 1.5,
  },

  primaryBtn: {
    width: "fit-content",
    padding: "12px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.22)",
    background: BRAND_GRADIENT,
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(0,0,0,0.28)",
    textDecoration: "none",
    maxWidth: "100%",
  },

  note: {
    marginTop: 10,
    color: "rgba(255,255,255,0.72)",
    fontSize: "0.92rem",
    fontWeight: 700,
    lineHeight: 1.55,
  },

  bottomBand: {
    marginTop: 18,
    background: "rgba(10, 15, 43, 0.85)",
    border: `1px solid ${COLORS.border}`,
    padding: "12px 14px",
    borderRadius: 14,
    textAlign: "center",
    fontWeight: 900,
    color: COLORS.text,
    boxSizing: "border-box",
  },
};
