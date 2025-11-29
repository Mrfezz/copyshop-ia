"use client";

// app/_components/Footer.tsx
import type React from "react";
import { useState } from "react";

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

export default function Footer() {
  const [email, setEmail] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    // Ici tu peux brancher un vrai service newsletter plus tard
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
          <h3 style={styles.newsTitle}>Abonne-vous à notre newsletter !</h3>
          <p style={styles.newsSub}>
            Recevez dans votre boîte mail des réductions, des conseils et nos
            nouveaux arrivages.
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

        {/* Colonnes */}
        <section style={styles.columns} className="footer-cols">
          {/* Pages légales */}
          <div style={styles.colCard}>
            <h4 style={styles.colTitle}>Pages légales</h4>
            <ul style={styles.colList}>
              <li>Conditions de service</li>
              <li>Politique d’expédition</li>
              <li>Conditions de vente</li>
              <li>Politique de remboursement</li>
              <li>Politique de confidentialité</li>
              <li>Mentions légales</li>
            </ul>
          </div>

          {/* Navigation */}
          <div style={styles.colCard}>
            <h4 style={styles.colTitle}>Navigation</h4>
            <ul style={styles.colList}>
              <li><a href="/" style={styles.link}>Accueil</a></li>
              <li><a href="/packs-ia" style={styles.link}>Packs IA</a></li>
              <li><a href="/services-digitaux" style={styles.link}>Services digitaux</a></li>
              <li><a href="/newsletter" style={styles.link}>Newsletter</a></li>
              <li><a href="/suivre-ma-commande" style={styles.link}>Suivre ma commande</a></li>
              <li><a href="/contact" style={styles.link}>Contact</a></li>
              <li><a href="/qui-sommes-nous" style={styles.link}>Qui sommes-nous ?</a></li>
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

        {/* Bas footer */}
        <div style={styles.bottomBar}>
          © {new Date().getFullYear()} Copyshop IA — by Mr Fez
        </div>
      </div>

      {/* Responsive rapide */}
      <style>{`
        @media (max-width: 980px) {
          .footer-cols {
            grid-template-columns: 1fr !important;
          }
          .foot-news-form {
            grid-template-columns: 1fr !important;
          }
          .foot-news-form button {
            width: 100% !important;
          }
        }
      `}</style>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
    maxWidth: 640,
    marginInline: "auto",
  },
  newsInput: {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${COLORS.boxBorder}`,
    borderRadius: 10,
    padding: "12px 14px",
    color: COLORS.text,
    fontSize: "1rem",
    outline: "none",
  },
  newsBtn: {
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

  columns: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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
