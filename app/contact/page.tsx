"use client";

// app/contact/page.tsx
import type React from "react";
import { useState } from "react";

const COLORS = {
  bgTop: "#0b1026",
  bgMid: "#0f1635",
  bgBottom: "#171a52",

  text: "#eef1ff",
  muted: "#c9d2ff",

  navy: "#0b0f2a",
  violet: "#6a2fd6",
  violetDeep: "#4338ca",
  pink: "#e64aa7",

  cardBg: "rgba(14,18,48,0.92)",
  boxBorder: "rgba(120,140,255,0.22)",
  inputBg: "rgba(7,10,28,0.9)",
  inputBorder: "rgba(255,255,255,0.12)",
};

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string>("");

  return (
    <main style={styles.page}>
      <div style={styles.bgGradient} />
      <div style={styles.bgDots} />

      <section style={styles.container}>
        <header style={styles.header}>
          <div style={styles.kicker}>CONTACT</div>
          <h1 style={styles.title}>Avez-vous une question&nbsp;?</h1>
          <p style={styles.sub}>Écris-moi et on lance ton projet rapidement.</p>
        </header>

        <div style={styles.grid} className="contact-grid">
          {/* LEFT CARD */}
          <aside style={styles.leftCard}>
            <h2 style={styles.leftTitle}>On répond vite ⚡</h2>
            <p style={styles.leftSub}>
              Support Lun-Sam 9h-18h — réponse moyenne 8h.
            </p>

            <div style={styles.channelList}>
              <div style={styles.channelItem}>
                <div>
                  <div style={styles.channelLabel}>WhatsApp</div>
                  <div style={styles.channelValue}>+33 7 45 21 49 22</div>
                </div>
                <div style={styles.channelMeta}>Réponse moyenne&nbsp;: 8h</div>
              </div>

              <div style={styles.channelItem}>
                <div>
                  <div style={styles.channelLabel}>Snapchat</div>
                  <div style={styles.channelValue}>mr.fezz</div>
                </div>
              </div>

              <div style={styles.channelItem}>
                <div>
                  <div style={styles.channelLabel}>Instagram</div>
                  <div style={styles.channelValue}>mr.fez__</div>
                </div>
              </div>

              <div style={styles.channelItem}>
                <div>
                  <div style={styles.channelLabel}>TikTok</div>
                  <div style={styles.channelValue}>mr.fezzz</div>
                </div>
              </div>

              {/* ✅ Gmail ajouté */}
              <div style={styles.channelItem}>
                <div>
                  <div style={styles.channelLabel}>Gmail</div>
                  <div style={styles.channelValue}>copyshopp.ia@gmail.com</div>
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/33745214922"
              style={styles.whatsBtn}
              className="whatsBtn"
              target="_blank"
              rel="noreferrer"
            >
              Ouvrir WhatsApp
            </a>

            <div style={styles.leftFoot}>
              Tu peux aussi laisser un message via le formulaire 👉
            </div>
          </aside>

          {/* RIGHT CARD */}
          <form
            style={styles.formCard}
            onSubmit={async (e) => {
              e.preventDefault();
              setStatus("loading");
              setErrorMsg("");

              const form = e.currentTarget;
              const fd = new FormData(form);

              const name = String(fd.get("name") || "").trim();
              const email = String(fd.get("email") || "").trim();
              const message = String(fd.get("message") || "").trim();

              try {
                const res = await fetch("/api/contact", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, email, message }),
                });

                const data = await res.json().catch(() => ({}));

                if (!res.ok || !data?.ok) {
                  throw new Error(data?.error || "Erreur lors de l’envoi");
                }

                setStatus("success");
                form.reset();
              } catch (err: any) {
                setStatus("error");
                setErrorMsg(err?.message || "Erreur lors de l’envoi");
              }
            }}
          >
            <label style={styles.label}>
              Nom
              <input
                name="name"
                style={styles.input}
                type="text"
                placeholder="Ton nom"
                required
              />
            </label>

            <label style={styles.label}>
              Email
              <input
                name="email"
                style={styles.input}
                type="email"
                placeholder="toi@gmail.com"
                required
              />
            </label>

            <label style={styles.label}>
              Message
              <textarea
                name="message"
                style={styles.textarea}
                placeholder="Explique-moi ce dont tu as besoin..."
                required
              />
            </label>

            <button type="submit" style={styles.submitBtn} disabled={status === "loading"}>
              {status === "loading" ? "Envoi..." : "Envoyer"}
            </button>

            {status === "success" && (
              <div style={styles.success}>✅ Message envoyé !</div>
            )}

            {status === "error" && (
              <div style={styles.error}>❌ {errorMsg}</div>
            )}
          </form>
        </div>

        <div style={styles.bottomNote}>
          Ou écris directement sur WhatsApp si c’est urgent.
        </div>
      </section>

      {/* ✅ responsive FIX (mobile seulement) */}
      <style>{`
        @media (max-width: 980px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }

        /* ✅ Mobile: le bouton WhatsApp reste dans le bloc */
        @media (max-width: 520px) {
          .whatsBtn {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            display: inline-flex !important;
            justify-content: center !important;
            align-items: center !important;
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
    marginBottom: 28,
  },
  kicker: {
    letterSpacing: "0.28em",
    fontWeight: 900,
    fontSize: "0.85rem",
    color: COLORS.muted,
  },
  title: {
    fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
    fontWeight: 900,
    lineHeight: 1.08,
    margin: "10px 0 6px",
  },
  sub: {
    color: COLORS.muted,
    fontSize: "1.05rem",
    margin: 0,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
  },

  leftCard: {
    minWidth: 0,
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.boxBorder}`,
    borderRadius: 16,
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxSizing: "border-box",
  },
  leftTitle: {
    margin: 0,
    fontSize: "1.45rem",
    fontWeight: 900,
  },
  leftSub: {
    margin: 0,
    color: "rgba(255,255,255,0.9)",
    fontSize: "1rem",
  },

  channelList: {
    display: "grid",
    gap: 10,
    marginTop: 4,
  },
  channelItem: {
    background: "rgba(8,12,36,0.55)",
    border: `1px solid ${COLORS.boxBorder}`,
    borderRadius: 12,
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
    boxSizing: "border-box",
  },
  channelLabel: {
    fontSize: "0.9rem",
    color: COLORS.muted,
    fontWeight: 800,
  },
  channelValue: {
    fontSize: "1.05rem",
    fontWeight: 900,
  },
  channelMeta: {
    fontSize: "0.9rem",
    color: "rgba(255,255,255,0.85)",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  whatsBtn: {
    marginTop: 6,
    width: "fit-content",
    maxWidth: "100%",
    boxSizing: "border-box",
    padding: "12px 16px",
    borderRadius: 999,
    fontWeight: 900,
    color: "white",
    textDecoration: "none",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    boxShadow: "0 10px 26px rgba(106,47,214,0.45)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  leftFoot: {
    marginTop: 2,
    fontWeight: 800,
    color: "rgba(255,255,255,0.9)",
  },

  formCard: {
    minWidth: 0,
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.boxBorder}`,
    borderRadius: 16,
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxSizing: "border-box",
    overflow: "hidden",
  },

  label: {
    display: "grid",
    gap: 6,
    fontWeight: 800,
    fontSize: "0.95rem",
    color: COLORS.text,
  },

  input: {
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    display: "block",
    padding: "12px 14px",
    borderRadius: 10,
    border: `1px solid ${COLORS.inputBorder}`,
    background: COLORS.inputBg,
    color: COLORS.text,
    outline: "none",
    fontSize: "1rem",
  },

  textarea: {
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    display: "block",
    padding: "12px 14px",
    borderRadius: 10,
    border: `1px solid ${COLORS.inputBorder}`,
    background: COLORS.inputBg,
    color: COLORS.text,
    outline: "none",
    fontSize: "1rem",
    minHeight: 150,
    resize: "vertical",
  },

  submitBtn: {
    marginTop: 6,
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 16px",
    borderRadius: 12,
    fontWeight: 900,
    fontSize: "1.05rem",
    color: "white",
    border: "none",
    cursor: "pointer",
    background: `linear-gradient(90deg, ${COLORS.navy} 0%, ${COLORS.violet} 70%, ${COLORS.pink} 100%)`,
    boxShadow: "0 12px 30px rgba(106,47,214,0.35)",
    opacity: 1,
  },

  success: {
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(40,180,120,0.12)",
    border: "1px solid rgba(40,180,120,0.35)",
    fontWeight: 800,
    textAlign: "center",
  },

  error: {
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.35)",
    fontWeight: 800,
    textAlign: "center",
  },

  bottomNote: {
    marginTop: 16,
    textAlign: "center",
    color: COLORS.muted,
    fontWeight: 800,
  },
};
