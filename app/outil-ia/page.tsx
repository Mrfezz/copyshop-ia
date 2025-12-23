// app/outil-ia/page.tsx
"use client";

import React, { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type MePackResponse = {
  email: string;
  packKey: "ia-basic" | "ia-premium" | "ia-ultime" | null;
  quota: number | null;
  unlimited: boolean;
  creditsUsed: number;
  creditsRemaining: number | null;
  title: string;
  subtitle: string;
};

type GeneratedBoutique = {
  storeName: string;
  tagline: string;
  homepageSections: string[];
  productPageBlocks: string[];
  brandTone: string;
};

const COLORS = {
  bgTop: "#0b1026",
  bgMid: "#0f1635",
  bgBottom: "#171a52",
  text: "#eef1ff",
  muted: "#c9d2ff",
  panel: "rgba(10, 15, 43, 0.85)",
  panelSoft: "rgba(13, 18, 50, 0.90)",
  panelBorder: "rgba(150, 170, 255, 0.18)",
  navy: "#0b0f2a",
  violet: "#6a2fd6",
  violetDeep: "#4338ca",
  pink: "#e64aa7",
  green: "#22c55e",
};

const BRAND_GRADIENT = `linear-gradient(90deg, ${COLORS.navy} 0%, ${COLORS.violet} 70%, ${COLORS.pink} 100%)`;

function badgeForPack(packKey: MePackResponse["packKey"]) {
  if (packKey === "ia-ultime") {
    return { label: "ULTIME", color: "linear-gradient(90deg, #22c55e, #a3e635)" };
  }
  if (packKey === "ia-premium") {
    return { label: "PREMIUM", color: BRAND_GRADIENT };
  }
  if (packKey === "ia-basic") {
    return { label: "BASIC", color: BRAND_GRADIENT };
  }
  return { label: "PACK REQUIS", color: "linear-gradient(90deg, #64748b, #94a3b8)" };
}

function formatCredits(pack: MePackResponse | null) {
  if (!pack || !pack.packKey) return "—";
  if (pack.unlimited) return "Illimité";
  const total = pack.quota ?? 0;
  const remaining = pack.creditsRemaining ?? 0;
  return `${remaining} / ${total}`;
}

export default function OutilIAPage() {
  const [loadingPage, setLoadingPage] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [pack, setPack] = useState<MePackResponse | null>(null);
  const [packLoading, setPackLoading] = useState(false);

  const [productUrl, setProductUrl] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedBoutique | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const badge = useMemo(() => badgeForPack(pack?.packKey ?? null), [pack?.packKey]);

  async function fetchMePack(token: string) {
    setPackLoading(true);
    try {
      const res = await fetch("/api/me/pack", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const t = await res.text();
        console.error("❌ /api/me/pack error:", t);
        setPack(null);
        return;
      }

      const raw = await res.json();

      // ✅ normalisation pour éviter les undefined si ton API ne renvoie pas tout
      const normalized: MePackResponse = {
        email: raw.email ?? "",
        packKey: raw.packKey ?? null,
        quota: raw.quota ?? null,
        unlimited: raw.unlimited ?? (raw.packKey === "ia-ultime" || raw.quota == null),
        creditsUsed: raw.creditsUsed ?? 0,
        creditsRemaining: raw.creditsRemaining ?? (raw.quota ?? null),
        title: raw.title ?? "Génère une boutique Shopify (pack requis).",
        subtitle: raw.subtitle ?? "Choisis un pack IA pour débloquer l’outil.",
      };

      setPack(normalized);
    } finally {
      setPackLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;

        if (!mounted) return;

        if (!session?.access_token) {
          setAuthToken(null);
          setUserEmail(null);
          setPack(null);
          setLoadingPage(false);
          return;
        }

        setAuthToken(session.access_token);
        setUserEmail(session.user.email ?? null);

        await fetchMePack(session.access_token);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoadingPage(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const token = session?.access_token ?? null;
      setAuthToken(token);
      setUserEmail(session?.user?.email ?? null);
      setResult(null);
      setErrorMsg(null);

      if (token) await fetchMePack(token);
      else setPack(null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setImageBase64(null);
      setImageName(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageBase64(null);
    setImageName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setResult(null);

    if (!authToken) {
      setErrorMsg("Tu dois être connecté pour utiliser l’outil.");
      return;
    }

    const url = productUrl.trim();
    if (!url) {
      setErrorMsg("Colle un lien produit (obligatoire pour le moment).");
      return;
    }

    if (!pack?.packKey) {
      setErrorMsg("Pack requis : choisis un pack IA pour débloquer l’outil.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/outil-ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          productUrl: url,
          imageBase64,
          productKey: pack.packKey,
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        console.error("❌ /api/outil-ia error:", t);

        try {
          const j = JSON.parse(t);
          setErrorMsg(j?.error ?? "Erreur lors de la génération.");
        } catch {
          setErrorMsg("Erreur lors de la génération. Réessaie.");
        }
        return;
      }

      const data = (await res.json()) as GeneratedBoutique;
      setResult(data);

      await fetchMePack(authToken);
    } catch (err) {
      console.error(err);
      setErrorMsg("Erreur réseau pendant l'appel à l’IA.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <main style={styles.page} data-outil-ia>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.container}>
        {/* HEADER */}
        <header style={styles.header}>
          <div style={{ display: "grid", gap: 10 }}>
            <p style={styles.kicker}>OUTIL IA • BOUTIQUES SHOPIFY</p>

            <div style={styles.titleRow}>
              <h1 style={styles.title}>{pack?.title ?? "Génère une boutique Shopify (pack requis)."}</h1>
              <span style={{ ...styles.packBadge, background: badge.color }}>{badge.label}</span>
            </div>

            <p style={styles.sub}>{pack?.subtitle ?? "Choisis un pack IA pour débloquer l’outil."}</p>

            {/* mini barre état */}
            <div style={styles.statusRow}>
              <div style={styles.statusPill}>
                {loadingPage ? "…" : authToken ? `✅ Connecté : ${userEmail ?? "—"}` : "❌ Non connecté"}
              </div>

              {authToken ? (
                <button type="button" onClick={handleSignOut} style={styles.secondaryBtn} className="ui-btn">
                  Se déconnecter
                </button>
              ) : (
                <Link href="/connexion" style={styles.secondaryBtn as any} className="ui-btn">
                  Se connecter
                </Link>
              )}

              <div style={styles.statusPill}>
                {packLoading ? "Chargement pack…" : `Crédits : ${formatCredits(pack)}`}
              </div>

              {pack?.packKey ? (
                <Link href="/compte-client" style={styles.secondaryBtn as any} className="ui-btn">
                  Mon compte
                </Link>
              ) : (
                <Link href="/packs-ia" style={styles.ctaOutline as any} className="ui-btn">
                  Voir les packs IA
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* GRID */}
        <section style={styles.grid} data-grid="outil">
          {/* LEFT INFO */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Comment ça marche</h2>

            <ul style={styles.ul}>
              <li style={styles.li}>
                <span style={styles.dot} />
                <span>Colle un lien produit (AliExpress / fournisseur).</span>
              </li>
              <li style={styles.li}>
                <span style={styles.dot} />
                <span>Optionnel : ajoute une image (on l’exploitera ensuite).</span>
              </li>
              <li style={styles.li}>
                <span style={styles.dot} />
                <span>Tu reçois une structure complète : nom, slogan, sections, blocs produit.</span>
              </li>
            </ul>

            {!pack?.packKey && (
              <div style={{ marginTop: 14 }}>
                <Link href="/packs-ia" style={styles.ctaBig as any} className="ui-btn">
                  Débloquer l’accès (choisir un pack)
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT FORM */}
          <form onSubmit={handleGenerate} style={styles.card}>
            <h2 style={styles.cardTitle}>Envoyer à l’IA</h2>

            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={styles.label}>Image du produit (optionnel)</label>

                {/* ✅ input file custom (iOS safe) */}
                <input
                  ref={fileInputRef}
                  id="outil-ia-file"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={styles.fileHidden}
                />

                <div style={styles.fileRow}>
                  <label htmlFor="outil-ia-file" style={styles.fileBtn} className="ui-btn">
                    Choisir un fichier
                  </label>

                  <div style={styles.fileName} title={imageName ?? "Aucun fichier sélectionné"}>
                    {imageName ?? "Aucun fichier sélectionné"}
                  </div>

                  {imageName && (
                    <button type="button" onClick={clearImage} style={styles.fileClear} className="ui-btn">
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label style={styles.label}>Lien produit (obligatoire pour le moment)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  style={styles.input}
                />
              </div>

              {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

              <button
                type="submit"
                disabled={loading || !authToken}
                style={styles.primaryBtn}
                className="primary-cta"
              >
                {loading ? "Génération en cours…" : "Générer ma boutique"}
              </button>

              {!authToken && <div style={styles.helper}>Connecte-toi pour utiliser l’outil.</div>}
            </div>
          </form>
        </section>

        {/* RESULT */}
        {result && (
          <section style={{ ...styles.card, marginTop: 18 }}>
            <div style={styles.resultHeader}>
              <div>
                <h2 style={{ ...styles.cardTitle, marginBottom: 6 }}>Résultat</h2>
                <div style={{ color: COLORS.muted }}>
                  Copie/colle directement dans Shopify (ou délègue la mise en place).
                </div>
              </div>

              <button
                type="button"
                style={styles.secondaryBtn}
                className="ui-btn"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
              >
                Copier le JSON
              </button>
            </div>

            <div style={styles.resultGrid}>
              <div style={styles.resultCard}>
                <div style={styles.resultLabel}>Nom de la boutique</div>
                <div style={styles.resultValue}>{result.storeName}</div>

                <div style={{ height: 10 }} />

                <div style={styles.resultLabel}>Slogan</div>
                <div style={{ color: COLORS.text, fontWeight: 700, overflowWrap: "anywhere" }}>
                  {result.tagline}
                </div>

                <div style={{ height: 10 }} />

                <div style={styles.resultLabel}>Ton de la marque</div>
                <div style={{ color: COLORS.muted, lineHeight: 1.55, overflowWrap: "anywhere" }}>
                  {result.brandTone}
                </div>
              </div>

              <div style={styles.resultCard}>
                <div style={styles.resultLabel}>Sections homepage</div>
                <ul style={{ ...styles.ul, marginTop: 10 }}>
                  {result.homepageSections?.map((s) => (
                    <li key={s} style={styles.li}>
                      <span style={{ ...styles.dot, background: "#38bdf8" }} />
                      <span style={{ overflowWrap: "anywhere" }}>{s}</span>
                    </li>
                  ))}
                </ul>

                <div style={{ height: 14 }} />

                <div style={styles.resultLabel}>Blocs page produit</div>
                <ul style={{ ...styles.ul, marginTop: 10 }}>
                  {result.productPageBlocks?.map((b) => (
                    <li key={b} style={styles.li}>
                      <span style={{ ...styles.dot, background: "#f97316" }} />
                      <span style={{ overflowWrap: "anywhere" }}>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        <div style={styles.bottomBand}>
          🧩 N&apos;oublie pas d&apos;activer ton abbonement shopify apres avoir générer ta boutique
        </div>
      </section>

      <style>{`
        /* ✅ scope anti-débordements */
        [data-outil-ia] *, 
        [data-outil-ia] *::before, 
        [data-outil-ia] *::after {
          box-sizing: border-box;
        }

        /* ✅ supprimer les focus rings / lueurs (boutons & CTA) */
        [data-outil-ia] .ui-btn:focus,
        [data-outil-ia] .ui-btn:focus-visible,
        [data-outil-ia] .primary-cta:focus,
        [data-outil-ia] .primary-cta:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }

        /* ✅ hover léger (pas de glow rose) */
        [data-outil-ia] .primary-cta:hover {
          transform: translateY(-1px);
          filter: brightness(1.03);
        }

        @media (max-width: 980px) {
          section[data-grid="outil"] { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 980px) {
          div[data-result-grid="1"] { grid-template-columns: 1fr !important; }
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
    maxWidth: 1200,
    margin: "0 auto",
    padding: "52px 20px 28px",
    position: "relative",
    zIndex: 1,
  },

  header: { display: "grid", gap: 14, marginBottom: 18 },
  kicker: {
    fontSize: "0.78rem",
    color: COLORS.muted,
    fontWeight: 900,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    margin: 0,
  },
  titleRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
    minWidth: 0,
  },
  title: {
    fontSize: "clamp(1.7rem, 3.2vw, 2.7rem)",
    fontWeight: 950,
    lineHeight: 1.12,
    margin: 0,
    letterSpacing: "-0.02em",
    overflowWrap: "anywhere",
  },
  sub: {
    color: COLORS.muted,
    fontSize: "1.02rem",
    margin: 0,
    maxWidth: 900,
    lineHeight: 1.5,
  },
  packBadge: {
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 950,
    fontSize: "0.8rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    border: "1px solid rgba(255,255,255,0.22)",
    whiteSpace: "nowrap",
  },

  statusRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 6,
  },
  statusPill: {
    background: COLORS.panel,
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 999,
    padding: "8px 12px",
    fontWeight: 800,
    fontSize: "0.9rem",
    color: COLORS.text,
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  secondaryBtn: {
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.22)",
    color: COLORS.text,
    padding: "9px 12px",
    borderRadius: 999,
    fontWeight: 900,
    cursor: "pointer",
    textDecoration: "none",
    appearance: "none",
    WebkitAppearance: "none",
  },
  ctaOutline: {
    background: "rgba(255,255,255,0.08)",
    border: `1px solid rgba(230,74,167,0.55)`,
    color: COLORS.text,
    padding: "9px 12px",
    borderRadius: 999,
    fontWeight: 950,
    cursor: "pointer",
    textDecoration: "none",
    appearance: "none",
    WebkitAppearance: "none",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },

  card: {
    background: COLORS.panelSoft,
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 18,
    padding: "18px 18px",
    boxShadow: "0 12px 34px rgba(0,0,0,0.25)",
    minWidth: 0,
  },
  cardTitle: {
    margin: 0,
    fontSize: "1.15rem",
    fontWeight: 950,
    letterSpacing: "-0.01em",
  },

  ul: {
    listStyle: "none",
    padding: 0,
    margin: "14px 0 0",
    display: "grid",
    gap: 10,
  },
  li: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    lineHeight: 1.5,
    color: COLORS.text,
    fontWeight: 650,
    minWidth: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: COLORS.green,
    marginTop: 7,
    flex: "0 0 auto",
  },

  label: {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: 900,
    letterSpacing: "0.02em",
    color: COLORS.muted,
    marginBottom: 6,
  },

  input: {
    width: "100%",
    maxWidth: "100%",
    borderRadius: 12,
    border: `1px solid ${COLORS.panelBorder}`,
    background: "rgba(2, 6, 23, 0.65)",
    color: COLORS.text,
    padding: "11px 12px",
    outline: "none",
    fontSize: "0.95rem",
    boxSizing: "border-box",
  },

  // ✅ file picker custom
  fileHidden: { display: "none" },
  fileRow: {
    width: "100%",
    maxWidth: "100%",
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    border: `1px solid ${COLORS.panelBorder}`,
    background: "rgba(2, 6, 23, 0.45)",
    padding: "10px 12px",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  fileBtn: {
    flex: "0 0 auto",
    padding: "8px 12px",
    borderRadius: 999,
    fontWeight: 900,
    cursor: "pointer",
    color: COLORS.text,
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.22)",
    whiteSpace: "nowrap",
  },
  fileName: {
    flex: "1 1 auto",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "rgba(255,255,255,0.75)",
    fontWeight: 700,
  },
  fileClear: {
    flex: "0 0 auto",
    padding: "6px 10px",
    borderRadius: 999,
    fontWeight: 900,
    cursor: "pointer",
    color: COLORS.text,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.18)",
    appearance: "none",
    WebkitAppearance: "none",
  },

  helper: {
    marginTop: 6,
    color: "rgba(255,255,255,0.65)",
    fontSize: "0.85rem",
    fontWeight: 650,
  },

  errorBox: {
    background: "rgba(244,63,94,0.12)",
    border: "1px solid rgba(244,63,94,0.35)",
    color: "#fecdd3",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 800,
  },

  // ✅ même dégradé que le reste + PAS de glow rose
  primaryBtn: {
    width: "100%",
    maxWidth: "100%",
    padding: "12px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.22)",
    background: BRAND_GRADIENT,
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "none",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    transition: "transform .2s ease, filter .2s ease",
  },

  ctaBig: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 14px",
    borderRadius: 999,
    fontWeight: 950,
    textDecoration: "none",
    color: "white",
    background: BRAND_GRADIENT,
    border: "1px solid rgba(255,255,255,0.22)",
    boxShadow: "none",
  },

  resultHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
  },
  resultCard: {
    background: "rgba(2,6,23,0.55)",
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 16,
    padding: "14px 14px",
    minWidth: 0,
  },
  resultLabel: {
    fontSize: "0.85rem",
    fontWeight: 950,
    color: COLORS.muted,
    letterSpacing: "0.02em",
  },
  resultValue: {
    marginTop: 6,
    fontSize: "1.15rem",
    fontWeight: 950,
    color: COLORS.text,
    overflowWrap: "anywhere",
  },

  bottomBand: {
    marginTop: 18,
    background: COLORS.panel,
    border: `1px solid ${COLORS.panelBorder}`,
    padding: "12px 14px",
    borderRadius: 14,
    textAlign: "center",
    fontWeight: 900,
    color: COLORS.text,
    maxWidth: "100%",
  },
};
