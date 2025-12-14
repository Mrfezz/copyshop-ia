"use client";

// app/components/footer.tsx
import { useState } from "react";
import type { CSSProperties, FormEvent } from "react";

const COLORS = {
  bgTop: "#0b1026",
  bgMid: "#0f1635",
  bgBottom: "#171a52",

  text: "#eef1ff",
  muted: "#c9d2ff",

  cardBg: "rgba(18, 22, 58, 0.9)",
  boxBorder: "rgba(120,140,255,0.20)",

  violet: "#6a2fd6",
  violetDeep: "#4338ca",
  pink: "#e64aa7",
};

const LEGAL_LINKS = [
  { label: "Conditions de service", href: "/conditions-de-service" },
  { label: "Politique d’expédition", href: "/politique-expedition" },
  { label: "Conditions de vente", href: "/conditions-de-vente" },
  { label: "Politique de remboursement", href: "/politique-remboursement" },
  { label: "Politique de confidentialité", href: "/politique-confidentialite" },
  { label: "Mentions légales", href: "/mentions-legales" },
];

const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Packs IA", href: "/packs-ia" },
  { label: "Services digitaux", href: "/services-digitaux" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "FAQ", href: "/faq" },
  { label: "Suivre ma commande", href: "/suivre-ma-commande" },
  { label: "Contact", href: "/contact" },
  { label: "Qui sommes-nous ?", href: "/qui-sommes-nous" },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    alert("Merci ! Tu es bien inscrit(e) à la newsletter.");
    setEmail("");
  }

  return (
    <footer style={styles.footer}>
      {/* Fond gradient type digital */}
      <div style={styles.bgGradient} aria-hidden />

      <div style={styles.container}>
        {/* Newsletter */}
        <section style={styles.newsletterBox}>
          <h3 style={styles.newsTitle}>Abonne-toi à la newsletter @</h3>
          <p style={styles.newsSub}>
            Reçois dans ta boîte mail des réductions, des conseils et nos nouveautés.
          </p>

          <form onSubmit={onSubmit} style={styles.newsForm} className="foot-news-form">
            <input
              type="email"
              required
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.newsInput}
            />
            <button type="submit" style={styles.newsBtn}>
              S’abonner
            </button>
          </form>
        </section>

        {/* ✅ DESKTOP : 3 blocs alignés */}
        <section style={styles.columns} className="footer-cols footer-desktop">
          {/* Pages légales */}
          <div style={styles.colCard}>
            <h4 style={styles.colTitle}>Pages légales</h4>
            <ul style={styles.colList}>
              {LEGAL_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} style={styles.link}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div style={styles.colCard}>
            <h4 style={styles.colTitle}>Navigation</h4>
            <ul style={styles.colList}>
              {NAV_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} style={styles.link}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Infos entreprise */}
          <div style={styles.colCard}>
            <h4 style={styles.colTitle}>Informations de l’entreprise</h4>

            <div style={styles.infoLine}>
              <strong>Nom :</strong> Copyshop IA
            </div>
            <div style={styles.infoLine}>
              <strong>Site :</strong> www.copyshop-ia.com
            </div>
            <div style={styles.infoLine}>
              <strong>WhatsApp :</strong> +33 7 45 21 49 22
            </div>
            <div style={styles.infoLine}>
              <strong>Support :</strong> Lun–Sam 9h–18h
            </div>
          </div>
        </section>

        {/* ✅ MOBILE : 2 blocs (fusion + infos) */}
        <section className="footer-mobile" style={styles.mobileWrap}>
          {/* Bloc fusionné */}
          <div style={styles.colCard}>
            <div style={styles.mobileTwoCols}>
              <div>
                <h4 style={styles.colTitle}>Pages légales</h4>
                <ul style={styles.colListCompact}>
                  {LEGAL_LINKS.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} style={styles.link}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 style={styles.colTitle}>Navigation</h4>
                <ul style={styles.colListCompact}>
                  {NAV_LINKS.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} style={styles.link}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Infos entreprise */}
          <div style={styles.colCard}>
            <h4 style={styles.colTitle}>Informations de l’entreprise</h4>

            <div style={styles.infoLine}>
              <strong>Nom :</strong> Copyshop IA
            </div>
            <div style={styles.infoLine}>
              <strong>Site :</strong> www.copyshop-ia.com
            </div>
            <div style={styles.infoLine}>
              <strong>WhatsApp :</strong> +33 7 45 21 49 22
            </div>
            <div style={styles.infoLine}>
              <strong>Support :</strong> Lun–Sam 9h–18h
            </div>
          </div>
        </section>

        {/* Bas footer */}
        <div style={styles.bottomBar}>© {new Date().getFullYear()} Copyshop IA — by Mr Fez</div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 980px) {
          .foot-news-form {
            grid-template-columns: 1fr !important;
          }
          .foot-news-form button {
            width: 100% !important;
          }
        }

        /* ✅ Mobile: on cache la version desktop (3 blocs) et on affiche la fusion */
        @media (max-width: 820px) {
          .footer-desktop { display: none !important; }
          .footer-mobile { display: grid !important; }
        }
      `}</style>
    </footer>
  );
}

const styles: Record<string, CSSProperties> = {
  footer: {
    position: "relative",
    color: COLORS.text,
    padding: "64px 16px 28px",
    overflow: "hidden",
  },

  bgGradient: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(1200px circle at 10% -10%, #3a6bff33, transparent 50%)," +
      "radial-gradient(900px circle at 90% 10%, #8b5cf633, transparent 45%)," +
      `linear-gradient(180deg, ${COLORS.bgTop} 0%, ${COLORS.bgMid} 45%, ${COLORS.bgBottom} 100%)`,
    zIndex: -1,
  },

  container: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "grid",
    gap: 20,
  },

  newsletterBox: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.boxBorder}`,
    borderRadius: 18,
    padding: "22px 18px",
    textAlign: "center",

    // ✅ FIX: empêche l’input de “déborder” visuellement hors du card arrondi
    overflow: "hidden",
    boxSizing: "border-box",
  },

  newsTitle: {
    fontSize: "1.5rem",
    fontWeight: 900,
    margin: "0 0 6px",
  },
  newsSub: {
    margin: 0,
    color: COLORS.muted,
    fontSize: "1rem",
    fontWeight: 600,
  },

  newsForm: {
    marginTop: 14,
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 10,
    alignItems: "center",

    // ✅ FIX: le form ne dépassera jamais le bloc
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",

    // ✅ FIX: petit padding interne = l’input ne touche jamais le bord du card
    paddingInline: 6,
  },

  newsInput: {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box",

    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${COLORS.boxBorder}`,
    borderRadius: 10,
    padding: "12px 14px",
    color: COLORS.text,
    fontSize: "1rem",
    outline: "none",
  },

  newsBtn: {
    minWidth: 0,
    boxSizing: "border-box",
    padding: "12px 18px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    color: "white",
    fontWeight: 900,
    fontSize: "1rem",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    boxShadow: "0 8px 18px rgba(106,47,214,0.35)",
    whiteSpace: "nowrap",
  },

  // Desktop columns (3 cards)
  columns: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 14,
  },

  // Mobile wrapper (hidden by default, shown via CSS)
  mobileWrap: {
    display: "none",
    gap: 14,
  },

  colCard: {
    background: COLORS.cardBg,
    border: `1px solid ${COLORS.boxBorder}`,
    borderRadius: 16,
    padding: "16px 16px",
    minHeight: 220,
  },
  colTitle: {
    fontSize: "1.05rem",
    fontWeight: 900,
    margin: "0 0 10px",
  },

  colList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: 6,
    fontWeight: 600,
    color: "#e6e9ff",
  },

  colListCompact: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: 6,
    fontWeight: 600,
    color: "#e6e9ff",
  },

  mobileTwoCols: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    alignItems: "start",
  },

  link: {
    color: "#e6e9ff",
    textDecoration: "none",
  },

  infoLine: {
    marginBottom: 8,
    color: "#e6e9ff",
    fontWeight: 600,
  },

  bottomBar: {
    marginTop: 8,
    paddingTop: 12,
    borderTop: `1px dashed ${COLORS.boxBorder}`,
    textAlign: "center",
    color: COLORS.muted,
    fontWeight: 800,
  },
};
