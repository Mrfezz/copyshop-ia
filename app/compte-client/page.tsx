"use client";

// app/compte-client/page.tsx
import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";

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
  return d.toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function humanizeProductKey(key?: string | null): string {
  const k = (key || "").trim();
  if (!k) return "—";

  if (k.includes(",")) {
    return k
      .split(",")
      .map((x: string) => humanizeProductKey(x.trim()))
      .join(" + ");
  }

  if (k === "ia-basic") return "Pack Basic IA";
  if (k === "ia-premium") return "Pack Premium IA";
  if (k === "ia-ultime") return "Pack Ultime IA";
  if (k === "recharge-ia" || k === "ia-recharge-5") return "Recharge +5 boutiques";
  if (k === "services-essentiel") return "Pack Essentiel";
  if (k === "services-pro") return "Pack Pro";
  if (k === "services-business") return "Pack Business+";
  if (k === "kbis-24h") return "Création Kbis en 24h";
  if (k === "creation-entreprise-sasu-sarl") return "Création d'entreprise SASU / SARL";
  if (k === "logo-shopify") return "Logo boutique Shopify";
  if (k === "nom-domaine") return "Nom de domaine";
  if (k === "contact-fournisseur") return "Contact fournisseur";
  if (k === "contact-flocage-produit") return "Contact flocage produit personnalisé";
  if (k === "shopify-paiement") return "Activation Shopify Payments";
  if (k === "reseaux-sociaux") return "Création réseaux sociaux";
  if (k === "flyer-image-video") return "Création flyer image & vidéo";
  if (k === "optimisation-boutique") return "Optimisation boutique";

  return k;
}

function PaymentSuccessBanner({ hidden }: { hidden: boolean }) {
  const searchParams = useSearchParams();

  if (hidden) return null;

  const success = searchParams?.get("success");
  const paymentSuccess = success === "1" || success === "true";

  if (!paymentSuccess) return null;

  const purchasedProduct = searchParams?.get("product") ?? "";

  return (
    <div style={styles.paymentBanner}>
      <div style={styles.paymentTitle}>✅ Paiement validé.</div>
      <div style={styles.paymentText}>
        Connecte-toi pour activer ton pack.
        {purchasedProduct ? (
          <span style={styles.paymentHint}> (pack: {purchasedProduct})</span>
        ) : null}
      </div>
    </div>
  );
}

function isMobileSafari() {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|mercury/i.test(ua);

  return isIOS && isSafari;
}

function clearSupabaseBrowserStorage() {
  if (typeof window === "undefined") return;

  try {
    const localKeys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) localKeys.push(key);
    }

    for (const key of localKeys) {
      if (
        key.startsWith("sb-") ||
        key.includes("supabase") ||
        key.includes("auth-token") ||
        key === "pendingCheckout"
      ) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {}

  try {
    const sessionKeys: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      if (key) sessionKeys.push(key);
    }

    for (const key of sessionKeys) {
      if (
        key.startsWith("sb-") ||
        key.includes("supabase") ||
        key.includes("auth-token") ||
        key === "pendingCheckout"
      ) {
        window.sessionStorage.removeItem(key);
      }
    }
  } catch {}
}

