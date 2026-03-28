"use client";

import React, { useEffect, useMemo, useState } from "react";
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
};

const PAGE_SIZE = 5;

type Review = {
  id: string;
  name: string | null;
  review_text: string;
  created_at: string;
};

export default function AvisClientsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/reviews", { cache: "no-store" });
        const json = await res.json();

        if (!res.ok) throw new Error(json?.error || "Erreur chargement avis");

        if (!cancelled) {
          setReviews(Array.isArray(json?.reviews) ? json.reviews : []);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Erreur chargement avis");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  }, [reviews.length]);

  const pagedReviews = useMemo(() => {
    const start = page * PAGE_SIZE;
    return reviews.slice(start, start + PAGE_SIZE);
  }, [reviews, page]);

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, pageCount - 1)));
  }, [pageCount]);

  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <div style={styles.header}>
            <p style={styles.kicker}>Avis clients</p>
            <h1 style={styles.title}>Tous les avis Copyshop IA</h1>
            <p style={styles.sub}>
              Découvre les retours des clients qui ont testé Copyshop IA.
            </p>
          </div>

          <div style={styles.actions}>
            <Link href="/" style={styles.ghostBtn}>
              Retour à l’accueil
            </Link>

            <Link href="/contact" style={styles.primaryBtn}>
              Nous contacter
            </Link>
          </div>

          {loading && <div style={styles.infoBox}>Chargement des avis...</div>}
          {error && <div style={styles.errorBox}>{error}</div>}

          {!loading && !error && reviews.length === 0 && (
            <div style={styles.infoBox}>Aucun avis pour le moment.</div>
          )}

          {!loading && !error && reviews.length > 0 && (
            <>
              <div style={styles.reviewsList}>
                {pagedReviews.map((review) => (
                  <article key={review.id} style={styles.reviewCard}>
                    <div style={styles.reviewQuote}>"{review.review_text}"</div>
                    <div style={styles.reviewName}>
                      — {review.name || "Client"}
                    </div>
                  </article>
                ))}
              </div>

              {reviews.length > PAGE_SIZE && (
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
                    Page <strong>{page + 1}</strong> / {pageCount}
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
        </div>
      </section>
    </main>
  );
}

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

  section: {
    padding: "90px 20px 60px",
    maxWidth: 1200,
    margin: "0 auto",
  },

  sectionInner: {
    display: "grid",
    gap: 20,
  },

  header: {
    display: "grid",
    gap: 8,
    textAlign: "center",
    marginBottom: 6,
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
    fontSize: "clamp(2rem, 4vw, 3rem)",
    lineHeight: 1.1,
    fontWeight: 900,
    letterSpacing: "-0.02em",
    margin: 0,
  },

  sub: {
    color: COLORS.muted,
    fontSize: "1.02rem",
    margin: 0,
    lineHeight: 1.7,
  },

  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 8,
  },

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
    whiteSpace: "nowrap",
  },

  reviewsList: {
    display: "grid",
    gap: 14,
    maxWidth: 900,
    width: "100%",
    margin: "0 auto",
  },

  reviewCard: {
    background: COLORS.panelSoft,
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 18,
    padding: "18px 16px",
    display: "grid",
    gap: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
    backdropFilter: "blur(4px)",
  },

  reviewQuote: {
    fontSize: "1rem",
    lineHeight: 1.8,
    color: COLORS.text,
  },

  reviewName: {
    fontWeight: 900,
    color: COLORS.muted,
    fontSize: "0.98rem",
  },

  infoBox: {
    maxWidth: 900,
    width: "100%",
    margin: "0 auto",
    padding: "16px 14px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${COLORS.panelBorder}`,
    color: COLORS.muted,
    fontWeight: 800,
    textAlign: "center",
  },

  errorBox: {
    maxWidth: 900,
    width: "100%",
    margin: "0 auto",
    padding: "16px 14px",
    borderRadius: 14,
    background: "rgba(255, 77, 77, 0.12)",
    border: "1px solid rgba(255, 77, 77, 0.35)",
    color: "#ffb3b3",
    fontWeight: 800,
    textAlign: "center",
  },

  pager: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    padding: "12px",
    maxWidth: 900,
    width: "100%",
    margin: "0 auto",
    borderRadius: 12,
    background: "rgba(0,0,0,0.10)",
    border: `1px solid ${COLORS.panelBorder}`,
    flexWrap: "wrap",
  },

  pagerBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 900,
    color: COLORS.text,
    border: `1px solid ${COLORS.panelBorder}`,
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