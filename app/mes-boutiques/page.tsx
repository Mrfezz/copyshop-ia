"use client";

// app/mes-boutiques/page.tsx
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

const SHOPS_PAGE_SIZE = 4;

type Shop = {
  id: string;
  email: string;
  product_url: string;
  pack: string;
  store_name: string | null;
  payload: any;
  created_at: string;
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function safeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function downloadJson(filename: string, obj: any) {
  const text = JSON.stringify(obj, null, 2);
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function MesBoutiquesPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  const [shops, setShops] = useState<Shop[]>([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [shopsError, setShopsError] = useState<string | null>(null);
  const [shopsOk, setShopsOk] = useState<string | null>(null);
  const [downloadingZipId, setDownloadingZipId] = useState<string | null>(null);

  const [shopsPage, setShopsPage] = useState(0);

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

  async function fetchShops(currentSession?: Session | null) {
    const activeSession = currentSession ?? session;
    if (!activeSession?.access_token) return;

    setShopsLoading(true);
    setShopsError(null);
    setShopsOk(null);

    try {
      const res = await fetch("/api/me/shops", {
        headers: {
          Authorization: `Bearer ${activeSession.access_token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Erreur API shops");

      const list = Array.isArray(json?.shops) ? (json.shops as Shop[]) : [];

      const sorted = [...list].sort((a, b) => {
        const da = new Date(a.created_at || 0).getTime();
        const db = new Date(b.created_at || 0).getTime();
        return db - da;
      });

      setShops(sorted);
    } catch (e: any) {
      setShopsError(e?.message ?? "Erreur chargement boutiques");
    } finally {
      setShopsLoading(false);
    }
  }

  useEffect(() => {
    if (!checking && session) {
      fetchShops(session);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking, session]);

  const shopsPageCount = useMemo(() => {
    return Math.max(1, Math.ceil(shops.length / SHOPS_PAGE_SIZE));
  }, [shops.length]);

  const pagedShops = useMemo(() => {
    const safePage = Math.min(shopsPage, shopsPageCount - 1);
    const start = safePage * SHOPS_PAGE_SIZE;
    return shops.slice(start, start + SHOPS_PAGE_SIZE);
  }, [shops, shopsPage, shopsPageCount]);

  useEffect(() => {
    setShopsPage((p) => Math.min(p, Math.max(0, shopsPageCount - 1)));
  }, [shopsPageCount]);

  async function downloadThemeZip(shop: Shop) {
    if (!session?.access_token) {
      setShopsError("Session invalide. Reconnecte-toi puis réessaie.");
      return;
    }

    setDownloadingZipId(shop.id);
    setShopsError(null);
    setShopsOk(null);

    try {
      const res = await fetch("/api/theme-export", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          savedShopId: shop.id,
        }),
      });

      if (!res.ok) {
        let message = "Erreur export ZIP";
        try {
          const json = await res.json();
          message = json?.error ?? message;
        } catch {
          const text = await res.text();
          if (text) message = text;
        }
        throw new Error(message);
      }

      const blob = await res.blob();
      const baseName =
        safeFileName(
          shop.store_name ||
            shop.payload?.storeName ||
            shop.payload?.themeAi?.brand?.storeName ||
            "theme-copyshop"
        ) || "theme-copyshop";

      const filename = `${baseName}-${shop.id}.zip`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setShopsOk("✅ Thème ZIP téléchargé.");
      setTimeout(() => setShopsOk(null), 2500);
    } catch (e: any) {
      setShopsError(e?.message ?? "Erreur téléchargement ZIP");
    } finally {
      setDownloadingZipId(null);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/compte-client";
  }

  const userEmail = session?.user?.email ?? "";

  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section className="shops-container" style={styles.container}>
        <header style={styles.header}>
          <div style={styles.topRow}>
            <div>
              <p style={styles.kicker}>Compte client</p>
              <h1 style={styles.title}>Mes boutiques</h1>
              <p style={styles.sub}>
                Retrouve toutes les boutiques générées par l’IA, avec téléchargement du thème ZIP.
              </p>

              {!checking && session && (
                <div style={styles.loggedLine}>
                  Connecté : <strong>{userEmail || "ton compte"}</strong>
                </div>
              )}
            </div>

            {session && (
              <button onClick={signOut} style={styles.logoutBtn}>
                Se déconnecter
              </button>
            )}
          </div>
        </header>

        {checking && <div style={styles.loadingBox}>Chargement...</div>}

        {!checking && !session && (
          <div style={styles.loadingBox}>
            Tu dois être connecté pour accéder à tes boutiques.
            <div style={{ marginTop: 10 }}>
              <a href="/compte-client" style={styles.linkBtn}>
                Aller à la connexion
              </a>
            </div>
          </div>
        )}

        {!checking && session && (
          <div style={styles.panel}>
            <div style={styles.panelTop}>
              <div>
                <div style={styles.panelTitle}>Boutiques générées</div>
              </div>

              <div style={styles.panelActions}>
                <button
                  type="button"
                  onClick={() => fetchShops()}
                  style={styles.secondaryBtn}
                  disabled={shopsLoading}
                >
                  {shopsLoading ? "Chargement..." : "Actualiser"}
                </button>

                <a href="/compte-client" style={styles.secondaryBtn as any}>
                  Retour espace client
                </a>
              </div>
            </div>

            {shopsOk && <div style={{ ...styles.okBox, marginTop: 12 }}>{shopsOk}</div>}
            {shopsError && <div style={{ ...styles.errBox, marginTop: 12 }}>{shopsError}</div>}
            {shopsLoading && <div style={styles.loadingInline}>Chargement des boutiques…</div>}

            {!shopsLoading && shops.length === 0 && (
              <div style={styles.empty}>Aucune boutique enregistrée pour le moment.</div>
            )}

            {!shopsLoading && shops.length > 0 && (
              <>
                <div style={styles.shopsList}>
                  {pagedShops.map((s) => {
                    const storeName =
                      s.store_name ||
                      s.payload?.storeName ||
                      s.payload?.themeAi?.brand?.storeName ||
                      "Boutique sans nom";

                    const pack = s.pack || s.payload?.meta?.pack || "—";
                    const createdAt = s.created_at;
                    const productUrl = s.product_url;
                    const shopifyAdminUrl = s.payload?.meta?.shopify?.product?.adminUrl || null;
                    const isDownloading = downloadingZipId === s.id;

                    return (
                      <div key={s.id} style={styles.shopCard}>
                        <div style={styles.shopTop}>
                          <div style={{ minWidth: 0 }}>
                            <div style={styles.shopName}>{storeName}</div>

                            <div style={styles.shopMetaLine}>
                              <span style={styles.shopPill}>{pack}</span>
                              <span style={styles.shopMeta}>{formatDate(createdAt)}</span>
                            </div>

                            {productUrl && (
                              <a
                                href={productUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={styles.shopLink}
                                title={productUrl}
                              >
                                Voir le lien produit
                              </a>
                            )}
                          </div>
                        </div>

                        <div style={styles.shopActions}>
                          <button
                            type="button"
                            style={styles.primaryBtn}
                            onClick={() => downloadThemeZip(s)}
                            disabled={isDownloading}
                          >
                            {isDownloading ? "Téléchargement..." : "Télécharger le thème ZIP"}
                          </button>

                          <button
                            type="button"
                            style={styles.secondaryBtn}
                            onClick={() => {
                              const filename = `${safeFileName(storeName) || "boutique"}_${s.id}.json`;
                              downloadJson(filename, s.payload ?? {});
                              setShopsOk("✅ Fichier JSON téléchargé.");
                              setTimeout(() => setShopsOk(null), 2500);
                            }}
                          >
                            Télécharger JSON
                          </button>

                          {shopifyAdminUrl && (
                            <a
                              href={shopifyAdminUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={styles.shopifyBtn}
                            >
                              Voir sur Shopify
                            </a>
                          )}
                        </div>

                        <div style={styles.shopIdLine}>
                          ID: <span style={styles.mono}>{s.id}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {shops.length > SHOPS_PAGE_SIZE && (
                  <div style={styles.pager}>
                    <button
                      type="button"
                      onClick={() => setShopsPage((p) => Math.max(0, p - 1))}
                      disabled={shopsPage <= 0}
                      style={{
                        ...styles.pagerBtn,
                        ...(shopsPage <= 0 ? styles.pagerBtnDisabled : {}),
                      }}
                    >
                      ← Page précédente
                    </button>

                    <div style={styles.pagerInfo}>
                      Page <strong>{Math.min(shopsPage + 1, shopsPageCount)}</strong> /{" "}
                      {shopsPageCount}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShopsPage((p) => Math.min(shopsPageCount - 1, p + 1))}
                      disabled={shopsPage >= shopsPageCount - 1}
                      style={{
                        ...styles.pagerBtn,
                        ...(shopsPage >= shopsPageCount - 1 ? styles.pagerBtnDisabled : {}),
                      }}
                    >
                      Page suivante →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>

      <style>{`
        @media (max-width: 980px) {
          .shops-container{
            padding-left: 6px !important;
            padding-right: 6px !important;
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
    maxWidth: 1100,
    margin: "0 auto",
    padding: "40px 10px 28px",
    position: "relative",
    zIndex: 1,
  },
  header: {
    marginBottom: 18,
  },
  topRow: {
    display: "flex",
    gap: 14,
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
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
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: 900,
    margin: "8px 0 8px",
    letterSpacing: "-0.02em",
  },
  sub: {
    fontSize: "1rem",
    color: COLORS.muted,
    margin: 0,
    lineHeight: 1.5,
    maxWidth: 760,
  },
  loggedLine: {
    marginTop: 12,
    fontSize: "0.98rem",
    color: COLORS.muted,
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  logoutBtn: {
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    border: `1px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.06)",
    color: COLORS.text,
    cursor: "pointer",
  },
  loadingBox: {
    textAlign: "center",
    color: COLORS.muted,
    padding: "22px",
    background: "rgba(255,255,255,0.04)",
    border: `1px dashed ${COLORS.border}`,
    borderRadius: 12,
  },
  panel: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  panelTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  panelTitle: {
    fontWeight: 900,
    fontSize: "1.15rem",
    marginBottom: 8,
  },
  panelActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  small: {
    color: COLORS.muted,
    fontWeight: 800,
    lineHeight: 1.5,
  },
  linkBtn: {
    display: "inline-flex",
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    color: "#fff",
    textDecoration: "none",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
  },
  primaryBtn: {
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 900,
    color: "#fff",
    border: "none",
    cursor: "pointer",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    boxShadow: "0 8px 20px rgba(106,47,214,0.35)",
  },
  secondaryBtn: {
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 900,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    cursor: "pointer",
    background: "rgba(255,255,255,0.06)",
    textDecoration: "none",
  },
  okBox: {
    background: "rgba(64, 255, 141, 0.1)",
    border: "1px solid rgba(64, 255, 141, 0.35)",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: 800,
    color: "#b7ffd9",
    fontSize: "0.95rem",
  },
  errBox: {
    background: "rgba(255, 77, 77, 0.12)",
    border: "1px solid rgba(255, 77, 77, 0.35)",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: 800,
    color: "#ffb3b3",
    fontSize: "0.95rem",
  },
  loadingInline: {
    padding: "16px 12px",
    color: COLORS.muted,
    fontWeight: 800,
  },
  empty: {
    padding: "16px 12px",
    color: COLORS.muted,
    fontWeight: 800,
  },
  shopsList: {
    display: "grid",
    gap: 12,
    marginTop: 14,
  },
  shopCard: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    padding: 12,
    background: "rgba(255,255,255,0.04)",
  },
  shopTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
  },
  shopName: {
    fontWeight: 950 as any,
    fontSize: "1.05rem",
    marginBottom: 6,
  },
  shopMetaLine: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  shopPill: {
    display: "inline-flex",
    padding: "4px 10px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: "0.82rem",
    border: `1px solid ${COLORS.border}`,
    background: "rgba(0,0,0,0.25)",
  },
  shopMeta: {
    color: COLORS.muted,
    fontWeight: 800,
    fontSize: "0.92rem",
  },
  shopLink: {
    display: "inline-block",
    marginTop: 8,
    color: "rgba(201,210,255,0.95)",
    fontWeight: 900,
    textDecoration: "underline",
  },
  shopActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 12,
  },
  shopifyBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 900,
    color: "#ffffff",
    textDecoration: "none",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 8px 20px rgba(106,47,214,0.22)",
  },
  shopIdLine: {
    marginTop: 10,
    color: "rgba(201,210,255,0.85)",
    fontWeight: 800,
    fontSize: "0.9rem",
  },
  mono: {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  pager: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    padding: "12px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(0,0,0,0.10)",
    flexWrap: "wrap",
    marginTop: 12,
    borderRadius: 12,
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