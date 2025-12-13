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
        <span data-label="text" style={styles.label}>Mon compte</span>
      </Link>

      <style>{`
        /* 📱 MOBILE (iPhone, Android) — rétrécir et décaler */
        @media (max-width: 700px) {
          .float-account-btn {
            top: 18px !important;
            right: 120px !important; /* 👉 décale vers la gauche pour libérer de la place au panier */
            padding: 6px 10px !important;
            font-size: 0.72rem !important;
            gap: 4px !important;
          }
        }

        /* 📱 Très petit écran — uniquement l'icône */
        @media (max-width: 400px) {
          .float-account-btn [data-label="text"] {
            display: none;
          }
          .float-account-btn {
            right: 100px !important;
            padding: 6px !important;
          }
        }
      `}</style>
    </>
  );
}

const styles: Record<string, CSSProperties> = {
  button: {
    position: "fixed",
    top: 18,
    right: 100, // Desktop OK
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
    width: 20,
    height: 20,
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
