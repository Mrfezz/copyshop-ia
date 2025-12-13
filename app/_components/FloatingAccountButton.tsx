"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

const COLORS = {
  violetDeep: "#4338ca",
  violet: "#6a2fd6",
  pink: "#e64aa7",
};

export default function FloatingAccountButton() {
  return (
    <>
      <Link
        href="/compte-client"
        className="float-account-btn"
        style={styles.button}
      >
        <span style={styles.icon}>👤</span>
        <span className="account-text" style={styles.label}>Mon compte</span>
      </Link>

      <style>{`
        /* 📱 Mobile : on masque le texte */
        @media (max-width: 700px) {
          .account-text {
            display: none !important;
          }

          .float-account-btn {
            top: 64px !important;
            right: 16px !important;
            padding: 10px !important;
            width: 45px !important;
            height: 45px !important;
            border-radius: 999px !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </>
  );
}

const styles: Record<string, CSSProperties> = {
  // Desktop par défaut (texte visible)
  button: {
    position: "fixed",
    top: 18,
    right: 90, // juste à côté du panier
    zIndex: 70,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: "0.9rem",
    color: "#ffffff",
    textDecoration: "none",
    background: `linear-gradient(90deg, ${COLORS.violetDeep}, ${COLORS.violet}, ${COLORS.pink})`,
    boxShadow: "0 10px 24px rgba(106,47,214,0.45)",
    backdropFilter: "blur(8px)",
  },
  icon: {
    width: 22,
    height: 22,
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.6)",
    display: "grid",
    placeItems: "center",
    fontSize: "0.8rem",
    background: "rgba(15,23,42,0.85)",
  },
  label: {
    display: "inline-block",
  },
};
