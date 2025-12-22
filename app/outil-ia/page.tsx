// app/outil-ia/page.tsx
"use client";

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type GeneratedBoutique = {
  storeName: string;
  tagline: string;
  homepageSections: string[];
  productPageBlocks: string[];
  brandTone: string;
};

type ApiError = { error?: string };

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: "0.75rem",
  border: "1px solid rgba(148,163,184,0.6)",
  backgroundColor: "#020617",
  color: "#f9fafb",
  padding: "0.55rem 0.7rem",
  fontSize: "0.85rem",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.82rem",
  color: "#cbd5f5",
  marginBottom: "0.3rem",
  display: "block",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#020617",
  borderRadius: "1.5rem",
  border: "1px solid rgba(148,163,184,0.7)",
  padding: "1.6rem 1.5rem",
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "#e5e7eb",
  fontSize: "0.9rem",
  fontWeight: 650,
};

export default function OutilIAPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [productUrl, setProductUrl] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedBoutique | null>(null);

  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!ignore) {
        setSession(data.session ?? null);
        setCheckingAuth(false);
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

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setImageBase64(null);
      setImageName(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string; // data:image/...;base64,...
      setImageBase64(base64);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  }

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setStatusMsg(null);
    setResult(null);

    // ✅ Ton API exige productUrl
    const url = productUrl.trim();
    if (!url) {
      setErrorMsg("Pour l’instant, le lien produit est obligatoire (l’image sera ajoutée après).");
      return;
    }

    // ✅ Doit être connecté
    const accessToken = session?.access_token;
    if (!accessToken) {
      setErrorMsg("Tu dois être connecté pour utiliser l’outil IA.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/outil-ia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          productUrl: url,
          imageBase64, // accepté (pas utilisé pour l’instant)
          // productKey: "ia-basic", // optionnel si tu veux forcer un pack précis
        }),
      });

      // 🔥 Gestion erreurs API
      if (!res.ok) {
        let payload: ApiError | null = null;
        try {
          payload = (await res.json()) as ApiError;
        } catch {
          // ignore
        }

        const msg = payload?.error || (await res.text()) || "Erreur inconnue";

        if (res.status === 401) {
          setErrorMsg("Session invalide. Reconnecte-toi pour continuer.");
          return;
        }

        if (res.status === 403) {
          setErrorMsg(
            "Accès refusé : aucun pack actif détecté. Achète un pack IA puis reconnecte-toi."
          );
          return;
        }

        if (res.status === 400) {
          setErrorMsg(msg);
          return;
        }

        setErrorMsg(`Erreur serveur (${res.status}) : ${msg}`);
        return;
      }

      const data = (await res.json()) as GeneratedBoutique;

      setResult(data);
      setStatusMsg("✅ Boutique générée avec succès.");
    } catch (err) {
      console.error("Erreur réseau :", err);
      setErrorMsg("Erreur réseau pendant l'appel à l'IA.");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const userEmail = session?.user?.email ?? "";

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "3.5rem 1.5rem 3rem",
        background:
          "radial-gradient(circle at top left, #1d4ed8 0, #020617 55%, #020617 100%)",
        color: "#f9fafb",
      }}
    >
      <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
        {/* HEADER */}
        <header style={{ marginBottom: "1.4rem" }}>
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#a5b4fc",
              marginBottom: "0.5rem",
            }}
          >
            Outil IA • Boutiques Shopify
          </p>

          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "0.3rem" }}>
            Génère une boutique Shopify (pack requis).
          </h1>

          <p style={{ fontSize: "0.95rem", color: "#e5e7eb", maxWidth: "720px" }}>
            Colle un lien produit (AliExpress / fournisseur). L’IA génère : nom, slogan,
            sections, page produit. <br />
            <span style={{ color: "rgba(255,255,255,0.70)" }}>
              (L’analyse d’image viendra après — ton API actuelle utilise surtout le lien.)
            </span>
          </p>

          {/* Auth line */}
          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {checkingAuth ? (
              <span style={pillStyle}>⏳ Vérification de la session…</span>
            ) : session ? (
              <>
                <span style={pillStyle}>✅ Connecté : <strong>{userEmail}</strong></span>
                <button
                  onClick={signOut}
                  style={{
                    ...pillStyle,
                    cursor: "pointer",
                    background: "rgba(255,255,255,0.08)",
                  }}
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <span style={pillStyle}>🔒 Connecte-toi pour utiliser l’outil IA</span>
                <a
                  href="/compte-client"
                  style={{
                    ...pillStyle,
                    textDecoration: "none",
                    background: "linear-gradient(to right, #22c55e, #a3e635, #facc15)",
                    color: "#022c22",
                    border: "none",
                  }}
                >
                  Aller à l’espace client
                </a>
              </>
            )}
          </div>

          {/* Messages */}
          {errorMsg && (
            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(255, 77, 77, 0.35)",
                background: "rgba(255, 77, 77, 0.12)",
                color: "#ffb3b3",
                fontWeight: 700,
              }}
            >
              ❌ {errorMsg}
              {errorMsg.includes("pack actif") && (
                <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <a
                    href="/packs-ia"
                    style={{
                      ...pillStyle,
                      textDecoration: "none",
                      background: "rgba(255,255,255,0.10)",
                    }}
                  >
                    Voir les packs IA
                  </a>
                  <a
                    href="/compte-client"
                    style={{
                      ...pillStyle,
                      textDecoration: "none",
                      background: "rgba(255,255,255,0.10)",
                    }}
                  >
                    Me reconnecter
                  </a>
                </div>
              )}
            </div>
          )}

          {statusMsg && !errorMsg && (
            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                borderRadius: 14,
                border: "1px solid rgba(64, 255, 141, 0.35)",
                background: "rgba(64, 255, 141, 0.10)",
                color: "#b7ffd9",
                fontWeight: 800,
              }}
            >
              {statusMsg}
            </div>
          )}
        </header>

        {/* GRID : EXPLICATION + FORMULAIRE */}
        <section
          className="outil-grid"
          style={{
            display: "grid",
            gap: "1.6rem",
            gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr)",
            alignItems: "flex-start",
          }}
        >
          {/* COLONNE GAUCHE : EXPLICATION */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.7rem" }}>
              Comment ça marche
            </h2>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: "0.9rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <li style={{ display: "flex", gap: "0.45rem" }}>
                <span
                  style={{
                    marginTop: "0.4rem",
                    width: "7px",
                    height: "7px",
                    borderRadius: "999px",
                    backgroundColor: "#22c55e",
                    flexShrink: 0,
                  }}
                />
                <span>Colle un lien produit (AliExpress / fournisseur).</span>
              </li>

              <li style={{ display: "flex", gap: "0.45rem" }}>
                <span
                  style={{
                    marginTop: "0.4rem",
                    width: "7px",
                    height: "7px",
                    borderRadius: "999px",
                    backgroundColor: "#22c55e",
                    flexShrink: 0,
                  }}
                />
                <span>L’IA te renvoie un JSON complet pour construire la boutique.</span>
              </li>

              <li style={{ display: "flex", gap: "0.45rem" }}>
                <span
                  style={{
                    marginTop: "0.4rem",
                    width: "7px",
                    height: "7px",
                    borderRadius: "999px",
                    backgroundColor: "#22c55e",
                    flexShrink: 0,
                  }}
                />
                <span>
                  Accès réservé aux clients avec un pack actif (entitlements).
                </span>
              </li>
            </ul>

            <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#9ca3af" }}>
              ⚠️ Si tu as payé mais que ça bloque : reconnecte-toi, ou vérifie que
              ton email apparaît dans <strong>entitlements</strong> avec <strong>active = true</strong>.
            </p>
          </div>

          {/* COLONNE DROITE : FORMULAIRE */}
          <form onSubmit={handleGenerate} style={cardStyle}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.9rem" }}>
              Envoyer à l’IA
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <div>
                <label style={labelStyle}>Image du produit (optionnel)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ ...inputStyle, padding: "0.4rem 0.7rem", cursor: "pointer" }}
                />
                {imageName && (
                  <p style={{ marginTop: "0.35rem", fontSize: "0.78rem", color: "#9ca3af" }}>
                    Image sélectionnée : {imageName}
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Lien produit (obligatoire pour le moment)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={loading || checkingAuth || !session}
                style={{
                  marginTop: "0.6rem",
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "999px",
                  border: "none",
                  background: "linear-gradient(to right, #22c55e, #a3e635, #facc15)",
                  color: "#022c22",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  cursor: loading ? "wait" : "pointer",
                  opacity: loading || checkingAuth || !session ? 0.7 : 1,
                }}
              >
                {loading ? "Génération..." : "Générer ma boutique"}
              </button>

              {!session && !checkingAuth && (
                <a
                  href="/compte-client"
                  style={{
                    marginTop: 8,
                    textAlign: "center",
                    textDecoration: "none",
                    color: "#a5b4fc",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                  }}
                >
                  Se connecter pour activer l’outil
                </a>
              )}
            </div>
          </form>
        </section>

        {/* RÉSULTAT */}
        {result && (
          <section style={{ marginTop: "2rem", ...cardStyle }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.4rem" }}>
              Boutique générée
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#a5b4fc", marginBottom: "1rem" }}>
              À adapter ensuite dans Shopify.
            </p>

            <div
              className="result-grid"
              style={{
                display: "grid",
                gap: "1.2rem",
                gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                  Nom de la boutique
                </h3>
                <p style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.6rem" }}>
                  {result.storeName}
                </p>

                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                  Slogan
                </h3>
                <p style={{ fontSize: "0.9rem", color: "#e5e7eb", marginBottom: "0.8rem" }}>
                  {result.tagline}
                </p>

                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                  Ton de la marque
                </h3>
                <p style={{ fontSize: "0.86rem", color: "#cbd5f5" }}>{result.brandTone}</p>
              </div>

              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                  Sections page d’accueil
                </h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    fontSize: "0.86rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.3rem",
                    marginBottom: "0.9rem",
                  }}
                >
                  {result.homepageSections?.map((s) => (
                    <li key={s} style={{ display: "flex", gap: "0.4rem" }}>
                      <span
                        style={{
                          marginTop: "0.4rem",
                          width: "6px",
                          height: "6px",
                          borderRadius: "999px",
                          backgroundColor: "#38bdf8",
                          flexShrink: 0,
                        }}
                      />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>

                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                  Blocs page produit
                </h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    fontSize: "0.86rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.3rem",
                  }}
                >
                  {result.productPageBlocks?.map((b) => (
                    <li key={b} style={{ display: "flex", gap: "0.4rem" }}>
                      <span
                        style={{
                          marginTop: "0.4rem",
                          width: "6px",
                          height: "6px",
                          borderRadius: "999px",
                          backgroundColor: "#f97316",
                          flexShrink: 0,
                        }}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 980px) {
          .outil-grid { grid-template-columns: 1fr !important; }
          .result-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
