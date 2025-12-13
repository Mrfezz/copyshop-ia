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
        <span style={styles.label}>Mon compte</span>
      </Link>

      {/* Responsive : sur mobile on garde juste l'icône */}
      <style>{`
        @media (max-width: 640px) {
          .float-account-btn {
            padding-inline: 10px !important;
            gap: 4px !important;
            font-size: 0.8rem !important;
          }
          .float-account-btn span[data-label="text"] {
            display: none;
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
    right: 90, // décalé pour laisser la place au panier
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
    fontSize: "0.9rem",
    background: "rgba(15,23,42,0.85)",
  },
  label: {
    display: "inline-block",
  } as CSSProperties,
};
