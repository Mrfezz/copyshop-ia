"use client";

// app/compte-client/page.tsx
import React, { Suspense, useEffect, useMemo, useState } from "react";
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

/**
 * ✅ IMPORTANT (fix Vercel)
 * useSearchParams() DOIT être dans un composant rendu sous <Suspense>.
 */
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

function humanizeAuthError(err: any) {
  const raw = (err?.message ?? err ?? "").toString();
  const msg = raw.trim() || "Erreur inconnue.";

  // cas les + fréquents supabase
  if (/invalid login credentials/i.test(msg)) return "Email ou mot de passe incorrect.";
  if (/user already registered|already exists/i.test(msg))
    return "Ce compte existe déjà. Passe sur « Se connecter ».";
  if (/email not confirmed/i.test(msg))
    return "Email non confirmé. Vérifie ta boîte mail (ou renvoie un email de confirmation).";

  // fetch / réseau (souvent affiché en FR par Chrome)
  if (
    msg === "Échec de la récupération" ||
    /failed to fetch/i.test(msg) ||
    /fetch/i.test(msg)
  ) {
    return "Impossible de contacter Supabase (réseau / bloqueur / config). Essaie sans AdBlock et vérifie tes variables NEXT_PUBLIC_SUPABASE_URL / ANON_KEY sur Vercel.";
  }

  return msg;
}

