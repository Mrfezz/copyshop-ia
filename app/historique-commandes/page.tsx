"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

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

const PAGE_SIZE = 5;

type Purchase = {
  id: string;
  product_key: string | null;
  amount_total: number | null;
  currency: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  stripe_session_id: string | null;
};

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function formatAmount(amountCents?: number | null, currency?: string | null): string {
  if (amountCents == null) return "—";
  const cur = (currency || "EUR").toUpperCase();
  const eur = amountCents / 100;
  try {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: cur }).format(eur);
  } catch {
    return `${eur.toFixed(2)} ${cur}`;
  }
}

function humanizeProductKey(key?: string | null): string {
  const k = (key || "").trim();
  if (!k) return "—";

  if (k.includes(",")) {
    return k
      .split(",")
      .map((x) => humanizeProductKey(x.trim()))
      .join(" + ");
  }

  if (k === "ia-basic") return "Pack Basic IA";
  if (k === "ia-premium") return "Pack Premium IA";
  if (k === "ia-ultime") return "Pack Ultime IA";
  if (k === "recharge-ia" || k === "ia-recharge-5") return "Recharge +5 boutiques";
  return k;
}

export default function HistoriqueCommandesPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!ignore) {
          setSession(data.session ?? null);
          setChecking(false);
        }
      } catch {
        if (!ignore) setChecking(false);
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

  useEffect(() => {
    if (!session) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch("/api/me/purchases", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Erreur chargement historique");

        const list = Array.isArray(json?.purchases) ? (json.purchases as Purchase[]) : [];
        const sorted = [...list].sort((a, b) => {
          const da = new Date(a.created_at || a.updated_at || 0).getTime();
          const db = new Date(b.created_at || b.updated_at || 0).getTime();
          return db - da;
        });

        if (!cancelled) setPurchases(sorted);
      } catch (e: any) {
        if (!cancelled) setErrorMsg(e?.message ?? "Erreur chargement historique");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(purchases.length / PAGE_SIZE));
  }, [purchases.length]);

  const pagedPurchases = useMemo(() => {
    const safePage = Math.min(page, pageCount - 1);
    const start = safePage * PAGE_SIZE;
    return purchases.slice(start, start + PAGE_SIZE);
  }, [purchases, page, pageCount]);

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, pageCount - 1)));
  }, [pageCount]);

  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.container}>
        <header style={styles.header}>
          <p style={styles.kicker}>Compte client</p>
          <h1 style={styles.title}>Historique de commande</h1>
          <p style={styles.sub}>
            Retrouve tous tes achats alignés les uns en dessous des autres.
          </p>

          <div style={styles.topActions}>
            <a href="/compte-client" style={styles.buttonAlt}>
              ← Retour espace client
            </a>
          </div>
        </header>

        {checking && <div style={styles.loadingBox}>Chargement...</div>}

        {!checking && !session && (
          <div style={styles.loadingBox}>
            Tu dois être connecté pour voir ton historique.
            <div style={{ marginTop: 10 }}>
              <a href="/compte-client" style={styles.button}>
                Aller à la connexion
              </a>
            </div>
          </div>
        )}

        {!checking && session && (
          <section style={styles.card}>
            {loading ? (
              <div style={styles.smallNote}>Chargement de l’historique...</div>
            ) : errorMsg ? (
              <div style={styles.errorBox}>{errorMsg}</div>
            ) : purchases.length === 0 ? (
              <div style={styles.smallNote}>Aucune commande enregistrée pour le moment.</div>
            ) : (
              <>
                <div style={styles.list}>
                  {pagedPurchases.map((p) => (
                    <article key={p.id} style={styles.orderCard}>
                      <div style={styles.orderTop}>
                        <div>
                          <div style={styles.orderTitle}>{humanizeProductKey(p.product_key)}</div>
                          <div style={styles.orderDate}>
                            {formatDate(p.created_at || p.updated_at)}
                          </div>
                        </div>

                        <div style={styles.statusBadge}>
                          {(p.status || "unknown").toUpperCase()}
                        </div>
                      </div>

                      <div style={styles.orderMeta}>
                        <div style={styles.metaLine}>
                          <span style={styles.metaLabel}>Montant :</span>
                          <span style={styles.metaValue}>
                            {formatAmount(p.amount_total, p.currency)}
                          </span>
                        </div>

                        <div style={styles.metaLine}>
                          <span style={styles.metaLabel}>Produit :</span>
                          <span style={styles.metaValue}>
                            {humanizeProductKey(p.product_key)}
                          </span>
                        </div>

                        <div style={styles.metaLine}>
                          <span style={styles.metaLabel}>Session :</span>
                          <span style={styles.metaValue}>{p.stripe_session_id || "—"}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {purchases.length > PAGE_SIZE && (
                  <div style={styles.pager}>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page <= 0}
                      style={{
                        ...styles.pagerBtn,
                        ...(page <= 0 ? styles.pagerBtnDisabled : {}),
                      }}
                    >
                      ← Page précédente
                    </button>

                    <div style={styles.pagerInfo}>
                      Page <strong>{Math.min(page + 1, pageCount)}</strong> / {pageCount}
                    </div>

                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                      disabled={page >= pageCount - 1}
                      style={{
                        ...styles.pagerBtn,
                        ...(page >= pageCount - 1 ? styles.pagerBtnDisabled : {}),
                      }}
                    >
                      Page suivante →
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </section>
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
    opacity: 0.7,
    zIndex: -1,
    pointerEvents: "none",
  },
  container: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "56px 10px 28px",
    position: "relative",
    zIndex: 1,
  },
  header: {
    textAlign: "center",
    marginBottom: 24,
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
    fontSize: "clamp(2rem, 4vw, 3.2rem)",
    fontWeight: 900,
    margin: "8px 0 8px",
    letterSpacing: "-0.02em",
  },
  sub: {
    fontSize: "1.05rem",
    color: COLORS.muted,
    margin: 0,
  },
  topActions: {
    marginTop: 16,
    display: "flex",
    justifyContent: "center",
  },
  loadingBox: {
    textAlign: "center",
    color: COLORS.muted,
    padding: "24px",
    background: "rgba(255,255,255,0.04)",
    border: `1px dashed ${COLORS.border}`,
    borderRadius: 12,
    boxSizing: "border-box",
  },
  card: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    boxSizing: "border-box",
  },
  list: {
    display: "grid",
    gap: 14,
  },
  orderCard: {
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    padding: "16px",
    display: "grid",
    gap: 14,
  },
  orderTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  orderTitle: {
    fontWeight: 900,
    fontSize: "1.05rem",
    color: COLORS.text,
  },
  orderDate: {
    marginTop: 6,
    color: COLORS.muted,
    fontWeight: 700,
    fontSize: "0.95rem",
  },
  statusBadge: {
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.06)",
    fontWeight: 900,
    fontSize: "0.8rem",
    whiteSpace: "nowrap",
  },
  orderMeta: {
    display: "grid",
    gap: 8,
  },
  metaLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  metaLabel: {
    color: COLORS.muted,
    fontWeight: 800,
  },
  metaValue: {
    color: COLORS.text,
    fontWeight: 900,
    wordBreak: "break-word",
  },
  smallNote: {
    fontSize: "0.95rem",
    color: "rgba(255,255,255,0.75)",
  },
  errorBox: {
    background: "rgba(255, 77, 77, 0.12)",
    border: "1px solid rgba(255, 77, 77, 0.35)",
    padding: "10px 12px",
    borderRadius: 10,
    fontWeight: 800,
    color: "#ffb3b3",
    fontSize: "0.95rem",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    color: "#fff",
    textDecoration: "none",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    boxShadow: "0 8px 20px rgba(106,47,214,0.35)",
    width: "fit-content",
  },
  buttonAlt: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    color: COLORS.text,
    textDecoration: "none",
    background: "rgba(255,255,255,0.08)",
    border: `1px solid ${COLORS.border}`,
    width: "fit-content",
  },
  pager: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    paddingTop: 18,
    marginTop: 18,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    flexWrap: "wrap",
  },
  pagerBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 900,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    cursor: "pointer",
    background: "rgba(255,255,255,0.06)",
  },
  pagerBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  pagerInfo: {
    color: COLORS.muted,
    fontWeight: 900,
  },
};