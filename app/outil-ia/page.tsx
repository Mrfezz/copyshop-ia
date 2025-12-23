// app/outil-ia/page.tsx
"use client";

import React, { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
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
  pink: "#e64aa7",
  green: "#22c55e",
};

const BRAND_GRADIENT = `linear-gradient(90deg, ${COLORS.navy} 0%, ${COLORS.violet} 70%, ${COLORS.pink} 100%)`;

function badgeForPack(packKey: MePackResponse["packKey"]) {
  if (packKey === "ia-ultime") return { label: "ULTIME", color: "linear-gradient(90deg, #22c55e, #a3e635)" };
  if (packKey === "ia-premium") return { label: "PREMIUM", color: BRAND_GRADIENT };
  if (packKey === "ia-basic") return { label: "BASIC", color: BRAND_GRADIENT };
  return null; // ✅ pas de badge “pack requis”
}

function formatCredits(pack: MePackResponse | null) {
  if (!pack?.packKey) return "—";
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

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedBoutique | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const badge = useMemo(() => badgeForPack(pack?.packKey ?? null), [pack?.packKey]);

  // ✅ Titre/Subtitle propres même pendant le chargement
  const headerTitle = useMemo(() => {
    if (pack?.packKey) return pack.title;
    return "Génère tes boutiques Shopify grâce à l’IA";
  }, [pack?.packKey, pack?.title]);

  const headerSubtitle = useMemo(() => {
    if (pack?.packKey) return pack.subtitle;
    return "Colle un lien produit et lance la génération.";
  }, [pack?.packKey, pack?.subtitle]);

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

      const data = (await res.json()) as MePackResponse;
      setPack(data);
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
      setErrorMsg("Accès indisponible : aucun pack actif sur ce compte.");
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

  const showCredits = !!pack?.packKey && !packLoading;

  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.container}>
        {/* HEADER */}
        <header style={styles.header}>
          <div style={{ display: "grid", gap: 10 }}>
            <p style={styles.kicker}>OUTIL IA • BOUTIQUES SHOPIFY</p>

            <div style={styles.titleRow}>
              <h1 style={styles.title}>{headerTitle}</h1>

              {/* ✅ badge seulement si pack actif */}
              {badge && (
                <span style={{ ...styles.packBadge, background: badge.color }}>
                  {badge.label}
                </span>
              )}
            </div>

            <p style={styles.sub}>{headerSubtitle}</p>

            {/* mini barre état */}
            <div style={styles.statusRow}>
              {!loadingPage && (
                <div style={styles.statusPill}>
                  {authToken ? `✅ Connecté : ${userEmail ?? "—"}` : "❌ Non connecté"}
                </div>
              )}

              {authToken ? (
                <button type="button" onClick={handleSignOut} style={styles.secondaryBtn}>
                  Se déconnecter
                </button>
              ) : (
                <Link href="/connexion" style={styles.secondaryBtn as any}>
                  Se connecter
                </Link>
              )}

              {/* ✅ pas de “Chargement pack…” */}
              {showCredits && (
                <div style={styles.statusPill}>Crédits : {formatCredits(pack)}</div>
              )}

              {pack?.packKey && (
                <Link href="/compte-client" style={styles.secondaryBtn as any}>
                  Mon compte
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
          </div>

          {/* RIGHT FORM */}
          <form onSubmit={handleGenerate} style={styles.card}>
            <h2 style={styles.cardTitle}>Envoyer à l’IA</h2>

            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={styles.label}>Image du produit (optionnel)</label>

                {/* ✅ FILE INPUT CUSTOM (anti-débordement iPhone) */}
                <div style={styles.fileWrap}>
                  <input
                    id="productImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={styles.fileHidden}
                  />
                  <label htmlFor="productImage" style={styles.fileBtn}>
                    Choisir un fichier
                  </label>
                  <div style={styles.fileName} title={imageName ?? "Aucun fichier sélectionné"}>
                    {imageName ?? "Aucun fichier sélectionné"}
                  </div>
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

              <button type="submit" disabled={loading || !authToken} style={styles.primaryBtn}>
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
                <div style={{ color: COLORS.text, fontWeight: 700 }}>{result.tagline}</div>

                <div style={{ height: 10 }} />

                <div style={styles.resultLabel}>Ton de la marque</div>
                <div style={{ color: COLORS.muted, lineHeight: 1.55 }}>{result.brandTone}</div>
              </div>

              <div style={styles.resultCard}>
                <div style={styles.resultLabel}>Sections homepage</div>
                <ul style={{ ...styles.ul, marginTop: 10 }}>
                  {result.homepageSections?.map((s) => (
                    <li key={s} style={styles.li}>
                      <span style={{ ...styles.dot, background: "#38bdf8" }} />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>

                <div style={{ height: 14 }} />

                <div style={styles.resultLabel}>Blocs page produit</div>
                <ul style={{ ...styles.ul, marginTop: 10 }}>
                  {result.productPageBlocks?.map((b) => (
                    <li key={b} style={styles.li}>
                      <span style={{ ...styles.dot, background: "#f97316" }} />
                      <span>{b}</span>
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
        *, *::before, *::after { box-sizing: border-box; }
        @media (max-width: 980px) {
          section[data-grid="outil"] { grid-template-columns: 1fr !important; }
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
    maxWidth: 1200,
    margin: "0 auto",
    padding: "52px 20px 28px",
    position: "relative",
    zIndex: 1,
  },
  header: {
    display: "grid",
    gap: 14,
    marginBottom: 18,
  },
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
  },
  title: {
    fontSize: "clamp(1.7rem, 3.2vw, 2.7rem)",
    fontWeight: 950,
    lineHeight: 1.12,
    margin: 0,
    letterSpacing: "-0.02em",
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
    boxShadow: "0 10px 22px rgba(0,0,0,0.25)",
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
    maxWidth: "100%",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },

  card: {
    background: COLORS.panelSoft,
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 18,
    padding: "18px 18px",
    boxShadow: "0 12px 34px rgba(0,0,0,0.25)",
    overflow: "hidden", // ✅ évite tout débordement visuel
    maxWidth: "100%",
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

  // ✅ File input custom
  fileWrap: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: 10,
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${COLORS.panelBorder}`,
    background: "rgba(2, 6, 23, 0.45)",
    boxSizing: "border-box",
  },
  fileHidden: {
    position: "absolute",
    left: -99999,
    width: 1,
    height: 1,
    opacity: 0,
  },
  fileBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.10)",
    color: COLORS.text,
    whiteSpace: "nowrap",
  },
  fileName: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "rgba(255,255,255,0.72)",
    fontWeight: 750,
  },

  input: {
    width: "100%",
    borderRadius: 12,
    border: `1px solid ${COLORS.panelBorder}`,
    background: "rgba(2, 6, 23, 0.65)",
    color: COLORS.text,
    padding: "11px 12px",
    outline: "none",
    fontSize: "0.95rem",
    boxSizing: "border-box",
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
    boxSizing: "border-box",
  },

  // ✅ bouton brand gradient + PAS de lueur rose
  primaryBtn: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.22)",
    background: BRAND_GRADIENT,
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(0,0,0,0.28)", // ✅ glow neutre
    opacity: 1,
    boxSizing: "border-box",
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
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  resultCard: {
    background: "rgba(2,6,23,0.55)",
    border: `1px solid ${COLORS.panelBorder}`,
    borderRadius: 16,
    padding: "14px 14px",
    boxSizing: "border-box",
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
    boxSizing: "border-box",
  },
};