export default function CompteClientPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  // auth UI
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMsg, setAuthMsg] = useState<string | null>(null);

  // ✅ show/hide password
  const [showPassword, setShowPassword] = useState(false);

  // ✅ forgot password flow
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // ✅ recovery flow (quand l’utilisateur revient via lien email Supabase)
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryMsg, setRecoveryMsg] = useState<string | null>(null);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);

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

  // ✅ détecte le retour “type=recovery” (dans le hash)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const h = window.location.hash || "";
    if (h.includes("type=recovery")) {
      setRecoveryMode(true);
      setForgotMode(false);
      setAuthError(null);
      setAuthMsg(null);
    }
  }, []);

  const userEmail = session?.user?.email ?? "";

  const origin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthMsg(null);
    setForgotError(null);
    setForgotMsg(null);
    setAuthLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setAuthMsg("Connecté ✅");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setAuthMsg("Compte créé ✅ (vérifie ton email si demandé)");
      }
    } catch (err: any) {
      const nice = humanizeAuthError(err);
      setAuthError(nice);

      // petit bonus : si il essaye de s’inscrire alors que le compte existe → on bascule en login
      if (mode === "signup" && /existe déjà/i.test(nice)) {
        setMode("login");
      }
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotError(null);
    setForgotMsg(null);
    setAuthError(null);
    setAuthMsg(null);
    setForgotLoading(true);

    try {
      const mail = email.trim();
      if (!mail) throw new Error("Entre ton email.");

      const { error } = await supabase.auth.resetPasswordForEmail(mail, {
        redirectTo: `${origin}/compte-client`,
      });

      if (error) throw error;

      setForgotMsg("✅ Email envoyé. Regarde ta boîte mail (et les spams).");
    } catch (err: any) {
      setForgotError(humanizeAuthError(err));
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setRecoveryError(null);
    setRecoveryMsg(null);
    setRecoveryLoading(true);

    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error("Choisis un mot de passe (au moins 6 caractères).");
      }
      if (newPassword !== newPassword2) {
        throw new Error("Les deux mots de passe ne correspondent pas.");
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setRecoveryMsg("✅ Mot de passe mis à jour. Tu peux te connecter.");
      setRecoveryMode(false);

      // Nettoie l’URL (hash)
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, "/compte-client");
      }

      // Optionnel : on te laisse te reconnecter proprement
      await supabase.auth.signOut();
      setMode("login");
      setPassword("");
      setNewPassword("");
      setNewPassword2("");
    } catch (err: any) {
      setRecoveryError(humanizeAuthError(err));
    } finally {
      setRecoveryLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
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

          {/* ✅ Banner paiement validé (quand on arrive de Stripe) */}
          <Suspense fallback={null}>
            <PaymentSuccessBanner hidden={checking || !!session} />
          </Suspense>

          {/* petite ligne "connecté en tant que" */}
          {!checking && session && (
            <div style={styles.loggedLine}>
              Connecté : <strong>{userEmail}</strong>
              <button onClick={signOut} style={styles.logoutBtn}>
                Se déconnecter
              </button>
            </div>
          )}
        </header>

        {/* LOADING session */}
        {checking && (
          <div style={styles.loadingBox}>Chargement de ton espace client...</div>
        )}

        {/* PAS CONNECTÉ → AUTH CARD */}
        {!checking && !session && (
          <div style={styles.authWrap}>
            <div style={styles.authCard}>
              {/* ✅ MODE RECOVERY : reset password */}
              {recoveryMode ? (
                <>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 900, fontSize: "1.15rem" }}>
                      Réinitialiser le mot de passe
                    </div>
                    <div style={{ color: COLORS.muted, fontWeight: 700, marginTop: 6 }}>
                      Choisis un nouveau mot de passe pour ton compte.
                    </div>
                  </div>

                  <form onSubmit={handleUpdatePassword} style={styles.authForm}>
                    <label style={styles.label}>Nouveau mot de passe</label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={styles.input}
                    />

                    <label style={styles.label}>Confirmer le mot de passe</label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={newPassword2}
                      onChange={(e) => setNewPassword2(e.target.value)}
                      style={styles.input}
                    />

                    <label style={styles.inlineRow}>
                      <input
                        type="checkbox"
                        checked={showNewPassword}
                        onChange={(e) => setShowNewPassword(e.target.checked)}
                      />
                      <span>Afficher le mot de passe</span>
                    </label>

                    {recoveryError && <div style={styles.authError}>{recoveryError}</div>}
                    {recoveryMsg && <div style={styles.authMsg}>{recoveryMsg}</div>}

                    <button disabled={recoveryLoading} style={styles.authBtn} type="submit">
                      {recoveryLoading ? "Patiente..." : "Mettre à jour"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryMode(false);
                        setMode("login");
                        setRecoveryError(null);
                        setRecoveryMsg(null);
                        if (typeof window !== "undefined") {
                          window.history.replaceState({}, document.title, "/compte-client");
                        }
                      }}
                      style={styles.linkBtn}
                    >
                      ← Retour connexion
                    </button>
                  </form>
                </>
              ) : forgotMode ? (
                <>
                  {/* ✅ MODE FORGOT */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 900, fontSize: "1.15rem" }}>
                      Mot de passe oublié ?
                    </div>
                    <div style={{ color: COLORS.muted, fontWeight: 700, marginTop: 6 }}>
                      Entre ton email et on t’envoie un lien pour réinitialiser ton mot de passe.
                    </div>
                  </div>

                  <form onSubmit={handleForgotPassword} style={styles.authForm}>
                    <label style={styles.label}>Email</label>
                    <input
                      type="email"
                      required
                      placeholder="toi@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={styles.input}
                    />

                    {forgotError && <div style={styles.authError}>{forgotError}</div>}
                    {forgotMsg && <div style={styles.authMsg}>{forgotMsg}</div>}

                    <button disabled={forgotLoading} style={styles.authBtn} type="submit">
                      {forgotLoading ? "Envoi..." : "Envoyer le lien"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setForgotMode(false);
                        setForgotError(null);
                        setForgotMsg(null);
                      }}
                      style={styles.linkBtn}
                    >
                      ← Retour connexion
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div style={styles.authTabs}>
                    <button
                      onClick={() => setMode("login")}
                      style={{
                        ...styles.authTab,
                        ...(mode === "login" ? styles.authTabActive : {}),
                      }}
                    >
                      Se connecter
                    </button>
                    <button
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
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={styles.input}
                    />

                    <div style={styles.rowBetween}>
                      <label style={styles.inlineRow}>
                        <input
                          type="checkbox"
                          checked={showPassword}
                          onChange={(e) => setShowPassword(e.target.checked)}
                        />
                        <span>Afficher le mot de passe</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setForgotMode(true);
                          setAuthError(null);
                          setAuthMsg(null);
                        }}
                        style={styles.linkBtnInline}
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>

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
                </>
              )}
            </div>
          </div>
        )}

        {/* CONNECTÉ → CONTENU CLIENT */}
        {!checking && session && (
          <div className="client-grid" style={styles.grid}>
            {/* Achats */}
            <article style={styles.card}>
              <h2 style={styles.cardTitle}>Mes achats</h2>
              <p style={styles.cardText}>Historique de tes packs + factures.</p>

              <div style={styles.infoBox}>
                <div style={styles.infoLine}>
                  <span style={styles.infoLabel}>Dernier pack :</span>
                  <span style={styles.infoValue}>—</span>
                </div>
                <div style={styles.infoLine}>
                  <span style={styles.infoLabel}>Date :</span>
                  <span style={styles.infoValue}>—</span>
                </div>
              </div>

              <a href="/packs-ia" style={styles.buttonAlt}>
                Voir les packs
              </a>
            </article>

            {/* Panier */}
            <article style={styles.card}>
              <h2 style={styles.cardTitle}>Panier</h2>
              <p style={styles.cardText}>
                Reprends ton achat ou passe à un pack supérieur.
              </p>
              <a href="/panier" style={styles.button}>
                Aller au panier
              </a>
            </article>

            {/* Messagerie */}
            <article style={styles.card}>
              <h2 style={styles.cardTitle}>Messagerie</h2>
              <p style={styles.cardText}>Accède à tes messages avec le support.</p>
              <a href="/messages" style={styles.buttonAlt}>
                Ouvrir la messagerie
              </a>
              <div style={styles.smallNote}>(on branchera Supabase messages après)</div>
            </article>

            {/* Accès outil IA */}
            <article style={styles.card}>
              <h2 style={styles.cardTitle}>Accès outil IA</h2>
              <p style={styles.cardText}>Disponible après achat d’un pack IA.</p>

              <a href="/outil-ia" style={styles.button}>
                Ouvrir l’outil
              </a>

              <div style={styles.smallNote}>
                (Le lien s’activera automatiquement après paiement)
              </div>
            </article>

            {/* Recharges */}
            <article style={styles.card}>
              <h2 style={styles.cardTitle}>Recharges</h2>
              <p style={styles.cardText}>
                Ajoute <strong>5 boutiques supplémentaires</strong> sur ton pack
                Basic/Premium.
              </p>

              <a href="/paiement?product=recharge-ia" style={styles.buttonAlt}>
                Voir les recharges
              </a>
            </article>

            {/* Support */}
            <article style={styles.card}>
              <h2 style={styles.cardTitle}>Support</h2>
              <p style={styles.cardText}>
                Assistance rapide via WhatsApp.
                <br />
                Réponse moyenne : <strong>8h</strong> (Lun–Sam 9h–18h).
              </p>

              <a
                href="https://wa.me/33745214922"
                target="_blank"
                rel="noreferrer"
                style={styles.button}
              >
                Me contacter
              </a>
            </article>
          </div>
        )}
      </section>

      {/* responsive */}
      <style>{`
        @media (max-width: 980px) {
          .client-grid {
            grid-template-columns: 1fr !important;
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

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
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
  },
  infoLabel: {
    color: COLORS.muted,
    fontWeight: 800,
  },
  infoValue: {
    fontWeight: 900,
    color: COLORS.text,
  },

  smallNote: {
    marginTop: 4,
    fontSize: "0.9rem",
    color: "rgba(255,255,255,0.7)",
  },

  /* AUTH */
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

  rowBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 2,
  },
  inlineRow: {
    display: "inline-flex",
    gap: 8,
    alignItems: "center",
    color: "rgba(255,255,255,0.78)",
    fontWeight: 700,
    fontSize: "0.92rem",
  },
  linkBtnInline: {
    background: "transparent",
    border: "none",
    padding: 0,
    color: "rgba(201,210,255,0.95)",
    fontWeight: 900,
    cursor: "pointer",
    textDecoration: "underline",
  },
  linkBtn: {
    marginTop: 10,
    background: "transparent",
    border: "none",
    padding: 0,
    color: "rgba(201,210,255,0.95)",
    fontWeight: 900,
    cursor: "pointer",
    textDecoration: "underline",
    justifySelf: "start",
  },
};