export default function CompteClientPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMsg, setAuthMsg] = useState<string | null>(null);

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [purchasesError, setPurchasesError] = useState<string | null>(null);

  const redirectedOnce = useRef(false);

  useEffect(() => {
    let ignore = false;

    async function bootstrapSession() {
      try {
        const hasMobileLogoutFlag =
          typeof window !== "undefined" &&
          window.sessionStorage.getItem("mobile_logout_pending") === "1";

        if (hasMobileLogoutFlag) {
          window.sessionStorage.removeItem("mobile_logout_pending");
          clearSupabaseBrowserStorage();

          if (!ignore) {
            setSession(null);
            setChecking(false);
          }
          return;
        }

        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!ignore) {
          setSession(currentSession ?? null);
        }
      } finally {
        if (!ignore) {
          setChecking(false);
        }
      }
    }

    bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      const hasMobileLogoutFlag =
        typeof window !== "undefined" &&
        window.sessionStorage.getItem("mobile_logout_pending") === "1";

      if (hasMobileLogoutFlag) {
        return;
      }

      if (!ignore) {
        setSession(newSession ?? null);
        setChecking(false);
      }
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (checking) return;
    if (!session) return;
    if (redirectedOnce.current) return;
    if (typeof window === "undefined") return;

    const pendingRaw = localStorage.getItem("pendingCheckout");
    if (!pendingRaw) return;

    let payload: any = null;

    try {
      payload = JSON.parse(pendingRaw);
    } catch {
      localStorage.removeItem("pendingCheckout");
      return;
    }

    localStorage.removeItem("pendingCheckout");
    redirectedOnce.current = true;

    const singleProductKey =
      payload?.productKey ||
      (Array.isArray(payload?.productKeys) && payload.productKeys.length === 1
        ? payload.productKeys[0]
        : null);

    if (singleProductKey) {
      window.location.assign(`/paiement?product=${encodeURIComponent(singleProductKey)}`);
      return;
    }

    if (Array.isArray(payload?.productKeys) && payload.productKeys.length > 1) {
      window.location.assign("/panier");
      return;
    }

    window.location.assign("/paiement");
  }, [checking, session]);

  useEffect(() => {
    if (!session) {
      setPurchases([]);
      setPurchasesError(null);
      setPurchasesLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPurchases() {
      setPurchasesLoading(true);
      setPurchasesError(null);

      try {
        const {
          data: { session: freshSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const token = freshSession?.access_token || session?.access_token;

        if (!token) {
          throw new Error("Session introuvable, reconnecte-toi.");
        }

        const res = await fetch("/api/me/purchases", {
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(json?.error || "Erreur chargement achats");
        }

        const list = Array.isArray(json?.purchases) ? (json.purchases as Purchase[]) : [];

        const sorted = [...list].sort((a, b) => {
          const da = new Date(a.created_at || a.updated_at || 0).getTime();
          const db = new Date(b.created_at || b.updated_at || 0).getTime();
          return db - da;
        });

        if (!cancelled) {
          setPurchases(sorted);
          setPurchasesError(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setPurchases([]);
          setPurchasesError(e?.message ?? "Erreur chargement achats");
        }
      } finally {
        if (!cancelled) {
          setPurchasesLoading(false);
        }
      }
    }

    loadPurchases();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const userEmail = session?.user?.email ?? "";
  const lastPurchase = purchases?.[0] ?? null;

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthMsg(null);
    setAuthLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        setAuthMsg("Connecté ✅");

        if (typeof window !== "undefined" && isMobileSafari()) {
          setTimeout(() => {
            window.location.assign("/compte-client");
          }, 120);
        }
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setAuthMsg("Compte créé ✅ (vérifie ton email si demandé)");
      }
    } catch (err: any) {
      setAuthError(err?.message ?? "Erreur d’auth");
    } finally {
      setAuthLoading(false);
    }
  }

  async function signOut() {
    setAuthError(null);
    setAuthMsg(null);
    setPurchases([]);
    setPurchasesError(null);
    setPurchasesLoading(false);

    const mobileSafari = isMobileSafari();

    try {
      if (typeof window !== "undefined" && mobileSafari) {
        window.sessionStorage.setItem("mobile_logout_pending", "1");
      }

      await supabase.auth.signOut();
    } catch (err: any) {
      console.error("Erreur logout Supabase:", err?.message || err);
    }

    clearSupabaseBrowserStorage();
    setSession(null);
    setChecking(false);

    if (typeof window !== "undefined") {
      if (mobileSafari) {
        setTimeout(() => {
          window.location.replace("/compte-client");
        }, 120);
      } else {
        setTimeout(() => {
          window.location.replace("/compte-client");
        }, 150);
      }
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.container}>
        <header style={styles.header}>
          <p style={styles.kicker}>Compte client</p>
          <h1 style={styles.title}>Espace Client</h1>
          <p style={styles.sub}>
            Ici tu retrouveras tes achats, recharges et accès à l’outil IA.
          </p>

          <Suspense fallback={null}>
            <PaymentSuccessBanner hidden={checking || !!session} />
          </Suspense>

          {!checking && session && (
            <div style={styles.loggedLine}>
              Connecté : <strong>{userEmail}</strong>
              <button type="button" onClick={signOut} style={styles.logoutBtn}>
                Se déconnecter
              </button>
            </div>
          )}
        </header>

        {checking && (
          <div style={styles.loadingBox}>Chargement de ton espace client...</div>
        )}

        {!checking && !session && (
          <div style={styles.authWrap}>
            <div style={styles.authCard}>
              <div style={styles.authTabs}>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  style={{
                    ...styles.authTab,
                    ...(mode === "login" ? styles.authTabActive : {}),
                  }}
                >
                  Se connecter
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  style={{
                    ...styles.authTab,
                    ...(mode === "signup" ? styles.authTabActive : {}),
                  }}
                >
                  S’inscrire
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} style={styles.authForm}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  required
                  placeholder="toi@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                />

                <label style={styles.label}>Mot de passe</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                />

                {authError && <div style={styles.authError}>{authError}</div>}
                {authMsg && <div style={styles.authMsg}>{authMsg}</div>}

                <button disabled={authLoading} style={styles.authBtn} type="submit">
                  {authLoading
                    ? "Patiente..."
                    : mode === "login"
                    ? "Connexion"
                    : "Créer mon compte"}
                </button>

                <p style={styles.smallNote}>
                  En te connectant, tu accèdes à tes achats et à l’outil IA.
                </p>
              </form>
            </div>
          </div>
        )}

        {!checking && session && (
          <div className="client-dashboard-grid" style={styles.dashboardGrid}>
            <article style={{ ...styles.card, ...styles.areaAchats }}>
              <h2 style={styles.cardTitle}>Mes achats</h2>
              <p style={styles.cardText}>Historique de tes packs + factures.</p>

              {purchasesLoading ? (
                <div style={styles.smallNote}>Chargement de l’historique...</div>
              ) : purchasesError ? (
                <div style={styles.authError}>{purchasesError}</div>
              ) : purchases.length === 0 ? (
                <div style={styles.smallNote}>Aucun achat enregistré pour le moment.</div>
              ) : (
                <div style={styles.infoBox}>
                  <div style={styles.infoLine}>
                    <span style={styles.infoLabel}>Dernier achat :</span>
                    <span style={styles.infoValue}>
                      {humanizeProductKey(lastPurchase?.product_key)}
                    </span>
                  </div>
                  <div style={styles.infoLine}>
                    <span style={styles.infoLabel}>Date :</span>
                    <span style={styles.infoValue}>
                      {formatDate(lastPurchase?.created_at || lastPurchase?.updated_at)}
                    </span>
                  </div>
                </div>
              )}

              <a href="/historique-commandes" style={styles.buttonAlt}>
                Voir l’historique complet
              </a>
            </article>

            <article style={{ ...styles.card, ...styles.cardTop, ...styles.areaPanier }}>
              <div style={styles.cardBody}>
                <h2 style={styles.cardTitle}>Panier</h2>
                <p style={styles.cardText}>
                  Reprends ton achat ou passe à un pack supérieur.
                </p>
              </div>

              <div style={styles.cardFooter}>
                <a href="/panier" style={styles.button}>
                  Aller au panier
                </a>
              </div>
            </article>

            <article style={{ ...styles.card, ...styles.cardTop, ...styles.areaSupport }}>
              <div style={styles.cardBody}>
                <h2 style={styles.cardTitle}>Support</h2>
                <p style={styles.cardText}>
                  Assistance rapide via WhatsApp.
                  <br />
                  Réponse moyenne : <strong>8h</strong> (Lun–Sam 9h–18h).
                </p>
              </div>

              <div style={styles.cardFooter}>
                <a
                  href="https://wa.me/33745214922"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.button}
                >
                  Me contacter
                </a>
              </div>
            </article>

            <article style={{ ...styles.card, ...styles.cardMedium, ...styles.areaMessagerie }}>
              <div style={styles.cardBody}>
                <h2 style={styles.cardTitle}>Messagerie</h2>
                <p style={styles.cardText}>Accède à tes messages avec le support.</p>
              </div>

              <div style={styles.cardFooter}>
                <a href="/messages" style={styles.buttonAlt}>
                  Ouvrir la messagerie
                </a>
                <div style={styles.smallNote}></div>
              </div>
            </article>

            <article style={{ ...styles.card, ...styles.cardMedium, ...styles.areaBoutiques }}>
              <div style={styles.cardBody}>
                <h2 style={styles.cardTitle}>Mes boutiques</h2>
                <p style={styles.cardText}>
                  Retrouve toutes les boutiques générées par l’IA et accède à une page dédiée.
                </p>
              </div>

              <div style={styles.cardFooter}>
                <a href="/mes-boutiques" style={styles.button}>
                  Mes boutiques
                </a>
              </div>
            </article>

            <article style={{ ...styles.card, ...styles.cardMedium, ...styles.areaOutil }}>
              <div style={styles.cardBody}>
                <h2 style={styles.cardTitle}>Accès outil IA</h2>
                <p style={styles.cardText}>Disponible après achat d’un pack IA.</p>
              </div>

              <div style={styles.cardFooter}>
                <a href="/outil-ia" style={styles.button}>
                  Ouvrir l’outil
                </a>
                <div style={styles.smallNote}>
                  (Le lien s’activera automatiquement après paiement)
                </div>
              </div>
            </article>

            <article style={{ ...styles.card, ...styles.cardMedium, ...styles.areaRecharges }}>
              <div style={styles.cardBody}>
                <h2 style={styles.cardTitle}>Recharges</h2>
                <p style={styles.cardText}>
                  Ajoute <strong>5 boutiques supplémentaires</strong> sur ton pack
                  Basic/Premium.
                </p>
              </div>

              <div style={styles.cardFooter}>
                <a href="/paiement?product=recharge-ia" style={styles.buttonAlt}>
                  Voir les recharges
                </a>
              </div>
            </article>
          </div>
        )}
      </section>

      <style>{`
        @media (max-width: 980px) {
          .client-dashboard-grid {
            grid-template-columns: 1fr !important;
            grid-template-areas:
              "achats"
              "panier"
              "support"
              "messagerie"
              "boutiques"
              "outil"
              "recharges" !important;
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
    marginBottom: 30,
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
    fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
    fontWeight: 900,
    margin: "8px 0 8px",
    letterSpacing: "-0.02em",
  },

  sub: {
    fontSize: "1.05rem",
    color: COLORS.muted,
    margin: 0,
  },

  paymentBanner: {
    marginTop: 14,
    display: "inline-flex",
    flexDirection: "column",
    gap: 4,
    padding: "10px 14px",
    borderRadius: 14,
    background: "rgba(64, 255, 141, 0.10)",
    border: "1px solid rgba(64, 255, 141, 0.35)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
    maxWidth: 680,
    boxSizing: "border-box",
  },

  paymentTitle: {
    fontWeight: 900,
    color: "#b7ffd9",
    fontSize: "0.98rem",
  },

  paymentText: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: 700,
    fontSize: "0.95rem",
  },

  paymentHint: {
    color: "rgba(255,255,255,0.70)",
    fontWeight: 700,
  },

  loggedLine: {
    marginTop: 12,
    fontSize: "0.98rem",
    color: COLORS.muted,
    display: "flex",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },

  logoutBtn: {
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 900,
    border: `1px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.06)",
    color: COLORS.text,
    cursor: "pointer",
    boxSizing: "border-box",
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

  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridTemplateAreas: `
      "achats panier"
      "achats support"
      "messagerie boutiques"
      "outil recharges"
    `,
    gap: 20,
    alignItems: "stretch",
  },

  areaAchats: {
    gridArea: "achats",
  },

  areaPanier: {
    gridArea: "panier",
  },

  areaSupport: {
    gridArea: "support",
  },

  areaMessagerie: {
    gridArea: "messagerie",
  },

  areaBoutiques: {
    gridArea: "boutiques",
  },

  areaOutil: {
    gridArea: "outil",
  },

  areaRecharges: {
    gridArea: "recharges",
  },

  card: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    boxSizing: "border-box",
    maxWidth: "100%",
    overflow: "hidden",
    height: "100%",
  },

  cardTop: {
    minHeight: 180,
    justifyContent: "space-between",
  },

  cardMedium: {
    minHeight: 190,
    justifyContent: "space-between",
  },

  cardBody: {
    display: "grid",
    gap: 10,
  },

  cardFooter: {
    display: "grid",
    gap: 6,
    alignContent: "end",
  },

  cardTitle: {
    fontWeight: 900,
    fontSize: "1.35rem",
    margin: 0,
  },

  cardText: {
    fontSize: "1rem",
    color: COLORS.muted,
    lineHeight: 1.5,
    margin: 0,
  },

  button: {
    marginTop: 6,
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
    boxSizing: "border-box",
    maxWidth: "100%",
  },

  buttonAlt: {
    marginTop: 6,
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
    boxSizing: "border-box",
    maxWidth: "100%",
  },

  infoBox: {
    marginTop: 6,
    background: "rgba(255,255,255,0.04)",
    border: `1px dashed ${COLORS.border}`,
    borderRadius: 12,
    padding: "10px 12px",
    display: "grid",
    gap: 8,
    boxSizing: "border-box",
  },

  infoLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    fontSize: "0.98rem",
    alignItems: "flex-start",
  },

  infoLabel: {
    color: COLORS.muted,
    fontWeight: 800,
    minWidth: 120,
  },

  infoValue: {
    fontWeight: 900,
    color: COLORS.text,
    textAlign: "right",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  },

  smallNote: {
    marginTop: 4,
    fontSize: "0.9rem",
    color: "rgba(255,255,255,0.7)",
  },

  authWrap: {
    display: "grid",
    placeItems: "center",
    paddingTop: 10,
  },

  authCard: {
    width: "min(520px, 100%)",
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    padding: "18px",
    boxShadow: "0 14px 45px rgba(0,0,0,0.35)",
    boxSizing: "border-box",
    maxWidth: "100%",
    overflow: "hidden",
  },

  authTabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 14,
    boxSizing: "border-box",
  },

  authTab: {
    padding: "10px 12px",
    borderRadius: 999,
    fontWeight: 900,
    border: `1px solid ${COLORS.border}`,
    background: "rgba(255,255,255,0.05)",
    color: COLORS.text,
    cursor: "pointer",
    boxSizing: "border-box",
    maxWidth: "100%",
  },

  authTabActive: {
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    border: "none",
    boxShadow: "0 8px 20px rgba(106,47,214,0.35)",
  },

  authForm: {
    display: "grid",
    gap: 8,
    width: "100%",
    boxSizing: "border-box",
  },

  label: {
    fontSize: "0.9rem",
    fontWeight: 800,
    color: COLORS.muted,
    marginTop: 4,
  },

  input: {
    width: "100%",
    maxWidth: "100%",
    display: "block",
    padding: "12px 12px",
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
    background: "rgba(9,12,33,0.9)",
    color: COLORS.text,
    outline: "none",
    fontSize: "1rem",
    boxSizing: "border-box",
  },

  authBtn: {
    marginTop: 8,
    padding: "12px 14px",
    borderRadius: 12,
    fontWeight: 900,
    color: "#fff",
    border: "none",
    cursor: "pointer",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    boxShadow: "0 8px 20px rgba(106,47,214,0.35)",
    boxSizing: "border-box",
    maxWidth: "100%",
  },

  authError: {
    marginTop: 4,
    background: "rgba(255, 77, 77, 0.12)",
    border: "1px solid rgba(255, 77, 77, 0.35)",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: 800,
    color: "#ffb3b3",
    fontSize: "0.95rem",
    boxSizing: "border-box",
    maxWidth: "100%",
  },

  authMsg: {
    marginTop: 4,
    background: "rgba(64, 255, 141, 0.1)",
    border: "1px solid rgba(64, 255, 141, 0.35)",
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: 800,
    color: "#b7ffd9",
    fontSize: "0.95rem",
    boxSizing: "border-box",
    maxWidth: "100%",
  },
};